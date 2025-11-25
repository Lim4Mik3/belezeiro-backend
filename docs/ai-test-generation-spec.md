# AI Test Generation Specification

> **Instruções para IAs:** Este documento define os padrões obrigatórios para geração de arquivos de teste neste projeto. Siga estas diretrizes rigorosamente ao criar ou modificar testes.

## Framework e Runtime

- **Runtime:** Bun
- **Framework de Testes:** Bun Test (built-in)
- **Matcher Library:** Expect (built-in no Bun)

## Estrutura de Arquivos

### Nomenclatura

- Arquivos de teste devem ter o sufixo `.test.ts`
- Devem estar localizados no mesmo diretório do arquivo que testam
- Exemplo: `user.service.ts` → `user.service.test.ts`

### Organização de Diretórios

```
packages/
  └── [package-name]/
      ├── domain/
      │   ├── entities/
      │   │   ├── user-entity.ts
      │   │   └── user-entity.test.ts
      │   └── services/
      │       ├── id-generator.ts
      │       └── id-generator.test.ts
      ├── infra/
      │   └── services/
      │       ├── ulid-id-generator.service.ts
      │       └── ulid-id-generator.service.test.ts
      └── app/
          └── use-cases/
              ├── create-user.use-case.ts
              └── create-user.use-case.test.ts
```

## Imports Obrigatórios

```typescript
import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'bun:test'
```

### Imports Adicionais Conforme Necessário

```typescript
// Para mocks e spies
import { mock, spyOn } from 'bun:test'

// Para testes assíncronos com timers
import { jest } from 'bun:test'
```

## Estrutura de Testes

### Template Básico

```typescript
import { describe, it, expect, beforeEach } from 'bun:test'
import { ClassToTest } from './class-to-test'

describe('ClassToTest', () => {
  let instance: ClassToTest

  beforeEach(() => {
    instance = new ClassToTest()
  })

  describe('methodName', () => {
    it('should describe expected behavior', () => {
      // Arrange
      const input = 'test'

      // Act
      const result = instance.methodName(input)

      // Assert
      expect(result).toBe('expected')
    })
  })
})
```

### Padrão AAA (Arrange-Act-Assert)

**OBRIGATÓRIO:** Todos os testes devem seguir o padrão AAA:

```typescript
it('should do something', () => {
  // Arrange - Preparar o cenário
  const dependency = new Dependency()
  const service = new Service(dependency)
  const input = { value: 'test' }

  // Act - Executar a ação
  const result = service.method(input)

  // Assert - Verificar o resultado
  expect(result).toBeDefined()
  expect(result.value).toBe('expected')
})
```

## Nomenclatura de Testes

### Describe Blocks

- **Suite principal:** Nome da classe/função sendo testada
- **Suite secundária:** Nome do método/função específica
- Use nomes descritivos e em inglês

```typescript
describe('ULIDIDGeneratorService', () => {
  describe('generate', () => {
    // testes aqui
  })
})
```

### Test Cases (it blocks)

Use o padrão: `should [ação esperada] [contexto/condição]`

**✅ Exemplos corretos:**
```typescript
it('should generate a valid ID with lowercase prefix', () => {})
it('should throw error when prefix is empty string', () => {})
it('should convert uppercase prefix to lowercase', () => {})
it('should return null when user is not found', () => {})
```

**❌ Exemplos incorretos:**
```typescript
it('generates ID', () => {}) // Muito vago
it('test error', () => {}) // Não descritivo
it('deve gerar ID válido', () => {}) // Não está em inglês
```

## Categorias de Testes Obrigatórias

Para cada método/função, implemente testes para:

### 1. Happy Path (Caminho Feliz)
```typescript
it('should successfully process valid input', () => {
  const result = service.process(validInput)
  expect(result).toBeDefined()
})
```

### 2. Edge Cases (Casos Extremos)
```typescript
it('should handle empty string', () => {})
it('should handle very long input', () => {})
it('should handle single character input', () => {})
it('should handle special characters', () => {})
```

### 3. Error Cases (Casos de Erro)
```typescript
it('should throw error when input is null', () => {
  expect(() => service.process(null)).toThrow('Expected error message')
})

it('should throw specific error type', () => {
  expect(() => service.process(invalid)).toThrow(ValidationError)
})
```

### 4. Boundary Conditions (Condições de Limite)
```typescript
it('should handle minimum valid value', () => {})
it('should handle maximum valid value', () => {})
it('should reject value below minimum', () => {})
it('should reject value above maximum', () => {})
```

