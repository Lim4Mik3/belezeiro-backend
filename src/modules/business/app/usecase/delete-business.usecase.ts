import { IEventBus } from "@core/app/contracts/event-bus/i-event-bus";
import { IBusinessRepository } from 'packages/_core_/app/contracts/repositories/i-business-repository';

class UseCase {
  constructor(
    private BusinessRepository: IBusinessRepository,
    private EventBus: IEventBus,
  ) { }

  async execute(input: UseCase.Input): Promise<UseCase.Output> {
    const { businessId } = input;

    const business = await this.BusinessRepository.findById(businessId);

    if (!business) {
      throw new Error("Business not found");
    }

    // Deletar
    await this.BusinessRepository.delete(businessId);

    // Emitir eventos de domínio (se houver)
    const events = business.getDomainEvents();
    for (const event of events) {
      await this.EventBus.publish(event);
    }
    business.clearDomainEvents();

    return {
      success: true,
      id: businessId
    };
  }
}

namespace UseCase {
  export type Input = {
    businessId: string;
  }

  export type Output = {
    success: boolean;
    id: string;
  }
}

export { UseCase as DeleteBusinessUseCase };
