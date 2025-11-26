import { BaseEntity, BaseEntityProps } from 'packages/_core_/domain/entities/base-entity'
import { PermissionSet } from '../vo/permission-set'
import { getAllPermissions } from '../permissions/permission-registry'

// Scope constants
export const ROLE_SCOPE_GLOBAL = 'GLOBAL' as const
export const ROLE_SCOPE_BUSINESS = 'BUSINESS' as const
export const ROLE_SCOPE_UNIT = 'UNIT' as const

export type RoleDefinitionScope =
  | typeof ROLE_SCOPE_GLOBAL
  | typeof ROLE_SCOPE_BUSINESS
  | typeof ROLE_SCOPE_UNIT

type Props = {
  name: string
  scope: RoleDefinitionScope
  description: string
  permissions: PermissionSet
  created_by: string | null
  business_id: string | null
}

type CreationProps = Partial<BaseEntityProps> & {
  name: string
  scope: RoleDefinitionScope
  description: string
  permissions: string[] | PermissionSet
  created_by?: string | null
  business_id?: string | null
}

export type RoleDefinitionEntityProps = BaseEntityProps & Props

export class RoleDefinitionEntity extends BaseEntity<Props> {
  protected prefix(): string {
    return 'rdef'
  }

  constructor(props: CreationProps) {
    // Validations
    if (!props.name || props.name.trim().length === 0) {
      throw new Error('Name is required')
    }

    if (props.name.trim().length < 2) {
      throw new Error('Name must have at least 2 characters')
    }

    if (props.name.trim().length > 100) {
      throw new Error('Name must not exceed 100 characters')
    }

    if (!props.description || props.description.trim().length === 0) {
      throw new Error('Description is required')
    }

    if (props.description.trim().length > 500) {
      throw new Error('Description must not exceed 500 characters')
    }

    // Validate scope
    const validScopes = [ROLE_SCOPE_GLOBAL, ROLE_SCOPE_BUSINESS, ROLE_SCOPE_UNIT]
    if (!validScopes.includes(props.scope)) {
      throw new Error(
        `Invalid scope: ${props.scope}. Must be one of: ${validScopes.join(', ')}`
      )
    }

    // Convert permissions to PermissionSet if needed
    const permissions =
      props.permissions instanceof PermissionSet
        ? props.permissions
        : PermissionSet.create(props.permissions)

    // Validate permissions
    RoleDefinitionEntity.validatePermissions(permissions.toArray())

    // Validate business_id for BUSINESS and UNIT scopes
    if (
      (props.scope === ROLE_SCOPE_BUSINESS || props.scope === ROLE_SCOPE_UNIT) &&
      !props.business_id
    ) {
      throw new Error(`business_id is required for ${props.scope} scope`)
    }

    // Validate that GLOBAL scope doesn't have business_id
    if (props.scope === ROLE_SCOPE_GLOBAL && props.business_id) {
      throw new Error('business_id must be null for GLOBAL scope')
    }

    super({
      ...props,
      name: props.name.trim(),
      description: props.description.trim(),
      permissions,
      created_by: props.created_by ?? null,
      business_id: props.business_id ?? null,
    })
  }

  /**
   * Validates that all permissions are valid
   * Allows wildcard "*" for admin roles
   */
  private static validatePermissions(permissions: string[]): void {
    const validPermissions = new Set<string>(getAllPermissions())
    validPermissions.add('*') // Allow wildcard for admin

    for (const permission of permissions) {
      if (!validPermissions.has(permission)) {
        throw new Error(
          `Invalid permission: "${permission}". Permission must be registered in PERMISSIONS registry.`
        )
      }
    }
  }

  // Getters
  get name(): string {
    return this.props.name
  }

  get scope(): RoleDefinitionScope {
    return this.props.scope
  }

  get description(): string {
    return this.props.description
  }

  get permissions(): PermissionSet {
    return this.props.permissions
  }

  get created_by(): string | null {
    return this.props.created_by
  }

  get business_id(): string | null {
    return this.props.business_id
  }

  // Scope checkers
  isGlobal(): boolean {
    return this.props.scope === ROLE_SCOPE_GLOBAL
  }

  isBusiness(): boolean {
    return this.props.scope === ROLE_SCOPE_BUSINESS
  }

  isUnit(): boolean {
    return this.props.scope === ROLE_SCOPE_UNIT
  }

  // Permission checkers
  hasPermission(permission: string): boolean {
    return this.props.permissions.has(permission)
  }

  hasAllPermissions(permissions: string[]): boolean {
    return this.props.permissions.hasAll(permissions)
  }

  hasAnyPermission(permissions: string[]): boolean {
    return this.props.permissions.hasAny(permissions)
  }

  // Mutation methods
  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Name is required')
    }

    if (name.trim().length < 2) {
      throw new Error('Name must have at least 2 characters')
    }

    if (name.trim().length > 100) {
      throw new Error('Name must not exceed 100 characters')
    }

    this.props.name = name.trim()
    this.touch()
  }

  updateDescription(description: string): void {
    if (!description || description.trim().length === 0) {
      throw new Error('Description is required')
    }

    if (description.trim().length > 500) {
      throw new Error('Description must not exceed 500 characters')
    }

    this.props.description = description.trim()
    this.touch()
  }

  updatePermissions(permissions: string[]): void {
    RoleDefinitionEntity.validatePermissions(permissions)
    this.props.permissions = PermissionSet.create(permissions)
    this.touch()
  }

  addPermissions(...permissions: string[]): void {
    RoleDefinitionEntity.validatePermissions(permissions)
    this.props.permissions = this.props.permissions.add(...permissions)
    this.touch()
  }

  removePermissions(...permissions: string[]): void {
    this.props.permissions = this.props.permissions.remove(...permissions)
    this.touch()
  }
}
