import { IBusinessRepository } from '@core/app/contracts/repositories/i-business-repository';

class UseCase {
  constructor(
    private BusinessRepository: IBusinessRepository,
  ) { }

  async execute(input: UseCase.Input): Promise<UseCase.Output> {
    const { businessId } = input;

    const business = await this.BusinessRepository.findById(businessId);

    if (!business) {
      throw new Error("Business not found");
    }

    return {
      businessId: business.id,
      name: business.name,
      units: business.units.map((unit: { id: string; name: string; businessId: string }) => ({
        unitId: unit.id,
        name: unit.name,
        businessId: unit.businessId
      })),
      createdAt: business.createdAt,
      updatedAt: business.updatedAt
    };
  }
}

namespace UseCase {
  export type Input = {
    businessId: string;
  }

  export type Output = {
    businessId: string;
    name: string;
    units: Array<{
      unitId: string;
      name: string;
      businessId: string;
    }>;
    createdAt: Date;
    updatedAt: Date;
  }
}

export { UseCase as GetBusinessUseCase };
