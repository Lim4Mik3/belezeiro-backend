# Event-Driven Architecture - Implementação Completa

## 🎯 Visão Geral

Sistema de eventos totalmente **plug-and-play** para múltiplos message brokers:
- ✅ **Redis Streams** (desenvolvimento/cache)
- ✅ **AWS SQS** (queues confiáveis)
- ✅ **AWS EventBridge** (event routing)
- ✅ **Kafka** (futuro)
- ✅ **RabbitMQ** (futuro)

## 📦 Componentes Implementados

### 1. Event Envelope Pattern
**Arquivo:** `packages/core/bus/i-event-bus.ts`

Estrutura universal que funciona com qualquer broker:

```typescript
interface IDomainEvent<T> {
  id: string;              // UUID único
  type: string;            // Ex: "iam.user.authenticated.v1"
  version: string;         // "1.0.0"
  source: string;          // "iam-service"
  timestamp: Date;
  correlationId?: string;  // Rastreamento de jornada
  causationId?: string;    // Evento que causou este
  data: T;                 // Payload específico
  metadata?: object;       // Broker-specific (SQS MessageGroupId, etc)
}
```

### 2. Event Registry
**Arquivo:** `packages/core/domain/events/event-registry.ts`

Catálogo centralizado de todos os eventos do sistema:

```typescript
export const DOMAIN_EVENTS = {
  IAM: {
    USER_AUTHENTICATED: "iam.user.authenticated.v1",
    USER_REGISTERED: "iam.user.registered.v1",
  },
} as const;

export const EVENT_SOURCES = {
  IAM: "iam-service",
} as const;
```

**Benefícios:**
- Type-safe (TypeScript valida)
- Autocomplete no IDE
- Documentação viva
- Previne duplicação de nomes

### 3. Base Domain Event
**Arquivo:** `packages/core/domain/events/base-domain-event.ts`

Classe abstrata que gera automaticamente ID, timestamp, etc:

```typescript
export abstract class BaseDomainEvent<T> implements IDomainEvent<T> {
  readonly id: string;           // Auto-gerado (UUID)
  readonly timestamp: Date;      // Auto-gerado

  constructor(
    readonly type: DomainEventType,
    readonly version: string,
    readonly source: EventSource,
    readonly data: T,
    options?: { correlationId?, causationId?, metadata? }
  ) {
    this.id = randomUUID();
    this.timestamp = new Date();
    // ...
  }
}
```

### 4. Event Bus Implementations

#### Redis Event Bus
**Arquivo:** `packages/core/infra/clients/redis-event-bus.ts`

- Usa **Redis Streams** (persistente, suporta consumer groups)
- Stream name: `events:{event.type}`
- Suporte a batch (pipeline)

#### SQS Event Bus
**Arquivo:** `packages/core/infra/clients/sqs-event-bus.ts`

- Suporta **Standard** e **FIFO** queues
- Message attributes para filtros
- Batch até 10 mensagens
- Deduplicação automática (FIFO)

#### EventBridge Event Bus
**Arquivo:** `packages/core/infra/clients/eventbridge-event-bus.ts`

- Event routing para múltiplos targets
- Schema registry support
- Archive & replay
- Cross-account delivery

#### Composite Event Bus
**Arquivo:** `packages/core/infra/clients/composite-event-bus.ts`

Publica em **múltiplos destinos simultaneamente**:

```typescript
const eventBus = new CompositeEventBus([
  redisEventBus,      // Para cache local
  sqsEventBus,        // Para workers
  eventBridgeEventBus // Para integrações AWS
]);

// Um único publish() vai para todos!
await eventBus.publish(event);
```

### 5. Factory Pattern
**Arquivo:** `packages/core/main/factories/make-event-bus.factory.ts`

Configura o broker apropriado por ambiente:

```typescript
export function makeEventBus(): IEventBus {
  switch (process.env.NODE_ENV) {
    case "development":
      return new RedisEventBus(redisClient);

    case "staging":
      return new CompositeEventBus([
        new RedisEventBus(redisClient),
        new SQSEventBus(sqsClient, queueUrl)
      ]);

    case "production":
      return new CompositeEventBus([
        new EventBridgeEventBus(ebClient),
        new RedisEventBus(redisClient) // Cache
      ]);
  }
}
```

## 🔄 Fluxo Completo

### 1. Criar Evento

```typescript
// packages/iam/domain/events/user-authenticated.event.ts
export class UserAuthenticatedEvent extends BaseDomainEvent<UserAuthenticatedData> {
  constructor(data: UserAuthenticatedData, options?) {
    super(
      DOMAIN_EVENTS.IAM.USER_AUTHENTICATED,
      "1.0.0",
      EVENT_SOURCES.IAM,
      data,
      options
    );
  }
}
```

### 2. Registrar na Entidade

```typescript
// packages/iam/domain/entities/user-entity.ts
export class UserEntity extends BaseEntity {
  authenticated(isNewUser: boolean, provider?: string) {
    this.addDomainEvent(
      new UserAuthenticatedEvent({
        userId: this.id,
        email: this.email.value,
        isNewUser,
        provider,
        authenticatedAt: new Date()
      })
    );
  }
}
```

### 3. Publicar no UseCase