### 5. Integration Points (Pontos de Integração)
```typescript
it('should correctly call dependency method', () => {
  const spy = spyOn(dependency, 'method')
  service.process(input)
  expect(spy).toHaveBeenCalledWith(expectedArgs)
})
```

## Matchers Recomendados

### Comparação de Valores
```typescript
expect(value).toBe(expected)           // Igualdade estrita (===)
expect(value).toEqual(expected)        // Igualdade profunda (objetos)
expect(value).toStrictEqual(expected)  // Igualdade estrita profunda
```

### Truthiness
```typescript
expect(value).toBeTruthy()
expect(value).toBeFalsy()
expect(value).toBeDefined()
expect(value).toBeUndefined()
expect(value).toBeNull()
```

### Números
```typescript
expect(number).toBeGreaterThan(5)
expect(number).toBeGreaterThanOrEqual(5)
expect(number).toBeLessThan(10)
expect(number).toBeLessThanOrEqual(10)
expect(number).toBeCloseTo(0.3, 1) // Para floats
```

### Strings
```typescript
expect(string).toMatch(/pattern/)
expect(string).toStartWith('prefix')
expect(string).toEndWith('suffix')
expect(string).toContain('substring')
```

### Arrays e Iterables
```typescript
expect(array).toContain(item)
expect(array).toHaveLength(3)
expect(array).toContainEqual(object)
```

### Objetos
```typescript
expect(object).toHaveProperty('key')
expect(object).toHaveProperty('key', value)
expect(object).toMatchObject({ subset: 'of properties' })
```

### Exceções
```typescript
expect(() => fn()).toThrow()
expect(() => fn()).toThrow('error message')
expect(() => fn()).toThrow(ErrorClass)
expect(async () => await fn()).toThrow()
```

## Testes Assíncronos

### Async/Await (Recomendado)
```typescript
it('should handle async operation', async () => {
  // Arrange
  const service = new AsyncService()

  // Act
  const result = await service.fetchData()

  // Assert
  expect(result).toBeDefined()
})
```

### Promises
```typescript
it('should resolve promise', () => {
  return expect(service.fetchData()).resolves.toBe(expected)
})

it('should reject promise', () => {
  return expect(service.fetchData()).rejects.toThrow('error')
})
```

### Timers
```typescript
it('should execute after delay', async () => {
  jest.useFakeTimers()

  const callback = mock()
  service.delayedExecution(callback)

  jest.advanceTimersByTime(1000)

  expect(callback).toHaveBeenCalled()

  jest.useRealTimers()
})
```

## Mocks e Spies

### Criando Mocks
```typescript
import { mock } from 'bun:test'

it('should call callback', () => {
  const callback = mock(() => 'mocked return')

  service.executeCallback(callback)

  expect(callback).toHaveBeenCalled()
  expect(callback).toHaveBeenCalledTimes(1)
  expect(callback).toHaveBeenCalledWith(expectedArgs)
})
```

### Spy em Métodos
```typescript
import { spyOn } from 'bun:test'

it('should call dependency method', () => {
  const spy = spyOn(dependency, 'method')

  service.process()

  expect(spy).toHaveBeenCalled()
  expect(spy).toHaveReturnedWith(expectedValue)
})
```

### Mock de Implementação
```typescript
it('should use mocked implementation', () => {
  const mockMethod = mock((value: string) => value.toUpperCase())

  const result = mockMethod('test')

  expect(result).toBe('TEST')
  expect(mockMethod).toHaveBeenCalledWith('test')
})
```

## Setup e Teardown

### beforeEach / afterEach
Use para configuração e limpeza que deve ocorrer antes/depois de **cada** teste:

```typescript
describe('ServiceWithResources', () => {
  let service: ServiceWithResources
  let connection: Connection

  beforeEach(() => {
    connection = new Connection()
    service = new ServiceWithResources(connection)
  })

  afterEach(() => {
    connection.close()
  })

  it('should use connection', () => {
    service.query()
    expect(connection.isOpen()).toBe(true)
  })
})
```

### beforeAll / afterAll
Use para configuração e limpeza que deve ocorrer uma vez antes/depois de **todos** os testes:

```typescript
describe('DatabaseTests', () => {
  beforeAll(async () => {
    await database.connect()
    await database.migrate()
  })

  afterAll(async () => {
    await database.close()
  })

  it('should query database', async () => {
    const result = await database.query('SELECT 1')
    expect(result).toBeDefined()
  })
})
```

