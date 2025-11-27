import { UserAuthenticatedEvent } from "@iam/domain/events/user-authenticate";
import { IPermissionSnapshotService } from "@core/contracts/services/i-permissions-snapshot-service";

class UseCase {
  constructor(
    private PermissionSnapshotService: IPermissionSnapshotService,
  ) { }

  async execute(input: UseCase.Input): Promise<UseCase.Output> {
    console.log('[UseCase] GenerateUserSessionSnapshot.execute started');
    console.log('[UseCase] Input received:', JSON.stringify(input, null, 2));

    const { userId } = input.data;
    console.log('[UseCase] Extracted userId:', userId);

    console.log('[UseCase] Calling PermissionSnapshotService.getUserSession...');
    const result = await this.PermissionSnapshotService.getUserSession(userId);
    console.log('[UseCase] PermissionSnapshotService.getUserSession completed');
    console.log('[UseCase] Result:', JSON.stringify(result, null, 2));
  }
}

namespace UseCase {
  export type Input = UserAuthenticatedEvent;

  export type Output = void;
}

export { UseCase as GenerateUserSessionSnapshot };
