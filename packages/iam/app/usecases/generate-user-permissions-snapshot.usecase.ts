import { IEventBus } from "@core/bus/i-event-bus";
import { IUserRepository } from "../contracts/repositories/i-user-repository";
import { UserAuthenticatedEvent } from "@iam/domain/events/user-authenticate";

class UseCase {
  constructor(
    private UserRepository: IUserRepository,
    private EventBus: IEventBus,
  ) { }

  async execute(input: UseCase.Input): Promise<UseCase.Output> {

  }
}

namespace UseCase {
  export type Input = UserAuthenticatedEvent;

  export type Output = void;
}

export { UseCase as GenerateUserPermissionsSnapshotUseCase };
