# Integração Redis Event Bus

Este documento descreve a configuração completa do Event Bus com Redis Streams no projeto Belezeiro.

## Visão Geral

O sistema utiliza Redis Streams como infraestrutura de mensageria para eventos de domínio, permitindo processamento assíncrono e desacoplado entre módulos.

## Componentes

### 1. RedisClient ([packages/core/infra/clients/redis-client.ts](packages/core/infra/clients/redis-client.ts))

Cliente singleton do Redis com:
- Reconexão automática
- Health check
- Monitoramento de status
- Logs detalhados de conexão

**Configuração:**
```typescript
export const redisClient = new RedisClient()
export const redis = redisClient.getClient()
```

### 2. RedisEventBus ([packages/core/infra/clients/redis-event-bus.ts](packages/core/infra/clients/redis-event-bus.ts))

Implementação do `IEventBus` usando Redis Streams:

**Funcionalidades:**
- Publicação de eventos únicos
- Publicação em batch (pipeline)
- Formato de stream: `events:{event.type}`
- Persistência automática de eventos

**Exemplo de uso:**
```typescript
const eventBus = makeEventBus();
await eventBus.publish(event);
```

### 3. Factory do EventBus ([packages/core/main/factories/make-event-bus.factory.ts](packages/core/main/factories/make-event-bus.factory.ts))

Factory singleton que cria a instância apropriada do Event Bus baseada no ambiente:

- **Development/Test:** Redis local
- **Staging:** Redis (futuro: + SQS)
- **Production:** Redis (futuro: + EventBridge)

**Uso:**
```typescript
import { makeEventBus } from "@core/main/factories/make-event-bus.factory";

const eventBus = makeEventBus();
```

### 4. RedisQueueProcessor ([packages/server/infra/queue/redis-queue-processor.ts](packages/server/infra/queue/redis-queue-processor.ts))

Processador de filas que consome eventos do Redis Streams:

**Características:**
- Consumer Groups para processamento distribuído
- ACK automático de mensagens
- Suporte a múltiplos handlers por evento
- Graceful shutdown

**Arquitetura:**
```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Use Case  │ ──────> │ RedisEventBus│ ──────> │Redis Streams│
└─────────────┘         └──────────────┘         └─────────────┘
                                                         │
                                                         │
                                                         v
                                                  ┌─────────────┐
                                                  │Queue        │
                                                  │Processor    │
                                                  └─────────────┘
                                                         │
                                                         v
                                                  ┌─────────────┐
                                                  │Event        │
                                                  │Handlers     │
                                                  └─────────────┘
```

## Integração com Módulos

### IAM Module

O módulo IAM usa o EventBus para publicar eventos de autenticação:

**Factory JWT Service:** [packages/iam/main/factories/services/make-jwt-service.factory.ts](packages/iam/main/factories/services/make-jwt-service.factory.ts)
- Corrigido para usar `envGlobal.JWT_SECRET`

**Use Case:** [packages/iam/app/usecases/authenticate-user-with-google.usecase.ts](packages/iam/app/usecases/authenticate-user-with-google.usecase.ts)
```typescript
const eventBus = makeEventBus();
user.authenticated(created, "google");
const events = user.getDomainEvents();
for (const event of events) {
  await eventBus.publish(event);
}
```

### Business Module

O módulo Business usa o EventBus através das factories:

**Factories:** [packages/business/main/factories/usecases/](packages/business/main/factories/usecases/)
- Todas as factories injetam `makeEventBus()` nos use cases

## Event Handlers

### Handlers Registrados

1. **UserAuthenticatedHandler** ([packages/server/infra/handlers/user-authenticated.handler.ts](packages/server/infra/handlers/user-authenticated.handler.ts))
   - Evento: `iam.user.authenticated.v1`
   - Ações:
     - Envia email de boas-vindas para novos usuários
     - Registra analytics
     - Atualiza cache

### Criar Novos Handlers

1. Crie um arquivo em [packages/server/infra/handlers/](packages/server/infra/handlers/):

```typescript
import { EventHandler } from "../queue/redis-queue-processor";
import { DOMAIN_EVENTS } from "@core/domain/events/event-registry";

export class MyEventHandler implements EventHandler {
  eventName = DOMAIN_EVENTS.MY_CONTEXT.MY_EVENT;

  async handle(event: any): Promise<void> {
    // Sua lógica aqui
  }
}
```

