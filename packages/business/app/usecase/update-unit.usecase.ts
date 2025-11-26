import { IEventBus } from "@core/bus/i-event-bus";
import { IBusinessRepository } from '@core/app/contracts/repositories/i-business-repository';
import { IUnitRepository } from '@core/app/contracts/repositories/i-unit-repository';
import { BusinessNotFoundError, UnitNotFoundError } from "@business/domain/errors";

class UseCase {
  constructor(
    private BusinessRepository: IBusinessRepository,
    private UnitRepository: IUnitRepository,
    private EventBus: IEventBus,
  ) { }

  async execute(input: UseCase.Input): Promise<UseCase.Output> {
    const { unitId, name } = input;

    // Buscar a unit para obter o businessId
    const unit = await this.UnitRepository.findById(unitId);
    if (!unit) {
      throw new UnitNotFoundError();
    }

    // Buscar o business (agregado raiz)
    const business = await this.BusinessRepository.findById(unit.businessId);
    if (!business) {
      throw new BusinessNotFoundError();
    }

    // Atualizar unit através do agregado business
    if (name) {
      business.updateUnit(unitId, name);
    }

    // Persistir o agregado (que também salva as units)
    await this.BusinessRepository.update(business);

    // Emitir eventos de domínio do business
    const businessEvents = business.getDomainEvents();
    for (const event of businessEvents) {
      await this.EventBus.publish(event);
    }
    business.clearDomainEvents();

    // Emitir eventos de domínio da unit
    const unitEvents = unit.getDomainEvents();
    for (const event of unitEvents) {
      await this.EventBus.publish(event);
    }
    unit.clearDomainEvents();

    return {
      id: unit.id,
      name: unit.name,
      businessId: unit.businessId,
      updatedAt: unit.updatedAt
    };
  }
}

namespace UseCase {
  export type Input = {
    unitId: string;
    name?: string;
  }

  export type Output = {
    id: string;
    name: string;
    businessId: string;
    updatedAt: Date;
  }
}

export { UseCase as UpdateUnitUseCase };
