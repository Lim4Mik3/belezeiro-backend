import { IEventBus } from "@core/bus/i-event-bus";
import { IBusinessRepository } from "../contracts/repositories/i-business-repository";
import { BusinessEntity } from "@business/domain/entities/business-entity";
import { UnitEntity } from "@business/domain/entities/unit-entity";

class UseCase {
  constructor(
    private BusinessRepository: IBusinessRepository,
    private EventBus: IEventBus,
  ) { }

  async execute(input: UseCase.Input): Promise<UseCase.Output> {
    const business = new BusinessEntity({
      name: input.name,
      units: []
    });

    input.units.map(unit => {
      business.createUnit(
        new UnitEntity({
          name: unit.name,
          business_id: business.id
        })
      )
    });

    // Persistir
    await this.BusinessRepository.create(business);

    // Emitir eventos de domínio (se houver)
    const events = business.getDomainEvents();
    for (const event of events) {
      await this.EventBus.publish(event);
    }
    business.clearDomainEvents();

    return {
      id: business.id,
      name: business.name
    };
  }
}

namespace UseCase {
  export type Input = {
    name: string;
    units: Array<{
      name: string;
    }>;
  }

  export type Output = {
    id: string;
    name: string;
  }
}

export { UseCase as CreateBusinessUseCase };
