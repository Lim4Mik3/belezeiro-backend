import { IUnitRepository } from '@core/app/contracts/repositories/i-unit-repository';

class UseCase {
  constructor(
    private UnitRepository: IUnitRepository,
  ) { }

  async execute(input: UseCase.Input): Promise<UseCase.Output> {
    const { unitId } = input;

    const unit = await this.UnitRepository.findById(unitId);

    if (!unit) {
      throw new Error("Unit not found");
    }

    return {
      id: unit.id,
      name: unit.name,
      businessId: unit.businessId,
      createdAt: unit.createdAt,
      updatedAt: unit.updatedAt
    };
  }
}

namespace UseCase {
  export type Input = {
    unitId: string;
  }

  export type Output = {
    id: string;
    name: string;
    businessId: string;
    createdAt: Date;
    updatedAt: Date;
  }
}

export { UseCase as GetUnitUseCase };
