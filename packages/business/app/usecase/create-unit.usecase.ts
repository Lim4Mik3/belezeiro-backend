import { IEventBus } from "@core/bus/i-event-bus";
import { IUnitRepository } from "../contracts/repositories/i-unit-repository";
import { IBusinessRepository } from "../contracts/repositories/i-business-repository";
import { UnitEntity } from "@business/domain/entities/unit-entity";

class UseCase {
  constructor(
    private UnitRepository: IUnitRepository,
    private BusinessRepository: IBusinessRepository,
    private EventBus: IEventBus,
  ) { }

  async execute(input: UseCase.Input): Promise<UseCase.Output> {
    const { businessId, name } = input;

    // Validar se business existe
    const business = await this.BusinessRepository.findById(businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    // Criar unit
    const unit = new UnitEntity({
      name,
      business_id: businessId
    });

    // Persistir
    await this.UnitRepository.create(unit);

    // Emitir eventos de domínio (se houver)
    const events = unit.getDomainEvents();
    for (const event of events) {
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
