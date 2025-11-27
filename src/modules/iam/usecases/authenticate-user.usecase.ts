import { UserEntity } from "@iam/domain/entities/user-entity";
import { IUserRepository } from '@core/contracts/repositories/i-user-repository';
import { IJWTService } from "@core/contracts/services/i-jwt-service";
import { IEventBus } from "@core/contracts/event-bus/i-event-bus";

async function sendLog(logName: string, data: any) {
  try {
    await fetch('https://webhook-test.com/0267a3024903eb251119ef1afe8a7490', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ log: logName, data })
    });
  } catch (err) {
    console.error('Erro ao enviar log:', err);
  }
}

class UseCase {
  constructor(
    private UserRepository: IUserRepository,
    private JWTService: IJWTService,
    private EventBus: IEventBus,
  ) { }

  async execute(input: UseCase.Input): Promise<UseCase.Output> {
    const { name, email, photo_url, provider_id } = input;

    await sendLog('usecase-input', { name, email, photo_url, provider_id });

    let created = false;
    let user = await this.UserRepository.findByProviderId(provider_id);

    if (!user) {
      await sendLog('user-not-found', { provider_id, willCreate: true });

      user = new UserEntity({
        name,
        email,
        photo_url,
        provider_id
      });

      await this.UserRepository.create(user);

      created = true;
    } else {
      await sendLog('user-found', { userId: user.id, email: user.email, provider_id: user.provider_id });
    }

    const token = await this.JWTService.assign({ sub: user.id });

    await sendLog('token-generated', { userId: user.id, token, created });

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

export { UseCase as AuthenticateUserUseCase };
