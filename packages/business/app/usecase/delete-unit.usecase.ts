import { IEventBus } from "@core/bus/i-event-bus";
import { IUnitRepository } from "../contracts/repositories/i-unit-repository";

class UseCase {
  constructor(
    private UnitRepository: IUnitRepository,
    private EventBus: IEventBus,
  ) { }

  async execute(input: UseCase.Input): Promise<UseCase.Output> {
    const { unitId } = input;

    const unit = await this.UnitRepository.findById(unitId);

    if (!unit) {
      throw new Error("Unit not found");
    }

    // Deletar
    await this.UnitRepository.delete(unitId);

    // Emitir eventos de domínio (se houver)
    const events = unit.getDomainEvents();
    for (const event of events) {
      await this.EventBus.publish(event);
    }
    unit.clearDomainEvents();

    return {
      success: true,
      id: unitId
    };
  }
}

namespace UseCase {
  export type Input = {
    unitId: string;
  }

  export type Output = {
    success: boolean;
    id: string;
  }
}

export { UseCase as DeleteUnitUseCase };