```typescript
// packages/iam/app/usecases/authenticate-user-with-google.usecase.ts
async execute(input: Input): Promise<Output> {
  // ... lógica de autenticação

  user.authenticated(created, "google");

  // Coletar eventos
  const events = user.getDomainEvents();

  // Publicar (vai para Redis/SQS/EventBridge conforme config)
  for (const event of events) {
    await this.EventBus.publish(event);
  }

  user.clearDomainEvents();

  return { token, created };
}
```

## 🔍 Rastreamento Distribuído

### Correlation ID (Jornada completa)

```typescript
// Primeiro evento da jornada
const correlationId = randomUUID();

const event = new UserAuthenticatedEvent(
  { ... },
  { correlationId }
);

// Todos os eventos subsequentes usam o mesmo correlationId
```

### Causation ID (Cadeia de eventos)

```typescript
// Evento A
const eventA = new UserAuthenticatedEvent({ ... });
await eventBus.publish(eventA);

// Evento B (causado por A)
const eventB = new WelcomeEmailSentEvent(
  { ... },
  {
    correlationId: eventA.correlationId,
    causationId: eventA.id  // ← Evento A causou B
  }
);
await eventBus.publish(eventB);
```

## 🔌 Consumindo Eventos

### Redis Streams (Consumer Group)

```typescript
const client = redis.getClient();

// Criar consumer group (uma vez)
await client.xgroup(
  "CREATE",
  "events:iam.user.authenticated.v1",
  "email-service",
  "0",
  "MKSTREAM"
);

// Consumir
while (true) {
  const messages = await client.xreadgroup(
    "GROUP", "email-service", "worker-1",
    "BLOCK", 5000,
    "STREAMS", "events:iam.user.authenticated.v1", ">"
  );

  for (const [stream, entries] of messages || []) {
    for (const [messageId, fields] of entries) {
      const event = parseEvent(fields);
      await handleEvent(event);

      // Acknowledge
      await client.xack(stream, "email-service", messageId);
    }
  }
}
```

### SQS (Long Polling)

```typescript
const command = new ReceiveMessageCommand({
  QueueUrl: process.env.SQS_QUEUE_URL,
  MaxNumberOfMessages: 10,
  WaitTimeSeconds: 20,
});

const response = await sqsClient.send(command);

for (const message of response.Messages || []) {
  const event = JSON.parse(message.Body!);
  await handleEvent(event);

  // Delete após processar
  await sqsClient.send(new DeleteMessageCommand({
    QueueUrl: process.env.SQS_QUEUE_URL,
    ReceiptHandle: message.ReceiptHandle
  }));
}
```

### EventBridge (Lambda)

```typescript
// serverless.yml
functions:
  userAuthenticatedHandler:
    handler: handlers/user-authenticated.handler
    events:
      - eventBridge:
          eventBus: ${env:EVENTBRIDGE_BUS_NAME}
          pattern:
            source:
              - iam-service
            detail-type:
              - iam.user.authenticated.v1

// handlers/user-authenticated.ts
export const handler = async (event: EventBridgeEvent) => {
  const domainEvent = event.detail;

  if (domainEvent.data.isNewUser) {
    await sendWelcomeEmail(domainEvent.data.email);
  }
};
```

## 📊 Metadados Broker-Specific

### SQS FIFO

```typescript
await eventBus.publish({
  ...event,
  metadata: {
    messageGroupId: user.id,     // Garante ordem por usuário
    deduplicationId: event.id,   // Previne duplicatas em 5min
  }
});
```

### EventBridge Routing

```typescript
await eventBus.publish({
  ...event,
  metadata: {
    resources: [`user/${user.id}`], // Para routing rules
  }
});
```

## ✅ Checklist de Implementação

- [x] IDomainEvent interface com envelope pattern
- [x] Event Registry centralizado
- [x] BaseDomainEvent class
- [x] RedisEventBus implementation
- [x] SQSEventBus implementation
- [x] EventBridgeEventBus implementation
- [x] CompositeEventBus para múltiplos destinos
- [x] Factory pattern (makeEventBus)
- [x] UserAuthenticatedEvent exemplo completo
- [x] UseCase integration
- [x] Documentação completa

## 🚀 Próximos Passos

1. **Configurar AWS SDK** (quando for deploy)
   ```bash
   bun add @aws-sdk/client-sqs @aws-sdk/client-eventbridge
   ```

2. **Criar Event Handlers** (consumers)
   - `WelcomeEmailHandler` (envia email de boas-vindas)
   - `AnalyticsTracker` (registra eventos no analytics)
   - `CacheInvalidator` (limpa cache)

3. **Implementar Dead Letter Queue**
   - Para eventos que falharam após N tentativas
   - Monitoramento e alertas

4. **Adicionar Observability**
   - Logs estruturados (JSON)
   - Metrics (eventos publicados/consumidos)
   - Tracing (OpenTelemetry)

5. **Schema Registry** (futuro)
   - Validação automática de payloads
   - Evolução de schemas (backward/forward compatibility)

## 📚 Recursos

- [Event-Driven Architecture](https://martinfowler.com/articles/201701-event-driven.html)
- [Redis Streams](https://redis.io/docs/data-types/streams/)
- [AWS SQS](https://docs.aws.amazon.com/sqs/)
- [AWS EventBridge](https://docs.aws.amazon.com/eventbridge/)
- [Domain Events](https://martinfowler.com/eaaDev/DomainEvent.html)
