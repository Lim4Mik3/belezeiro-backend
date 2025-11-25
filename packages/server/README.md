# @belezeiro/server

Servidor monolítico com API HTTP (Fastify) e processamento de filas (Redis Streams) para desenvolvimento.

## Configuração

### 1. Instale as dependências

```bash
bun install
```

### 2. Configure o ambiente

Copie o arquivo `.env.example` para `.env` em `packages/server/`:

```bash
cp packages/server/.env.example packages/server/.env
```

Configure as variáveis de ambiente:

```env
PORT=3000
HOST=0.0.0.0
NODE_ENV=development
REDIS_URL=redis://localhost:6379
```

**Nota:** O `JWT_SECRET` vem do `.env` global na raiz do projeto, não precisa ser configurado aqui.

### 3. Certifique-se que o Redis está rodando

O projeto usa Redis em Docker:

```bash
# Verificar se Redis está rodando
docker ps | grep redis

# Se não estiver, inicie o container
docker run -d --name redis -p 6379:6379 redis:8.0-alpine
```

## Executando

### Modo desenvolvimento (com hot reload)

```bash
cd packages/server
bun run dev
```

### Modo produção

```bash
cd packages/server
bun run start
```

## Rotas disponíveis

### Autenticação (IAM)

- `POST /api/v1/auth/google` - Autenticar usuário com Google
- `GET /api/v1/auth/me` - Obter dados do usuário autenticado (requer token)

### Business

- `POST /api/v1/businesses` - Criar business (requer token)
- `GET /api/v1/businesses/:id` - Obter business por ID (requer token)
- `PUT /api/v1/businesses/:id` - Atualizar business (requer token)
- `DELETE /api/v1/businesses/:id` - Deletar business (requer token)

### Units

- `POST /api/v1/businesses/:businessId/units` - Criar unit (requer token)
- `GET /api/v1/businesses/:businessId/units` - Listar units de um business (requer token)
- `GET /api/v1/units/:id` - Obter unit por ID (requer token)
- `PUT /api/v1/units/:id` - Atualizar unit (requer token)
- `DELETE /api/v1/units/:id` - Deletar unit (requer token)

## Arquitetura

O servidor está estruturado com:

### API HTTP
- **Fastify** como framework HTTP
- **Repositórios em memória** para desenvolvimento (InMemory repositories)
- **Factories** para injeção de dependências
- **Middleware de autenticação** com JWT
- **CORS e Helmet** para segurança
- **Pino logger** para logs estruturados

### Queue Processor
- **Redis Streams** para processamento assíncrono
- **Event Handlers** para reagir a eventos de domínio
- **Consumer Groups** para processamento distribuído
- **Graceful shutdown** para finalização segura

## Event Handlers

O servidor registra automaticamente handlers para processar eventos de domínio:

- `UserAuthenticatedHandler` - Processa autenticações de usuário
  - Envia email de boas-vindas para novos usuários
  - Registra analytics
  - Atualiza cache

Para adicionar novos handlers:

1. Crie um arquivo em `infra/handlers/` implementando a interface `EventHandler`
2. Registre o handler em `infra/handlers/index.ts`

```typescript
// Exemplo de handler
export class MyEventHandler implements EventHandler {
  eventName = DOMAIN_EVENTS.MY_CONTEXT.MY_EVENT;

  async handle(event: MyEvent): Promise<void> {
    // Sua lógica aqui
  }
}
```

## Estrutura de pastas

```
packages/server/
├── infra/
│   ├── config/         # Configurações (env vars)
│   ├── handlers/       # Event handlers
│   ├── middlewares/    # Middlewares HTTP
│   ├── queue/          # Queue processor
│   └── routes/         # Rotas da API
├── main/
│   ├── app.ts          # Configuração do Fastify
│   └── server.ts       # Entry point (API + Queue)
├── package.json
└── .env.example
```

## Como funciona o Event Bus

1. Use cases emitem eventos de domínio através do `EventBus`
2. O `RedisEventBus` publica os eventos em Redis Streams
3. O `RedisQueueProcessor` consome os eventos em background
4. Os `EventHandlers` registrados processam os eventos de forma assíncrona

Isso permite que a API responda rapidamente enquanto o processamento pesado acontece em background.