## Testes de Entidades (Domain Entities)

### Padrão para Entidades
```typescript
describe('UserEntity', () => {
  describe('create', () => {
    it('should create valid user entity', () => {
      const props = {
        name: 'John Doe',
        email: 'john@example.com'
      }

      const user = UserEntity.create(props)

      expect(user.id).toBeDefined()
      expect(user.name).toBe(props.name)
      expect(user.email).toBe(props.email)
      expect(user.createdAt).toBeInstanceOf(Date)
    })

    it('should generate unique IDs for different instances', () => {
      const user1 = UserEntity.create({ name: 'User 1', email: 'u1@test.com' })
      const user2 = UserEntity.create({ name: 'User 2', email: 'u2@test.com' })

      expect(user1.id).not.toBe(user2.id)
    })

    it('should throw error when name is empty', () => {
      expect(() =>
        UserEntity.create({ name: '', email: 'test@test.com' })
      ).toThrow('Name cannot be empty')
    })
  })

  describe('update', () => {
    it('should update entity properties', () => {
      const user = UserEntity.create({ name: 'Old Name', email: 'old@test.com' })

      user.update({ name: 'New Name' })

      expect(user.name).toBe('New Name')
      expect(user.updatedAt).toBeInstanceOf(Date)
    })
  })
})
```

## Testes de Services

### Padrão para Services
```typescript
describe('UserService', () => {
  let service: UserService
  let repository: MockUserRepository
  let idGenerator: MockIDGenerator

  beforeEach(() => {
    repository = new MockUserRepository()
    idGenerator = new MockIDGenerator()
    service = new UserService(repository, idGenerator)
  })

  describe('createUser', () => {
    it('should create user with generated ID', async () => {
      const input = { name: 'John', email: 'john@test.com' }
      idGenerator.generate.mockReturnValue('user_123')

      const result = await service.createUser(input)

      expect(result.id).toBe('user_123')
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining(input)
      )
    })

    it('should throw error when email already exists', async () => {
      repository.findByEmail.mockResolvedValue({ id: 'existing' })

      await expect(
        service.createUser({ name: 'John', email: 'existing@test.com' })
      ).rejects.toThrow('Email already exists')
    })
  })
})
```

## Testes de Use Cases

### Padrão para Use Cases
```typescript
describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase
  let userRepository: MockUserRepository
  let eventPublisher: MockEventPublisher

  beforeEach(() => {
    userRepository = new MockUserRepository()
    eventPublisher = new MockEventPublisher()
    useCase = new CreateUserUseCase(userRepository, eventPublisher)
  })

  describe('execute', () => {
    it('should create user and publish event', async () => {
      const input = {
        name: 'John Doe',
        email: 'john@test.com'
      }

      const result = await useCase.execute(input)

      expect(result.isSuccess()).toBe(true)
      expect(result.getValue()).toMatchObject(input)
      expect(eventPublisher.publish).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'UserCreated' })
      )
    })

    it('should return failure when validation fails', async () => {
      const input = {
        name: '',
        email: 'invalid'
      }

      const result = await useCase.execute(input)

      expect(result.isFailure()).toBe(true)
      expect(result.getError()).toContain('validation')
    })
  })
})
```

## Cobertura de Código

### Objetivos de Cobertura

- **Mínimo obrigatório:** 80% de cobertura geral
- **Recomendado:** 90% de cobertura
- **Arquivos críticos:** 100% de cobertura (entidades, value objects)

### Executando com Cobertura

```bash
# Todos os testes com cobertura
bun test --coverage

# Pacote específico
bun test packages/core --coverage

# Arquivo específico
bun test packages/core/domain/entities/user-entity.test.ts
```

## Padrões de Qualidade

### ✅ Faça

- Escreva testes antes ou junto com o código (TDD/TDD-like)
- Um conceito por teste
- Nomes descritivos e claros
- Testes independentes e isolados
- Use AAA pattern (Arrange-Act-Assert)
- Teste comportamentos, não implementações
- Mock dependências externas
- Teste casos extremos e de erro

### ❌ Não Faça

- Testes que dependem de outros testes
- Testes que dependem de ordem de execução
- Testes que dependem de estado global
- Testes com lógica complexa
- Testes que testam múltiplos comportamentos
- Testes que testam detalhes de implementação
- Comentar testes quebrados (conserte ou remova)
- Usar valores mágicos sem explicação

## Exemplos Completos

