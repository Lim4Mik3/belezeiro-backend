# Event Bus - Guia de Uso

## Estrutura Implementada

### 1. Event Envelope Pattern

Todos os eventos seguem um padrão de envelope que contém:

```typescript
{
  id: string;              // UUID único
  type: string;            // "iam.user.authenticated.v1"
  version: string;         // "1.0.0"
  source: string;          // "iam-service"
  timestamp: Date;
  correlationId?: string;  // Rastreamento de jornada
  causationId?: string;    // Evento que causou este
  data: T;                 // Payload específico
  metadata?: object;       // Metadados broker-specific
}
```

### 2. Registry Centralizado

Todos os tipos de eventos são definidos em `packages/core/domain/events/event-registry.ts`:

```typescript
export const DOMAIN_EVENTS = {
  IAM: {
    USER_AUTHENTICATED: "iam.user.authenticated.v1",
    USER_REGISTERED: "iam.user.registered.v1",
  },
} as const;
```

**Benefícios:**
- ✅ Autocomplete
- ✅ Type-safe
- ✅ Documentação centralizada
- ✅ Previne duplicação

## Como Criar um Novo Evento

### Passo 1: Adicionar ao Registry

```typescript
// packages/core/domain/events/event-registry.ts
export const DOMAIN_EVENTS = {
  IAM: {
    USER_AUTHENTICATED: "iam.user.authenticated.v1",
    USER_REGISTERED: "iam.user.registered.v1", // ← NOVO
  },
} as const;
```

### Passo 2: Criar a Classe do Evento

```typescript
// packages/iam/domain/events/user-registered.event.ts
import { BaseDomainEvent } from "@core/domain/events/base-domain-event";
import { DOMAIN_EVENTS, EVENT_SOURCES } from "@core/domain/events/event-registry";

export type UserRegisteredData = {
  userId: string;
  email: string;
  name: string;
  registeredAt: Date;
};

export class UserRegisteredEvent extends BaseDomainEvent<UserRegisteredData> {
  constructor(
    data: UserRegisteredData,
    options?: {
      correlationId?: string;
      causationId?: string;
      metadata?: Record<string, any>;
    }
  ) {
    super(
      DOMAIN_EVENTS.IAM.USER_REGISTERED,
      "1.0.0",
      EVENT_SOURCES.IAM,
      data,
      options
    );
  }
}
```

### Passo 3: Emitir o Evento na Entidade

```typescript
// packages/iam/domain/entities/user-entity.ts
export class UserEntity extends BaseEntity<Props> {
  register() {
    this.addDomainEvent(
      new UserRegisteredEvent({
        userId: this.id,
        email: this.email.value,
        name: this.name,
        registeredAt: new Date()
      })
    );
  }
}
```

### Passo 4: Publicar no UseCase

```typescript
// packages/iam/app/usecases/register-user.usecase.ts
async execute(input: Input): Promise<Output> {
  const user = new UserEntity({ ... });
  user.register();

  await this.UserRepository.create(user);

  // Publicar eventos
  const events = user.getDomainEvents();
  for (const event of events) {
    await this.EventBus.publish(event);
  }
  user.clearDomainEvents();

  return { userId: user.id };
}
```

## Configuração de Event Buses

### Opção 1: Redis (Desenvolvimento Local)

```typescript
// packages/core/main/factories/make-event-bus.factory.ts
import { RedisEventBus } from "@core/infra/clients/redis-event-bus";
import { RedisClient } from "@core/infra/clients/redis-client";

export function makeEventBus() {
  const redisClient = new RedisClient({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  });

  return new RedisEventBus(redisClient);
}
```

### Opção 2: SQS (Produção AWS)

```typescript
import { SQSClient } from "@aws-sdk/client-sqs";
import { SQSEventBus } from "@core/infra/clients/sqs-event-bus";

export function makeEventBus() {
  const sqsClient = new SQSClient({ region: "us-east-1" });

  return new SQSEventBus(
    sqsClient,
    process.env.SQS_QUEUE_URL!,
    true // FIFO
  );
}
```

### Opção 3: EventBridge (Produção AWS)

```typescript
import { EventBridgeClient } from "@aws-sdk/client-eventbridge";
import { EventBridgeEventBus } from "@core/infra/clients/eventbridge-event-bus";

export function makeEventBus() {
  const eventBridgeClient = new EventBridgeClient({ region: "us-east-1" });

  return new EventBridgeEventBus(
    eventBridgeClient,
    process.env.EVENTBRIDGE_BUS_NAME || "default"
  );
}
```

### Opção 4: Múltiplos Destinos (Composite)

