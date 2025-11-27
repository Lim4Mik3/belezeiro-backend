import { BaseEntity } from '@core/domain/entities/base-entity';
import { makeGetMeUseCase } from '@iam/factories/usecases/make-get-me.factory';
import { makeIDGeneratorService } from '@infra/factories/services/id-generator-service-factory';
import { errorMiddleware, httpBodyJsonMiddleware } from '@infra/middlewares';
import { AuthenticatedEvent, MiddyAuthMiddleware } from '@infra/middlewares/middy-auth-middleware';
import { response } from '@infra/utils/response-utils';
import middy from '@middy/core';
import httpCors from '@middy/http-cors';

import { APIGatewayProxyResult } from 'aws-lambda';

BaseEntity.configure({
  IDGenerator: makeIDGeneratorService(),
})

const handle = async (event: AuthenticatedEvent): Promise<APIGatewayProxyResult> => {
  const usecase = makeGetMeUseCase();

  const result = await usecase.execute({ userId: event.userId });

  return response(result);
};

export const handler = middy(handle)
  .use(httpBodyJsonMiddleware())
  .use(MiddyAuthMiddleware())
  .use(httpCors({
    origin: '*',
    credentials: true,
  }))
  .use(errorMiddleware());