2. Registre em [packages/server/infra/handlers/index.ts](packages/server/infra/handlers/index.ts):

```typescript
export function getAllHandlers(): EventHandler[] {
  return [
    new UserAuthenticatedHandler(),
    new MyEventHandler(), // <-- Adicione aqui
  ];
}
```

## Configuração

### Variáveis de Ambiente

**Global (.env):**
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
```

**Server (packages/server/.env):**
```env
PORT=3000
HOST=0.0.0.0
NODE_ENV=development
JWT_SECRET=your-jwt-secret-here
REDIS_URL=redis://localhost:6379
```

## Testando a Integração

### 1. Iniciar Redis (Docker)

O projeto usa Redis em Docker:
```bash
docker ps | grep redis
# Saída esperada: redis:8.0-alpine ... Up ... 0.0.0.0:6379->6379/tcp
```

### 2. Iniciar o Servidor

```bash
cd packages/server
bun run dev
```

**Saída esperada:**
```
✓ Environment variables loaded successfully
[Redis] Connecting to localhost:6379...
[Redis] Connected and ready! (attempt 1)
[QueueProcessor] Registered handler for event: iam.user.authenticated.v1
[QueueProcessor] Starting queue processor...
[QueueProcessor] Created consumer group for events:iam.user.authenticated.v1

🚀 Server is running!
```

### 3. Testar Health Check

```bash
curl http://localhost:3000/health
```

## Fluxo de Eventos

### Publicação

1. Use case executa lógica de negócio
2. Entidade emite evento de domínio (`entity.domainEvent()`)
3. Use case obtém eventos (`entity.getDomainEvents()`)
4. Use case publica eventos via EventBus (`eventBus.publish(event)`)
5. RedisEventBus escreve no Redis Stream

### Consumo

1. RedisQueueProcessor lê do Redis Stream via Consumer Group
2. Processa eventos em batch (10 por vez)
3. Executa handlers registrados para cada evento
4. Confirma processamento (ACK)
5. Continua loop de processamento

## Monitoramento

### Logs do Redis

```
[Redis] Connecting to localhost:6379...
[Redis] Connected and ready! (attempt 1)
[Redis] Reconnecting in 100ms...
[Redis] Connection error: ...
```

### Logs do Queue Processor

```
[QueueProcessor] Registered handler for event: iam.user.authenticated.v1
[QueueProcessor] Starting queue processor...
[QueueProcessor] Created consumer group for events:iam.user.authenticated.v1
[QueueProcessor] Successfully handled iam.user.authenticated.v1 with UserAuthenticatedHandler
```

### Inspecionar Redis Streams

```bash
# Ver streams existentes
docker exec redis redis-cli KEYS "events:*"

# Ver mensagens de um stream
docker exec redis redis-cli XRANGE events:iam.user.authenticated.v1 - +

# Ver consumer groups
docker exec redis redis-cli XINFO GROUPS events:iam.user.authenticated.v1

# Ver pending messages
docker exec redis redis-cli XPENDING events:iam.user.authenticated.v1 belezeiro-server
```

## Troubleshooting

### Redis não conecta

```bash
# Verificar se Redis está rodando
docker ps | grep redis

# Testar conexão
docker exec redis redis-cli ping
# Saída esperada: PONG

# Verificar logs do container
docker logs redis
```

### Eventos não são processados

1. Verificar se handlers estão registrados:
   - Logs devem mostrar: `[QueueProcessor] Registered handler for event: ...`

2. Verificar se consumer group foi criado:
   ```bash
   docker exec redis redis-cli XINFO GROUPS events:iam.user.authenticated.v1
   ```

3. Verificar mensagens pendentes:
   ```bash
   docker exec redis redis-cli XPENDING events:iam.user.authenticated.v1 belezeiro-server
   ```

### Erro de importação

- Certifique-se de usar `envGlobal` do `@core/infra/config/env-global`
- JWT_SECRET está em `envGlobal`, não em `envIam`

## Próximos Passos

1. [ ] Implementar DLQ (Dead Letter Queue) para mensagens com erro
2. [ ] Adicionar retry policy configurável
3. [ ] Implementar métricas de processamento
4. [ ] Adicionar suporte a SQS para staging
5. [ ] Adicionar suporte a EventBridge para produção
6. [ ] Implementar event replay para reprocessamento
