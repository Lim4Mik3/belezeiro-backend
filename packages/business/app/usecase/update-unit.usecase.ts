import { IEventBus } from "@core/bus/i-event-bus";
import { IUnitRepository } from "../contracts/repositories/i-unit-repository";

class UseCase {
  constructor(
    private UnitRepository: IUnitRepository,
    private EventBus: IEventBus,
  ) { }

  async execute(input: UseCase.Input): Promise<UseCase.Output> {
    const { unitId, name } = input;

    const unit = await this.UnitRepository.findById(unitId);

    if (!unit) {
      throw new Error("Unit not found");
    }

    // Atualizar nome se fornecido
    if (name) {
      unit.updateName(name);
    }

    // Persistir
    await this.UnitRepository.update(unit);

    // Emitir eventos de domínio (se houver)
    const events = unit.getDomainEvents();
    for (const event of events) {
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
