import { IEventBus } from "@core/app/contracts/event-bus/i-event-bus";
import { IBusinessRepository } from 'packages/_core_/app/contracts/repositories/i-business-repository';
import { UnitEntity } from "@business/domain/entities/unit-entity";
import { BusinessNotFoundError } from "@business/domain/errors";

class UseCase {
  constructor(
    private BusinessRepository: IBusinessRepository,
    private EventBus: IEventBus,
  ) { }

  async execute(input: UseCase.Input): Promise<UseCase.Output> {
    const { businessId, name } = input;

    // Buscar business (agregado raiz)
    const business = await this.BusinessRepository.findById(businessId);
    if (!business) {
      throw new BusinessNotFoundError();
    }

    // Criar unit
    const unit = new UnitEntity({
      name,
      business_id: businessId
    });

    // Adicionar unit ao agregado business
    business.createUnit(unit);

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
      businessId: unit.businessId
    };
  }
}

namespace UseCase {
  export type Input = {
    businessId: string;
    name: string;
  }

  export type Output = {
    id: string;
    name: string;
    businessId: string;
  }
}

export { UseCase as CreateUnitUseCase };
