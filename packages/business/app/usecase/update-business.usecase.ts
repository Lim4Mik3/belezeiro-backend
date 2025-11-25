import { IEventBus } from "@core/bus/i-event-bus";
import { IBusinessRepository } from "../contracts/repositories/i-business-repository";

class UseCase {
  constructor(
    private BusinessRepository: IBusinessRepository,
    private EventBus: IEventBus,
  ) { }

  async execute(input: UseCase.Input): Promise<UseCase.Output> {
    const { businessId, name } = input;

    const business = await this.BusinessRepository.findById(businessId);

    if (!business) {
      throw new Error("Business not found");
    }

    // Persistir
    await this.BusinessRepository.update(business);

    // Emitir eventos de domínio (se houver)
    const events = business.getDomainEvents();
    for (const event of events) {
      await this.EventBus.publish(event);
    }
    business.clearDomainEvents();

    return {
      businessId: business.id,
      name: business.name,
      updatedAt: business.updatedAt
    };
  }
}

namespace UseCase {
  export type Input = {
    businessId: string;
    name?: string;
  }

  export type Output = {
    businessId: string;
    name: string;
    updatedAt: Date;
  }
}

export { UseCase as UpdateBusinessUseCase };