### Exemplo 1: Service com Dependências

```typescript
import { describe, it, expect, beforeEach, mock } from 'bun:test'
import { EmailService } from './email.service'
import type { EmailProvider } from '../domain/providers/email-provider'

describe('EmailService', () => {
  let service: EmailService
  let mockProvider: EmailProvider

  beforeEach(() => {
    mockProvider = {
      send: mock(async () => ({ success: true, messageId: 'msg_123' }))
    }
    service = new EmailService(mockProvider)
  })

  describe('sendWelcomeEmail', () => {
    it('should send welcome email with correct template', async () => {
      // Arrange
      const user = {
        email: 'user@test.com',
        name: 'John Doe'
      }

      // Act
      const result = await service.sendWelcomeEmail(user)

      // Assert
      expect(result.success).toBe(true)
      expect(mockProvider.send).toHaveBeenCalledWith({
        to: user.email,
        template: 'welcome',
        data: { name: user.name }
      })
    })

    it('should throw error when provider fails', async () => {
      // Arrange
      mockProvider.send = mock(async () => {
        throw new Error('Provider error')
      })
      const user = { email: 'user@test.com', name: 'John' }

      // Act & Assert
      await expect(service.sendWelcomeEmail(user)).rejects.toThrow(
        'Failed to send email'
      )
    })
  })
})
```

### Exemplo 2: Entity com Value Objects

```typescript
import { describe, it, expect } from 'bun:test'
import { UserEntity } from './user-entity'
import { Email } from '../value-objects/email'

describe('UserEntity', () => {
  describe('create', () => {
    it('should create user with valid email', () => {
      // Arrange
      const props = {
        name: 'John Doe',
        email: Email.create('john@test.com').getValue(),
        age: 25
      }

      // Act
      const result = UserEntity.create(props)

      // Assert
      expect(result.isSuccess()).toBe(true)
      const user = result.getValue()
      expect(user.name).toBe(props.name)
      expect(user.email.value).toBe('john@test.com')
      expect(user.age).toBe(25)
    })

    it('should fail when age is below minimum', () => {
      // Arrange
      const props = {
        name: 'John Doe',
        email: Email.create('john@test.com').getValue(),
        age: 15
      }

      // Act
      const result = UserEntity.create(props)

      // Assert
      expect(result.isFailure()).toBe(true)
      expect(result.getError()).toContain('age')
    })
  })

  describe('updateEmail', () => {
    it('should update email and set updatedAt timestamp', () => {
      // Arrange
      const user = UserEntity.create({
        name: 'John',
        email: Email.create('old@test.com').getValue(),
        age: 25
      }).getValue()
      const newEmail = Email.create('new@test.com').getValue()

      // Act
      user.updateEmail(newEmail)

      // Assert
      expect(user.email.value).toBe('new@test.com')
      expect(user.updatedAt).toBeInstanceOf(Date)
      expect(user.updatedAt.getTime()).toBeGreaterThan(
        user.createdAt.getTime()
      )
    })
  })
})
```

## Comandos Úteis

```bash
# Executar todos os testes
bun test

# Executar testes em modo watch
bun test --watch

# Executar testes com cobertura
bun test --coverage

# Executar teste específico
bun test path/to/file.test.ts

# Executar testes de um pacote específico
bun test packages/core

# Executar testes que correspondem a um padrão
bun test --test-name-pattern "UserEntity"

# Executar apenas os testes modificados
bun test --only-changed
```

## Checklist para Revisão de Testes

Antes de considerar os testes completos, verifique:

- [ ] Todos os métodos públicos estão testados
- [ ] Happy path está coberto
- [ ] Casos de erro estão cobertos
- [ ] Edge cases estão cobertos
- [ ] Boundary conditions estão testadas
- [ ] Testes seguem padrão AAA
- [ ] Nomes de testes são descritivos
- [ ] Testes são independentes
- [ ] Não há código duplicado excessivo
- [ ] Mocks estão sendo usados apropriadamente
- [ ] Cobertura está acima de 80%
- [ ] Todos os testes passam
- [ ] Não há testes ignorados (.skip) sem justificativa

## Referências

- [Bun Test Documentation](https://bun.sh/docs/cli/test)
- [Testing Best Practices](https://testingjavascript.com/)
- [Clean Code - Testing Chapter](https://www.oreilly.com/library/view/clean-code-a/9780136083238/)

---

**Última atualização:** 2025-11-24
**Versão:** 1.0.0