```typescript
import { CompositeEventBus } from "@core/infra/clients/composite-event-bus";

export function makeEventBus() {
  const redis = new RedisEventBus(redisClient);
  const sqs = new SQSEventBus(sqsClient, queueUrl);
  const eventBridge = new EventBridgeEventBus(ebClient);

  // Publica em todos simultaneamente
  return new CompositeEventBus([redis, sqs, eventBridge]);
}
```

## Rastreamento Distribuído

### Usando Correlation ID

```typescript
// No primeiro evento da jornada
const correlationId = randomUUID();

user.authenticated(created, "google");
const event = user.getDomainEvents()[0];

// Propagar correlation ID
const eventWithCorrelation = {
  ...event,
  correlationId
};

await this.EventBus.publish(eventWithCorrelation);
```

### Usando Causation ID

```typescript
// Evento A causa Evento B
const eventA = new UserAuthenticatedEvent({ ... });
await this.EventBus.publish(eventA);

// Evento B referencia evento A
const eventB = new WelcomeEmailSentEvent(
  { ... },
  {
    correlationId: eventA.correlationId,
    causationId: eventA.id // ← Evento A causou B
  }
);
await this.EventBus.publish(eventB);
```

## Consumindo Eventos

### Redis Streams

```typescript
// Consumer example
const client = await redisClient.getClient();

const messages = await client.xread(
  "BLOCK", 5000,
  "STREAMS", "events:iam.user.authenticated.v1", "0"
);

for (const [stream, entries] of messages || []) {
  for (const [id, fields] of entries) {
    const event = {
      id: fields[fields.indexOf("id") + 1],
      type: fields[fields.indexOf("type") + 1],
      data: JSON.parse(fields[fields.indexOf("data") + 1]),
      // ... etc
    };

    await handleUserAuthenticated(event);
  }
}
```

### SQS

```typescript
import { SQSClient, ReceiveMessageCommand } from "@aws-sdk/client-sqs";

const command = new ReceiveMessageCommand({
  QueueUrl: process.env.SQS_QUEUE_URL,
  MaxNumberOfMessages: 10,
  WaitTimeSeconds: 20,
});

const response = await sqsClient.send(command);

for (const message of response.Messages || []) {
  const event = JSON.parse(message.Body!);
  await handleEvent(event);
}
```

### EventBridge (via Lambda)

```typescript
// Lambda handler
export const handler = async (event: EventBridgeEvent) => {
  const domainEvent = JSON.parse(event.detail);

  if (domainEvent.type === DOMAIN_EVENTS.IAM.USER_AUTHENTICATED) {
    await handleUserAuthenticated(domainEvent);
  }
};
```

## Metadados Broker-Specific

### SQS FIFO

```typescript
const event = new UserAuthenticatedEvent({ ... });

await eventBus.publish({
  ...event,
  metadata: {
    messageGroupId: user.id,        // Garante ordem por usuário
    deduplicationId: event.id,      // Previne duplicatas
  }
});
```

### EventBridge Resources

```typescript
await eventBus.publish({
  ...event,
  metadata: {
    resources: [`user/${user.id}`], // Para routing rules
  }
});
```

## Batch Publishing (Performance)

```typescript
// Coletar múltiplos eventos
const events: IDomainEvent[] = [];

user.authenticated(true);
events.push(...user.getDomainEvents());
user.clearDomainEvents();

order.created();
events.push(...order.getDomainEvents());
order.clearDomainEvents();

// Publicar em batch (mais eficiente)
await this.EventBus.publishBatch(events);
```

## Testando

```typescript
import { describe, it, expect, mock } from "bun:test";

describe("UserAuthenticationUseCase", () => {
  it("should publish UserAuthenticatedEvent", async () => {
    const mockEventBus = {
      publish: mock(() => Promise.resolve()),
      publishBatch: mock(() => Promise.resolve()),
    };

    const useCase = new AuthenticateUserWithGoogleUseCase(
      mockRepo,
      mockJWT,
      mockEventBus
    );

    await useCase.execute({ ... });

    expect(mockEventBus.publish).toHaveBeenCalledTimes(1);

    const publishedEvent = mockEventBus.publish.mock.calls[0][0];
    expect(publishedEvent.type).toBe(DOMAIN_EVENTS.IAM.USER_AUTHENTICATED);
    expect(publishedEvent.data.isNewUser).toBe(true);
  });
});
```

## Migration Strategy

### Fase 1: Desenvolvimento (Redis)
```typescript
const eventBus = new RedisEventBus(redisClient);
```

### Fase 2: Staging (Redis + SQS)
```typescript
const eventBus = new CompositeEventBus([
  new RedisEventBus(redisClient),
  new SQSEventBus(sqsClient, queueUrl)
]);
```

### Fase 3: Produção (EventBridge + Redis para cache)
```typescript
const eventBus = new CompositeEventBus([
  new EventBridgeEventBus(ebClient),
  new RedisEventBus(redisClient) // Cache layer
]);
```
