/**
 * Role Definition Repository Contract
 * Consolidated from IAM module
 */

export const ROLE_SCOPE_GLOBAL = 'GLOBAL' as const;
export const ROLE_SCOPE_BUSINESS = 'BUSINESS' as const;
export const ROLE_SCOPE_UNIT = 'UNIT' as const;

export type RoleDefinitionScope =
  | typeof ROLE_SCOPE_GLOBAL
  | typeof ROLE_SCOPE_BUSINESS
  | typeof ROLE_SCOPE_UNIT;

export interface IRoleDefinitionRepository {
  create(roleDefinition: any): Promise<void>;
  findById(id: string): Promise<any | null>;
  findManyByIds(ids: string[]): Promise<any[]>;
  findByName(name: string, businessId?: string): Promise<any | null>;
  findGlobalRoleByName(name: string): Promise<any | null>;
  findAll(): Promise<any[]>;
  findByBusinessId(businessId: string): Promise<any[]>;
  findGlobal(): Promise<any[]>;
  update(roleDefinition: any): Promise<void>;
  delete(id: string): Promise<void>;
}
