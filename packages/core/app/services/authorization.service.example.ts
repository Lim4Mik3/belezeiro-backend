/**
 * Authorization Service Usage Examples
 *
 * This file demonstrates how to use the authorization service
 * in different scenarios across your application.
 */

import { can, canAny, canAll, ownsBusiness, getOwnedBusinesses } from './authorization.service'
import type { IAuthzSnapshot } from '../contracts/i-authz-snapshot'

// Example user snapshot (typically comes from PermissionSnapshotService)
const userSnapshot: IAuthzSnapshot = {
  id: 'usr_123',
  roles: ['rdef_customer', 'rdef_business_owner'],
  permissions: {
    globals: ['business.list'],
    business: {
      biz_123: ['units.create', 'units.update', 'units.delete'],
      biz_456: ['units.create'],
    },
    unit: {
      unit_789: ['service.create', 'service.update'],
    },
  },
  isAdmin: false,
  own: {
    business: ['biz_123'],
  },
}

// ========================================
// Example 1: Check global permissions
// ========================================
function checkGlobalPermissions() {
  // Can user list all businesses?
  if (can(userSnapshot, 'business.list')) {
    console.log('✅ User can list businesses')
  }

  // Can user create a new business?
  if (can(userSnapshot, 'business.create')) {
    console.log('✅ User can create businesses')
  } else {
    console.log('❌ User cannot create businesses')
  }
}

// ========================================
// Example 2: Check business-scoped permissions
// ========================================
function checkBusinessScopedPermissions(businessId: string) {
  // Can user create units in this specific business?
  if (can(userSnapshot, 'units.create', { scope: 'business', resourceId: businessId })) {
    console.log(`✅ User can create units in business ${businessId}`)
  }

  // Can user update units in this business?
  if (can(userSnapshot, 'units.update', { scope: 'business', resourceId: businessId })) {
    console.log(`✅ User can update units in business ${businessId}`)
  }
}

// ========================================
// Example 3: Check ownership permissions
// ========================================
function checkOwnershipPermissions(businessId: string) {
  // Does user own this business?
  if (ownsBusiness(userSnapshot, businessId)) {
    console.log(`✅ User owns business ${businessId}`)

    // Can user update their own business?
    if (can(userSnapshot, 'business.update_own', { scope: 'own', resourceId: businessId })) {
      console.log(`✅ User can update their own business ${businessId}`)
    }
  } else {
    console.log(`❌ User does not own business ${businessId}`)
  }
}

// ========================================
// Example 4: Check multiple permissions
// ========================================
function checkMultiplePermissions() {
  // Does user have ANY of these permissions?
  const hasAnyPermission = canAny(userSnapshot, [
    'business.create',
    'business.update_own',
    'business.delete_own',
  ])

  if (hasAnyPermission) {
    console.log('✅ User can perform at least one business operation')
  }

  // Does user have ALL of these permissions?
  const hasAllPermissions = canAll(userSnapshot, [
    'units.create',
    'units.update',
  ], {
    scope: 'business',
    resourceId: 'biz_123',
  })

  if (hasAllPermissions) {
    console.log('✅ User can create AND update units in business biz_123')
  }
}

// ========================================
// Example 5: Get all owned businesses
// ========================================
function listOwnedBusinesses() {
  const ownedBusinessIds = getOwnedBusinesses(userSnapshot)

  if (ownedBusinessIds.length > 0) {
    console.log(`✅ User owns ${ownedBusinessIds.length} business(es):`)
    ownedBusinessIds.forEach(id => console.log(`   - ${id}`))
  } else {
    console.log('❌ User does not own any businesses')
  }
}

// ========================================
// Example 6: Real-world use case in an API endpoint
// ========================================
async function updateUnitEndpoint(
  userSnapshot: IAuthzSnapshot,
  businessId: string,
  unitId: string,
  updateData: any,
) {
  // Check if user can update units in this business
  if (!can(userSnapshot, 'units.update', { scope: 'business', resourceId: businessId })) {
    throw new Error('Forbidden: You do not have permission to update units in this business')
  }

  // Proceed with update...
  console.log(`Updating unit ${unitId} in business ${businessId}`)
  // ... actual update logic
}

// ========================================
// Example 7: Real-world use case with ownership check
// ========================================
async function deleteBusinessEndpoint(
  userSnapshot: IAuthzSnapshot,
  businessId: string,
) {
  // Check if user owns the business
  if (!ownsBusiness(userSnapshot, businessId)) {
    throw new Error('Forbidden: You can only delete businesses that you own')
  }

  // Check if user has delete permission
  if (!can(userSnapshot, 'business.delete_own', { scope: 'own', resourceId: businessId })) {
    throw new Error('Forbidden: You do not have permission to delete your own business')
  }

  // Proceed with deletion...
  console.log(`Deleting business ${businessId}`)
  // ... actual deletion logic
}

// ========================================
// Example 8: Middleware-style authorization check
// ========================================
import type { Permission } from '@iam/domain/permissions/permission-registry'

function requirePermission(permission: Permission, scope?: 'global' | 'business' | 'unit') {
  return (userSnapshot: IAuthzSnapshot, resourceId?: string) => {
    const options = scope && resourceId ? { scope, resourceId } : undefined

    if (!can(userSnapshot, permission, options)) {
      throw new Error(`Forbidden: Required permission: ${permission}`)
    }
  }
}

// Usage:
const requireBusinessCreate = requirePermission('business.create', 'global')
const requireUnitUpdate = requirePermission('units.update', 'business')

function someProtectedEndpoint(userSnapshot: IAuthzSnapshot) {
  requireBusinessCreate(userSnapshot)
  // ... endpoint logic
}
