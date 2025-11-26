/**
 * Role Assignment Repository Contract
 * Consolidated from IAM module
 */
export interface IRoleAssignmentRepository {
  create(assignment: any): Promise<void>;
  findById(id: string): Promise<any | null>;
  findByUserId(userId: string): Promise<any[]>;
  findByUserIdAndRoleId(userId: string, roleId: string): Promise<any | null>;
  findByUserIdAndTargetId(userId: string, targetId: string | null): Promise<any[]>;
  findActiveByUserId(userId: string): Promise<any[]>;
  findAll(): Promise<any[]>;
  update(assignment: any): Promise<void>;
  delete(id: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
}
