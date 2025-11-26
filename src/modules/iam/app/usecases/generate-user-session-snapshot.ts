import { UserAuthenticatedEvent } from "@iam/domain/events/user-authenticate";
import { IPermissionSnapshotService } from "@core/contracts/services/i-permissions-snapshot-service";

class UseCase {
  constructor(
    private PermissionSnapshotService: IPermissionSnapshotService,
  ) { }

  async execute(input: UseCase.Input): Promise<UseCase.Output> {
    const { userId } = input.data;

    await this.PermissionSnapshotService.getUserSession(userId);
  }
}

namespace UseCase {
  export type Input = UserAuthenticatedEvent;

  export type Output = void;
}

export { UseCase as GenerateUserSessionSnapshot };
