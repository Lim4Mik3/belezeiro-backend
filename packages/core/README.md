# Core Package

Pacote central contendo contratos, abstrações e utilitários compartilhados por todos os módulos da aplicação.

## 📦 Estrutura

```
core/
├── app/
│   ├── contracts/          # Interfaces e contratos
│   │   ├── i-cache-repository.ts
│   │   └── i-authz-snapshot.ts
│   └── services/           # Serviços compartilhados
│       └── authorization.service.ts
├── bus/
│   └── i-event-bus.ts      # Contrato do Event Bus
├── domain/
│   ├── entities/           # Entidades base
│   ├── events/             # Event registry
│   └── services/           # Serviços de domínio
├── infra/
│   ├── clients/            # Clientes de infraestrutura
│   │   ├── redis-client.ts
│   │   ├── redis-event-bus.ts
│   │   └── mongodb-client.ts
│   └── repositories/       # Repositórios de infraestrutura
│       ├── redis-cache-repository.ts
│       └── upstash-cache-repository.ts
└── main/
    └── factories/          # Factories (Dependency Injection)
        ├── make-cache-repository.factory.ts
        └── make-event-bus.factory.ts
```

## 🏗️ Arquitetura - Desacoplamento com Factories

Este pacote implementa **Dependency Injection** através de **Factory Pattern** para desacoplar implementações concretas dos contratos.

### Por que usar Factories?

✅ **Desacoplamento**: Troque Redis por Upstash, CloudFlare KV, etc. sem mudar código
✅ **Testabilidade**: Mock fácil em testes unitários
✅ **Singleton**: Evita múltiplas instâncias desnecessárias
✅ **Configuração centralizada**: Um único ponto de configuração

### Camadas de Abstração

```
┌─────────────────────────────────────────┐
│         Application Layer               │
│  (UseCases, Services, Handlers)         │
└──────────────┬──────────────────────────┘
               │ uses
               ↓
┌─────────────────────────────────────────┐
│           Factories                     │
│  makeCacheRepository()                  │
│  makeEventBus()                         │
└──────────────┬──────────────────────────┘
               │ returns
               ↓
┌─────────────────────────────────────────┐
│          Contracts                      │
│  ICacheRepository                       │
│  IEventBus                              │
└──────────────┬──────────────────────────┘
               │ implemented by
               ↓
┌─────────────────────────────────────────┐
│        Infrastructure                   │
│  RedisCacheRepository ← default         │
│  UpstashCacheRepository ← USE_UPSTASH   │
│  RedisEventBus                          │
└─────────────────────────────────────────┘
```

## 🚀 Como Usar

### Cache Repository

Para operações de cache com serialização automática de JSON:

```typescript
import { makeCacheRepository } from '@core/main/factories'
import type { ICacheRepository } from '@core/app/contracts/i-cache-repository'

// Em um UseCase ou Service
class MyUseCase {
  constructor(
    private cacheRepository: ICacheRepository
  ) {}

  async execute() {
    // Get
    const user = await this.cacheRepository.get<User>('user:123')

    // Set with TTL (em segundos)
    await this.cacheRepository.set('user:123', userData, 3600)

    // Delete
    await this.cacheRepository.del('user:123')

    // Delete multiple keys
    await this.cacheRepository.delMany(['user:123', 'user:456'])

    // Check existence
    const exists = await this.cacheRepository.exists('user:123')
  }
}

// Na Factory do UseCase
export function makeMyUseCase(): MyUseCase {
  return new MyUseCase(
    makeCacheRepository() // ← Injeta via factory
  )
}
```

### Event Bus

Para publicar eventos de domínio:

```typescript
import { makeEventBus } from '@core/main/factories'
import type { IEventBus } from '@core/bus/i-event-bus'

class CreateBusinessUseCase {
  constructor(
    private businessRepository: IBusinessRepository,
    private eventBus: IEventBus
  ) {}

  async execute(input: Input) {
    const business = new BusinessEntity(input)
    await this.businessRepository.create(business)

    // Publish domain events
    const events = business.getDomainEvents()
    for (const event of events) {
      await this.eventBus.publish(event)
    }

    business.clearDomainEvents()
  }
}

// Na Factory
export function makeCreateBusinessUseCase(): CreateBusinessUseCase {
  return new CreateBusinessUseCase(
    makeBusinessRepository(),
    makeEventBus() // ← Injeta via factory
  )
}
```

### Authorization Service

Para verificar permissões de usuários:

