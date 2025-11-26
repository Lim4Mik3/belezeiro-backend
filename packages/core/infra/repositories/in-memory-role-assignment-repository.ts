import { IRoleAssignmentRepository } from '../../app/contracts/repositories/i-role-assignment-repository';

export class InMemoryRoleAssignmentRepository
  implements IRoleAssignmentRepository
{
  private assignments: Map<string, any> = new Map();

  async create(assignment: any): Promise<void> {
    this.assignments.set(assignment.id, assignment);
  }

  async findById(id: string): Promise<any | null> {
    return this.assignments.get(id) || null;
  }

  async findByUserId(userId: string): Promise<any[]> {
    return Array.from(this.assignments.values()).filter(
      (a) => a.userId === userId,
    );
  }

  async findByUserIdAndRoleId(
    userId: string,
    roleId: string,
  ): Promise<any | null> {
    for (const assignment of this.assignments.values()) {
      if (assignment.userId === userId && assignment.roleId === roleId) {
        return assignment;
      }
    }
    return null;
  }

  async findByUserIdAndTargetId(
    userId: string,
    targetId: string | null,
  ): Promise<any[]> {
    return Array.from(this.assignments.values()).filter(
      (a) => a.userId === userId && a.targetId === targetId,
    );
  }

  async findActiveByUserId(userId: string): Promise<any[]> {
    return Array.from(this.assignments.values()).filter(
      (a) => a.userId === userId && (typeof a.isActive === 'function' ? a.isActive() : true),
    );
  }

  async findAll(): Promise<any[]> {
    return Array.from(this.assignments.values());
  }

  async update(assignment: any): Promise<void> {
    this.assignments.set(assignment.id, assignment);
  }

  async delete(id: string): Promise<void> {
    this.assignments.delete(id);
  }

  async deleteByUserId(userId: string): Promise<void> {
    for (const [id, assignment] of this.assignments.entries()) {
      if (assignment.userId === userId) {
        this.assignments.delete(id);
      }
    }
  }
}
