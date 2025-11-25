import { IUnitRepository } from "../contracts/repositories/i-unit-repository";
import { IBusinessRepository } from "../contracts/repositories/i-business-repository";

class UseCase {
  constructor(
    private UnitRepository: IUnitRepository,
    private BusinessRepository: IBusinessRepository,
  ) { }

  async execute(input: UseCase.Input): Promise<UseCase.Output> {
    const { businessId } = input;

    // Validar se business existe
    const business = await this.BusinessRepository.findById(businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    const units = await this.UnitRepository.findByBusinessId(businessId);

    return {
      businessId,
      units: units.map(unit => ({
        id: unit.id,
        name: unit.name,
        businessId: unit.businessId,
        createdAt: unit.createdAt,
        updatedAt: unit.updatedAt
      })),
      total: units.length
    };
  }
}

namespace UseCase {
  export type Input = {
    businessId: string;
  }

  export type Output = {
    businessId: string;
    units: Array<{
      id: string;
      name: string;
      businessId: string;
      createdAt: Date;
      updatedAt: Date;
    }>;
    total: number;
  }
}

export { UseCase as ListUnitsByBusinessUseCase };
