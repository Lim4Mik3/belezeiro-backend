import { IRoleDefinitionRepository } from '../../app/contracts/repositories/i-role-definition-repository';

export class InMemoryRoleDefinitionRepository
  implements IRoleDefinitionRepository
{
  private roleDefinitions: Map<string, any> = new Map();

  async create(roleDefinition: any): Promise<void> {
    this.roleDefinitions.set(roleDefinition.id, roleDefinition);
  }

  async findById(id: string): Promise<any | null> {
    return this.roleDefinitions.get(id) || null;
  }

  async findManyByIds(ids: string[]): Promise<any[]> {
    const results: any[] = [];
    for (const id of ids) {
      const rd = this.roleDefinitions.get(id);
      if (rd) {
        results.push(rd);
      }
    }
    return results;
  }

  async findByName(
    name: string,
    businessId?: string,
  ): Promise<any | null> {
    for (const rd of this.roleDefinitions.values()) {
      const nameMatch = rd.name.toLowerCase() === name.toLowerCase();
      const businessMatch = businessId
        ? rd.business_id === businessId
        : rd.business_id === null;

      if (nameMatch && businessMatch) {
        return rd;
      }
    }
    return null;
  }

  async findGlobalRoleByName(name: string): Promise<any | null> {
    for (const rd of this.roleDefinitions.values()) {
      const isGlobal = typeof rd.isGlobal === 'function' ? rd.isGlobal() : rd.scope === 'GLOBAL';
      if (isGlobal && rd.name.toLowerCase() === name.toLowerCase()) {
        return rd;
      }
    }
    return null;
  }

  async findAll(): Promise<any[]> {
    return Array.from(this.roleDefinitions.values());
  }

  async findByBusinessId(businessId: string): Promise<any[]> {
    return Array.from(this.roleDefinitions.values()).filter(
      (rd) => rd.business_id === businessId,
    );
  }

  async findGlobal(): Promise<any[]> {
    return Array.from(this.roleDefinitions.values()).filter((rd) => {
      return typeof rd.isGlobal === 'function' ? rd.isGlobal() : rd.scope === 'GLOBAL';
    });
  }

  async update(roleDefinition: any): Promise<void> {
    this.roleDefinitions.set(roleDefinition.id, roleDefinition);
  }

  async delete(id: string): Promise<void> {
    this.roleDefinitions.delete(id);
  }
}
