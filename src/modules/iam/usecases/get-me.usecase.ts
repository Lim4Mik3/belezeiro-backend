import { IUserRepository } from "@core/contracts/repositories/i-user-repository"

class UseCase {
  constructor(
    private UserRepository: IUserRepository,
  ) { }

  async execute(input: UseCase.Input): Promise<UseCase.Output> {
    const user = await this.UserRepository.findById(input.userId);

    if (!user) {
      throw new Error("User not found.");
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email.value,
    }
  }
}

namespace UseCase {
  export type Input = { userId: string; }

  export type Output = {
    id: string;
    name: string;
    email: string;
  }
}

export { UseCase as GetMeUseCase }
