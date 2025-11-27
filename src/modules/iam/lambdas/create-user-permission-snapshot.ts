import { BaseEntity } from '@core/domain/entities/base-entity';
import { UserAuthenticatedEvent } from '@iam/domain/events/user-authenticate';
import { makeGenerateUserSessionSnapshot } from '@iam/factories/usecases/generate-user-session-snapshot.factory';
import { makeIDGeneratorService } from '@infra/factories/services/id-generator-service-factory';
import { errorMiddleware } from '@infra/middlewares';
import middy from '@middy/core';

import { EventBridgeEvent } from 'aws-lambda';

BaseEntity.configure({
  IDGenerator: makeIDGeneratorService(),
})

type EventPayload = EventBridgeEvent<'iam.user.authenticated.v1', UserAuthenticatedEvent>;

const handle = async (event: EventPayload): Promise<void> => {
  console.log('[Lambda] create-user-permission-snapshot started');
  console.log('[Lambda] Event received:', JSON.stringify(event, null, 2));

  const service = makeGenerateUserSessionSnapshot();
  console.log('[Lambda] Service instance created');

  await service.execute(event.detail);
  console.log('[Lambda] Service execution completed');
};

export const handler = middy(handle)
  .use(errorMiddleware());