```typescript
import { can, ownsBusiness } from '@core/app/services'

// Em um endpoint ou middleware
async function updateBusinessEndpoint(
  userAuthz: IAuthzSnapshot,
  businessId: string,
  data: any
) {
  // Check ownership
  if (!ownsBusiness(userAuthz, businessId)) {
    throw new ForbiddenError('You do not own this business')
  }

  // Check permission
  if (!can(userAuthz, 'business.update_own', {
    scope: 'own',
    resourceId: businessId
  })) {
    throw new ForbiddenError('You cannot update this business')
  }

  // Proceed with update...
}
```

## 🔄 Trocar Implementação (Redis → Upstash)

Para trocar de Redis para Upstash é muito simples:

### 1. Instale o SDK do Upstash

```bash
bun add @upstash/redis
```

### 2. Configure as variáveis de ambiente

```bash
# .env.production
USE_UPSTASH=true
UPSTASH_REDIS_REST_URL=https://your-region.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

### 3. Pronto! ✅

**Nenhuma mudança é necessária** no código da aplicação!

A factory `makeCacheRepository()` automaticamente:
- Detecta `USE_UPSTASH=true`
- Cria uma instância de `UpstashCacheRepository`
- Todos os UseCases continuam funcionando normalmente

Para voltar ao Redis local:
```bash
USE_UPSTASH=false
```

## 📚 Contratos Disponíveis

### ICacheRepository

Contrato para operações de cache com serialização JSON automática.

**Métodos:**
- `get<T>(key): Promise<T | null>` - Buscar e deserializar
- `set<T>(key, value, ttl?): Promise<void>` - Serializar e armazenar
- `del(key): Promise<void>` - Deletar chave
- `delMany(keys): Promise<void>` - Deletar múltiplas chaves
- `exists(key): Promise<boolean>` - Verificar existência

**Implementações disponíveis:**
- `RedisCacheRepository` - Redis local/self-hosted
- `UpstashCacheRepository` - Upstash Redis (serverless)

### IEventBus

Contrato para publicação de eventos de domínio.

**Métodos:**
- `publish(event)` - Publicar evento
- `publishBatch(events)` - Publicar múltiplos eventos

### IAuthzSnapshot

Snapshot de permissões do usuário.

**Propriedades:**
- `id` - User ID
- `roles` - Array de role IDs
- `permissions` - Mapa de permissões por scope
- `isAdmin` - Flag de admin
- `own` - Recursos que o usuário possui

## 🧪 Testando

Para testes unitários, você pode:

1. **Mockar as factories:**

```typescript
import { vi } from 'bun:test'
import * as factories from '@core/main/factories'

vi.spyOn(factories, 'makeCacheRepository').mockReturnValue({
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  exists: vi.fn(),
})
```

2. **Usar implementações in-memory:**

```typescript
import { InMemoryCacheRepository } from '@core/infra/repositories/in-memory-cache-repository'

const usecase = new MyUseCase(new InMemoryCacheRepository())
```

3. **Resetar singletons entre testes:**

```typescript
import { resetCacheClient, resetCacheRepository } from '@core/main/factories'

afterEach(() => {
  resetCacheClient()
  resetCacheRepository()
})
```

## 📖 Mais Informações

- [Authorization Service](./app/services/README.md) - Documentação detalhada do serviço de autorização
- [Authorization Examples](./app/services/authorization.service.example.ts) - Exemplos práticos de uso
- [Event Bus Integration](../../docs/redis-event-bus-integration.md) - Integração com Event Bus

## 🎯 Melhores Práticas

1. ✅ **SEMPRE** use factories para obter instâncias
2. ✅ **SEMPRE** dependa de contratos (interfaces), nunca de implementações
3. ✅ **SEMPRE** injete dependências via construtor
4. ❌ **NUNCA** importe clientes diretamente (ex: `redisClient`, `mongoClient`)
5. ❌ **NUNCA** crie instâncias manualmente dentro de UseCases/Services
6. ❌ **NUNCA** use `new RedisCacheRepository()` diretamente

### ❌ Errado

```typescript
import { redisClient } from '@core/infra/clients/redis-client'
import { RedisCacheRepository } from '@core/infra/repositories/redis-cache-repository'

class MyUseCase {
  async execute() {
    const cache = new RedisCacheRepository(redisClient) // ❌ Acoplado!
    await cache.set('key', 'value')
  }
}
```

### ✅ Correto

```typescript
import { makeCacheRepository } from '@core/main/factories'
import type { ICacheRepository } from '@core/app/contracts/i-cache-repository'

class MyUseCase {
  constructor(private cache: ICacheRepository) {} // ✅ Desacoplado!

  async execute() {
    await this.cache.set('key', 'value')
  }
}

export function makeMyUseCase(): MyUseCase {
  return new MyUseCase(makeCacheRepository())
}
```
