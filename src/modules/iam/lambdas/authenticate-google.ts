import middy from '@middy/core';
import httpCors from '@middy/http-cors';
import type { APIGatewayProxyEventV2, APIGatewayProxyResult } from 'aws-lambda';
import { errorMiddleware, httpBodyJsonMiddleware } from '@infra/middlewares';
import { response } from '@infra/utils/response-utils';
import { makeAuthenticateUserWithGoogleUseCase } from '@iam/main/factories/usecases/make-authenticate-user-with-google.factory';

const handle = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> => {
  const usecase = makeAuthenticateUserWithGoogleUseCase();

  await usecase.execute({} as any);

  return response({ ok: true });
};

export const handler = middy(handle)
  .use(httpBodyJsonMiddleware())
  .use(httpCors({
    origin: '*',
    credentials: true,
  }))
  .use(errorMiddleware());
