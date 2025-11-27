import { makeAuthenticateUser } from '@iam/factories/usecases/make-authenticate-user.factory';
import { errorMiddleware, httpBodyJsonMiddleware } from '@infra/middlewares';
import { response } from '@infra/utils/response-utils';
import middy from '@middy/core';
import httpCors from '@middy/http-cors';

import { APIGatewayProxyEventV2, APIGatewayProxyResult } from 'aws-lambda';
import z from 'zod';

export const BodySchema = z.object({
  provider_id: z.string().min(1, 'Provider ID is required'),
  name: z.string().min(3, 'Name must have at least 3 characters'),
  email: z.string().email('Invalid email format'),
  photo_url: z.string().url('Invalid URL format').nullable(),
});

const handle = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> => {
  const payload = BodySchema.parse(event.body);

  const usecase = makeAuthenticateUser();

  const { created, token } = await usecase.execute({
    name: payload.name,
    email: payload.email,
    photo_url: payload.photo_url,
    provider_id: payload.provider_id
  });

  return response({ token }, { statusCode: created ? 201 : 200 });
};

export const handler = middy(handle)
  .use(httpBodyJsonMiddleware())
  .use(httpCors({
    origin: '*',
    credentials: true,
  }))
  .use(errorMiddleware());
