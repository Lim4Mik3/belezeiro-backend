import { IUnitRepository } from '@core/contracts/repositories/i-unit-repository';
import { IBusinessRepository } from '@core/contracts/repositories/i-business-repository';

class UseCase {
  constructor(
    private UnitRepository: IUnitRepository,
    private BusinessRepository: IBusinessRepository,
  ) { }

  async execute(input: UseCase.Input): Promise<UseCase.Output> {
    const { businessId } = input;

    const business = await this.BusinessRepository.findById(businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    return {
      businessId,
      units: business.units.map((unit: { id: string; name: string; businessId: string; createdAt: Date; updatedAt: Date }) => ({
        id: unit.id,
        name: unit.name,
        businessId: unit.businessId,
        createdAt: unit.createdAt,
        updatedAt: unit.updatedAt
      })),
      total: business.units.length
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
