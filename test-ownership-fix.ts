/**
 * Script to test business ownership fix
 *
 * This script will:
 * 1. Get role assignments for a user
 * 2. Invalidate user session cache
 * 3. Generate new session snapshot
 * 4. Display the snapshot to verify owned businesses appear
 */

import { makeRoleAssignmentRepository } from "./packages/iam/main/factories/repositories/make-role-assignment-repository.factory";
import { makePermissionSnapshotServiceIAM } from "./packages/iam/main/factories/services/make-permission-snapshot-iam.factory";

async function testOwnershipFix(userId: string) {
  console.log("=".repeat(60));
  console.log("Testing Business Ownership Fix");
  console.log("=".repeat(60));
  console.log(`User ID: ${userId}\n`);

  const roleAssignmentRepo = makeRoleAssignmentRepository();
  const permissionSnapshotService = makePermissionSnapshotServiceIAM();

  // 1. Get all role assignments
  console.log("📋 Fetching role assignments...");
  const assignments = await roleAssignmentRepo.findActiveByUserId(userId);
  console.log(`Found ${assignments.length} active role assignments:\n`);

  for (const assignment of assignments) {
    console.log(`  - Role: ${assignment.roleId}`);
    console.log(`    Target: ${assignment.targetId || "(global)"}`);
    console.log(`    Assigned: ${assignment.assignedAt.toISOString()}`);
    console.log();
  }

  // 2. Invalidate cache
  console.log("🗑️  Invalidating session cache...");
  await permissionSnapshotService.invalidateSession(userId);
  console.log("✅ Cache invalidated\n");

  // 3. Generate new snapshot
  console.log("🔄 Generating new session snapshot...");
  const snapshot = await permissionSnapshotService.getUserSession(userId);

  if (!snapshot) {
    console.log("❌ Failed to generate snapshot (user not found?)\n");
    return;
  }

  console.log("✅ Snapshot generated successfully!\n");

  // 4. Display snapshot
  console.log("=".repeat(60));
  console.log("Session Snapshot");
  console.log("=".repeat(60));
  console.log(JSON.stringify(snapshot, null, 2));
  console.log();

  // 5. Verify owned businesses
  console.log("=".repeat(60));
  console.log("Verification");
  console.log("=".repeat(60));

  if (snapshot.own.business.length > 0) {
    console.log("✅ SUCCESS! Owned businesses found:");
    snapshot.own.business.forEach((businessId) => {
      console.log(`   - ${businessId}`);
    });
  } else {
    console.log("❌ FAILED! No owned businesses found.");
    console.log("   This could mean:");
    console.log("   1. User has no BUSINESS_OWNER role assignments");
    console.log("   2. The fix didn't work as expected");
  }

  console.log();
}

// Get user ID from command line argument
const userId = process.argv[2];

if (!userId) {
  console.error("❌ Error: User ID is required");
  console.error("Usage: bun test-ownership-fix.ts <user-id>");
  process.exit(1);
}

testOwnershipFix(userId)
  .then(() => {
    console.log("✅ Test completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });
