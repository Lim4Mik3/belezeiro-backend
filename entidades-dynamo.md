1️⃣ Estrutura de entidades
// ====================
// USER ENTITY
// ====================
interface User {
  id: string;
  name: string;
  email: string;
  photo_url?: string;
  provider_id: string;
  createdAt: Date;
  updatedAt: Date;
}

// DynamoDB mapping
const UserItem = {
  PK: (userId: string) => `USER#${userId}`,
  SK: "ROOT",
  GSI1_PK: (providerId: string) => providerId,
  GSI1_SK: "ROOT",
};

// ====================
// ROLE ASSIGNMENT ENTITY
// ====================
interface RoleAssignment {
  id: string; // UUID ou ULID
  user_id: string;
  role_key: string;
  target_key: string;
  target_id: string;
  createdAt: Date;
}

// DynamoDB mapping
const RoleAssignmentItem = {
  PK: (userId: string) => `USER#${userId}`,
  SK: (roleKey: string, targetKey: string, targetId: string) =>
    `ROLE#${roleKey}#${targetKey}#${targetId}`,
  GSI2_PK: (targetKey: string, targetId: string) =>
    `TARGET#${targetKey}#${targetId}`,
  GSI2_SK: (roleKey: string, userId: string) =>
    `ROLE#${roleKey}#USER#${userId}`,
};

// ====================
// BUSINESS ENTITY
// ====================
interface Business {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// DynamoDB mapping
const BusinessItem = {
  PK: (businessId: string) => `BUSINESS#${businessId}`,
  SK: "ROOT",
};

// ====================
// UNIT ENTITY
// ====================
interface Unit {
  id: string;
  business_id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// DynamoDB mapping
const UnitItem = {
  PK: (businessId: string) => `BUSINESS#${businessId}`,
  SK: (unitId: string) => `UNIT#${unitId}`,
};

// ====================
// SUBSCRIPTION ENTITY
// ====================
interface Subscription {
  id: string;
  unit_id: string;
  plan_id: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: Date;
  updatedAt: Date;
}

// DynamoDB mapping
const SubscriptionItem = {
  PK: (businessId: string) => `BUSINESS#${businessId}`,
  SK: (unitId: string, subscriptionId: string) =>
    `UNIT#${unitId}#SUBSCRIPTION#${subscriptionId}`,
};

// ====================
// INVOICE ENTITY
// ====================
interface Invoice {
  id: string;
  subscription_id: string;
  unit_id: string;
  amount: number;
  status: "PENDING" | "PAID" | "CANCELLED";
  createdAt: Date;
  updatedAt: Date;
}

// DynamoDB mapping
const InvoiceItem = {
  PK: (businessId: string) => `BUSINESS#${businessId}`,
  SK: (unitId: string, subscriptionId: string, invoiceId: string) =>
    `UNIT#${unitId}#SUBSCRIPTION#${subscriptionId}#INVOICE#${invoiceId}`,
};

2️⃣ Observações importantes para a AI

PK e SK:

Tudo é strings concatenadas no padrão PREFIX#id#....

SK hierárquica para modelar agregados (Unit → Subscription → Invoice).

GSIs:

GSI1 → busca por provider_id para users.

GSI2 → busca por target para roles (ROLE#PROFESSIONAL#USER#123).

Agregados:

User é root do agregado de roles (ROLE#... na SK).

Business é root do agregado de units, subscriptions e invoices.

Consistência de naming:

Sempre PREFIX#id para evitar colisão.

ULIDs funcionam bem para ordering e tamanho fixo.