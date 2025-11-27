import type { ICacheRepository } from "packages/_core_/app/contracts/i-cache-repository";
import type { IAuthzSnapshot } from "packages/_core_/app/contracts/i-authz-snapshot";
import type { IRoleAssignmentRepository } from "packages/_core_/app/contracts/repositories/i-role-assignment-repository";
import type { IRoleDefinitionRepository } from "packages/_core_/app/contracts/repositories/i-role-definition-repository";
import type { IUserRepository } from "packages/_core_/app/contracts/repositories/i-user-repository";
import { STANDARD_ROLES } from "packages/_core_/domain/constants/role-names";
import type { IPermissionSnapshotService } from "@core/contracts/services/i-permissions-snapshot-service";
import { CreateUserPermissionSnapshotCacheKey } from "packages/_core_/infra/utils/create-user-permission-snapshot-cache-key.utils";

export class PermissionSnapshotService implements IPermissionSnapshotService {
  private readonly TTL = 60 * 30; // 30 minutos

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly roleDefinitionRepository: IRoleDefinitionRepository,
    private readonly roleAssignmentRepository: IRoleAssignmentRepository,
    private readonly cacheRepository: ICacheRepository,
  ) { }

  private async buildUserAuthorizationSnapshot(userId: string): Promise<IAuthzSnapshot> {
    const globalPermissionsSet = new Set<string>();
    const businessPermissionsMap = new Map<string, Set<string>>();
    const unitPermissionsMap = new Map<string, Set<string>>();
    const ownedBusinesses = new Set<string>();
    let isAdmin = false;

    // 1. Get all active role assignments for the user
    const activeAssignments = await this.roleAssignmentRepository.findActiveByUserId(userId);

    if (activeAssignments.length === 0) {
      // User has no active roles, return minimal snapshot
      return {
        id: userId,
        roles: [],
        permissions: {
          globals: [],
          business: {},
          unit: {},
        },
        isAdmin: false,
        own: {
          business: [],
        },
      };
    }

    // 2. BATCH FETCH: Get all role definitions in one go
    const roleIds = activeAssignments.map((a) => a.roleId);
    const uniqueRoleIds = [...new Set(roleIds)];

    // Fetch all role definitions at once
    const roleDefinitions = await this.roleDefinitionRepository.findManyByIds(uniqueRoleIds);

    // Create a map for quick lookup
    const roleDefMap = new Map(roleDefinitions.map((rd) => [rd.id, rd]));

    // 3. Process each assignment with role definition
    for (const assignment of activeAssignments) {
      const roleDefinition = roleDefMap.get(assignment.roleId);

      if (!roleDefinition) {
        console.warn(
          `[PermissionSnapshotService] Role definition not found: ${assignment.roleId}`,
        );
        continue;
      }

      const permissions = roleDefinition.permissions.toArray();

      // Check for wildcard admin
      if (permissions.includes("*")) {
        isAdmin = true;
        globalPermissionsSet.clear();
        globalPermissionsSet.add("*");
        continue;
      }

      // If already detected admin, no need to process other permissions
      if (isAdmin) {
        continue;
      }

      // 4. Categorize permissions by scope
      const scope = roleDefinition.scope;
      const targetId = assignment.targetId;

      // Check if this is BUSINESS_OWNER role (can be GLOBAL scope but assigned to specific business via targetId)
      if (roleDefinition.name === STANDARD_ROLES.BUSINESS_OWNER && targetId) {
        ownedBusinesses.add(targetId);
      }

      if (scope === 'GLOBAL') {
        // Global permissions (target_id should be null for truly global roles)
        // But some global roles (like BUSINESS_OWNER) can be assigned to specific targets
        if (!targetId) {
          // Truly global permissions
          permissions.forEach((perm: string) => globalPermissionsSet.add(perm));
        } else {
          // Global role assigned to specific business (like BUSINESS_OWNER)
          // Treat as business-scoped permissions
          if (!businessPermissionsMap.has(targetId)) {
            businessPermissionsMap.set(targetId, new Set<string>());
          }
          const businessPerms = businessPermissionsMap.get(targetId)!;
          permissions.forEach((perm: string) => businessPerms.add(perm));
        }
      } else if (scope === 'BUSINESS') {
        // Business permissions (target_id = business_id)
        if (targetId) {
          if (!businessPermissionsMap.has(targetId)) {
            businessPermissionsMap.set(targetId, new Set<string>());
          }
          const businessPerms = businessPermissionsMap.get(targetId)!;
          permissions.forEach((perm: string) => businessPerms.add(perm));
        }
      } else if (scope === 'UNIT') {
        // Unit permissions (target_id = unit_id)
        if (targetId) {
          if (!unitPermissionsMap.has(targetId)) {
            unitPermissionsMap.set(targetId, new Set<string>());
          }
          const unitPerms = unitPermissionsMap.get(targetId)!;
          permissions.forEach((perm: string) => unitPerms.add(perm));
        }
      }
    }

    // 5. Build final snapshot with sorted data
    const businessPermissions: Record<string, string[]> = {};
    for (const [key, perms] of businessPermissionsMap.entries()) {
      businessPermissions[key] = Array.from(perms).sort();
    }

    const unitPermissions: Record<string, string[]> = {};
    for (const [key, perms] of unitPermissionsMap.entries()) {
      unitPermissions[key] = Array.from(perms).sort();
    }

    return {
      id: userId,
      roles: uniqueRoleIds.sort(),
      permissions: {
        globals: Array.from(globalPermissionsSet).sort(),
        business: businessPermissions,
        unit: unitPermissions,
      },
      isAdmin,
      own: {
        business: Array.from(ownedBusinesses).sort(),
      },
    };
  }

  async getUserSession(userId: string): Promise<IAuthzSnapshot | null> {
    const key = CreateUserPermissionSnapshotCacheKey(userId)

    console.log(`[PermissionSnapshotService] Getting session for user ${userId}`);

    // 1 - tenta cache
    const cached = await this.cacheRepository.get<IAuthzSnapshot>(key);
    if (cached) {
      console.log(`[PermissionSnapshotService] Cache HIT for user ${userId}`);
      return cached;
    }

    console.log(`[PermissionSnapshotService] Cache MISS for user ${userId}`);

    // 2 - verifica se user existe
    const user = await this.userRepository.findById(userId);
    if (!user) {
      console.log(`[PermissionSnapshotService] User ${userId} not found`);
      return null;
    }

    // 3 - monta o snapshot
    console.log(`[PermissionSnapshotService] Building session snapshot for user ${userId}`);
    const session = await this.buildUserAuthorizationSnapshot(userId);

    // 4 - salva no cache
    console.log(
      `[PermissionSnapshotService] Saving session to cache with key: ${key}, TTL: ${this.TTL}s`,
    );
    await this.cacheRepository.set(key, session, this.TTL);
    console.log(`[PermissionSnapshotService] Session saved successfully for user ${userId}`);

    return session;
  }

  async invalidateSession(userId: string): Promise<void> {
    console.log(`[PermissionSnapshotService] Invalidating session for user ${userId}`);
    await this.cacheRepository.del(CreateUserPermissionSnapshotCacheKey(userId));
  }
}
