import { UserEntity } from "@iam/domain/entities/user-entity";
import { IUserRepository } from '@core/app/contracts/repositories/i-user-repository';
import { IJWTService } from "@core/app/contracts/services/i-jwt-service";
import { IEventBus } from "@core/bus/i-event-bus";

class UseCase {
  constructor(
    private UserRepository: IUserRepository,
    private JWTService: IJWTService,
    private EventBus: IEventBus,
  ) { }

  async execute(input: UseCase.Input): Promise<UseCase.Output> {
    const { name, email, photo_url, provider_id } = input;

    let created = false;
    let user = await this.UserRepository.findUserByProviderID(provider_id);

    if (!user) {
      user = new UserEntity({
        name,
        email,
        photo_url,
        provider_id
      });

      await this.UserRepository.create(user);

      created = true;
    }

    const token = await this.JWTService.assign({ sub: user.id });

    user.authenticated(created, "google");

    const events = user.getDomainEvents();

    for (const event of events) {
      await this.EventBus.publish(event);
    }
    user.clearDomainEvents();

    return { token, created };
  }
}

namespace UseCase {
  export type Input = {
    name: string;
    email: string;
    photo_url: string | null;
    provider_id: string;
  }

  export type Output = { token: string, created: boolean; }
}

export { UseCase as AuthenticateUserWithGoogleUseCase };
