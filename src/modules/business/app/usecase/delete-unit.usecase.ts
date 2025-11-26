import { IEventBus } from "@core/app/contracts/event-bus/i-event-bus";
import { IBusinessRepository } from 'packages/_core_/app/contracts/repositories/i-business-repository';
import { IUnitRepository } from 'packages/_core_/app/contracts/repositories/i-unit-repository';
import { BusinessNotFoundError, UnitNotFoundError } from "@business/domain/errors";

class UseCase {
  constructor(
    private BusinessRepository: IBusinessRepository,
    private UnitRepository: IUnitRepository,
    private EventBus: IEventBus,
  ) { }

  async execute(input: UseCase.Input): Promise<UseCase.Output> {
    const { unitId } = input;

    const unit = await this.UnitRepository.findById(unitId);
    if (!unit) {
      throw new UnitNotFoundError();
    }

    const business = await this.BusinessRepository.findById(unit.businessId);
    if (!business) {
      throw new BusinessNotFoundError();
    }

    business.deleteUnit(unitId);
    await this.BusinessRepository.update(business);

    await this.UnitRepository.delete(unit.id);

    await this.EventBus.publishBatch([
      ...business.getDomainEvents(),
      ...unit.getDomainEvents(),
    ])

    business.clearDomainEvents();
    unit.clearDomainEvents();

    return {
      success: true,
    };
  }
}

namespace UseCase {
  export type Input = {
    unitId: string;
  }

  export type Output = {
    success: boolean;
  }
}

export { UseCase as DeleteUnitUseCase };
