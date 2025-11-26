# Migração: Redis → Upstash

Este guia mostra como migrar de Redis local para Upstash Redis sem alterar o código da aplicação.

## 🎯 Por que Upstash?

- ✅ **Serverless**: Pague apenas pelo que usar
- ✅ **Edge**: Deploy global com baixa latência
- ✅ **REST API**: Funciona em ambientes sem TCP (CloudFlare Workers, Lambda@Edge)
- ✅ **Compatível**: API compatível com Redis

## 📦 Passo 1: Instalar Upstash SDK

```bash
bun add @upstash/redis
```

## 🌍 Passo 2: Configurar Variáveis de Ambiente

### Development (.env)
```bash
# Use Redis local
USE_UPSTASH=false
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Production (.env.production)
```bash
# Use Upstash
USE_UPSTASH=true
UPSTASH_REDIS_REST_URL=https://your-region.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

Obtenha suas credenciais em: https://console.upstash.com/

## ✅ Passo 3: Testar

### Local (Redis)
```bash
USE_UPSTASH=false bun run dev
```

### Upstash
```bash
USE_UPSTASH=true \
UPSTASH_REDIS_REST_URL=https://... \
UPSTASH_REDIS_REST_TOKEN=... \
bun run dev
```

## 🎉 Como Funciona

A factory `makeCacheRepository()` detecta a variável `USE_UPSTASH` e retorna a implementação apropriada:

```typescript
// packages/core/main/factories/make-cache-repository.factory.ts
export function makeCacheRepository(): ICacheRepository {
  const useUpstash = process.env.USE_UPSTASH === 'true'

  if (useUpstash) {
    // Retorna UpstashCacheRepository
    const upstashClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    return new UpstashCacheRepository(upstashClient)
  } else {
    // Retorna RedisCacheRepository
    return new RedisCacheRepository(redisClient)
  }
}
```

## 🔍 Verificação

Ao iniciar a aplicação, você verá um log indicando qual implementação está sendo usada:

```bash
# Redis local
[Cache] Using Redis

# Upstash
[Cache] Using Upstash Redis
```

## 📊 Comparação de Performance

| Operação | Redis Local | Upstash (us-east-1) |
|----------|-------------|---------------------|
| GET      | ~1ms        | ~50ms               |
| SET      | ~1ms        | ~50ms               |
| BATCH    | ~2ms        | ~100ms              |

**Nota**: Upstash tem latência maior, mas compensa com:
- Zero manutenção
- Escalabilidade automática
- Deploy global
- Custo mais baixo para cargas intermitentes

## 🚀 Deploy Gradual

Você pode fazer deploy gradual testando em staging primeiro:

1. **Development**: Redis local (`USE_UPSTASH=false`)
2. **Staging**: Upstash (teste: `USE_UPSTASH=true`)
3. **Production**: Upstash (`USE_UPSTASH=true`)

## 🔄 Rollback

Se precisar voltar para Redis:

```bash
USE_UPSTASH=false
```

Pronto! É só isso.

## 🏗️ Arquitetura

A implementação usa **Dependency Injection via Factory Pattern**:

```
┌──────────────────────────────┐
│  Application (UseCases)      │
│  Depende de ICacheRepository │
└──────────────┬───────────────┘
               │
               ↓
┌──────────────────────────────┐
│  makeCacheRepository()       │
│  Factory escolhe impl        │
└──────────────┬───────────────┘
               │
        ┌──────┴──────┐
        ↓             ↓
┌──────────────┐  ┌──────────────────┐
│ RedisCacheRepo│  │UpstashCacheRepo  │
│ (local)       │  │ (serverless)     │
└───────────────┘  └──────────────────┘
```

## ✅ Vantagens desta Arquitetura

1. **Zero mudanças no código**: UseCases não sabem qual implementação estão usando
2. **Troca em runtime**: Apenas variável de ambiente
3. **Fácil testar**: Mock da factory em testes
4. **Extensível**: Adicione novos providers facilmente

## 📝 Adicionando Outros Providers

O mesmo padrão funciona para outros providers. Exemplo com CloudFlare KV:

### 1. Criar implementação

```typescript
// packages/core/infra/repositories/cloudflare-kv-cache-repository.ts
import type { ICacheRepository } from '@core/app/contracts/i-cache-repository'

export class CloudFlareKVCacheRepository implements ICacheRepository {
  constructor(private kv: KVNamespace) {}

  async get<T>(key: string): Promise<T | null> {
    const value = await this.kv.get(key)
    return value ? JSON.parse(value) : null
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.kv.put(key, JSON.stringify(value), {
      expirationTtl: ttl
    })
  }

  // ... outros métodos
}
```

### 2. Atualizar factory

```typescript
export function makeCacheRepository(): ICacheRepository {
  const provider = process.env.CACHE_PROVIDER || 'redis'

  switch (provider) {
    case 'upstash':
      return new UpstashCacheRepository(upstashClient)

    case 'cloudflare-kv':
      return new CloudFlareKVCacheRepository(kvNamespace)

    case 'redis':
    default:
      return new RedisCacheRepository(redisClient)
  }
}
```

### 3. Usar

```bash
CACHE_PROVIDER=cloudflare-kv bun run dev
```

Sem mudanças no código da aplicação! 🎉
