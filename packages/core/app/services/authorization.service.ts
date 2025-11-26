import { Permission } from '@iam/domain/permissions/permission-registry'
import type { IAuthzSnapshot } from '../contracts/i-authz-snapshot'

export type AuthorizationScope = 'global' | 'business' | 'unit' | 'own'

export interface AuthorizationOptions {
  scope?: AuthorizationScope
  resourceId?: string
}

export function can(
  userAuthz: IAuthzSnapshot,
  permission: Permission,
  options?: AuthorizationOptions,
): boolean {
  if (userAuthz.isAdmin || userAuthz.permissions.globals.includes('*')) {
    return true
  }

  const scope = options?.scope || 'global'
  const resourceId = options?.resourceId

  if (permission.endsWith('_own')) {
    if (permission.startsWith('users.') && userAuthz.permissions.globals.includes(permission)) {
      return true
    }

    return canOwn(userAuthz, permission, resourceId)
  }

  if (scope === 'global') {
    return userAuthz.permissions.globals.includes(permission)
  }

  if (scope === 'business' && resourceId) {
    const businessPerms = userAuthz.permissions.business[resourceId] || []
    return businessPerms.includes(permission)
  }

  if (scope === 'unit' && resourceId) {
    const unitPerms = userAuthz.permissions.unit[resourceId] || []
    return unitPerms.includes(permission)
  }

  if (scope === 'own') {
    return canOwn(userAuthz, permission, resourceId)
  }

  return false
}

function canOwn(
  userAuthz: IAuthzSnapshot,
  permission: string,
  resourceId?: string,
): boolean {
  if (!resourceId) {
    return false
  }

  const basePermission = permission.replace(/_own$/, '')

  if (userAuthz.own.business.includes(resourceId)) {
    const businessPerms = userAuthz.permissions.business[resourceId] || []
    return businessPerms.includes(basePermission) || businessPerms.includes(permission)
  }

  return false
}

export function canAny(
  userAuthz: IAuthzSnapshot,
  permissions: Permission[],
  options?: AuthorizationOptions,
): boolean {
  return permissions.some((permission) => can(userAuthz, permission, options))
}

export function canAll(
  userAuthz: IAuthzSnapshot,
  permissions: Permission[],
  options?: AuthorizationOptions,
): boolean {
  return permissions.every((permission) => can(userAuthz, permission, options))
}

export function ownsBusiness(
  userAuthz: IAuthzSnapshot,
  businessId: string,
): boolean {
  return userAuthz.own.business.includes(businessId)
}

export function getOwnedBusinesses(userAuthz: IAuthzSnapshot): string[] {
  return userAuthz.own.business
}
