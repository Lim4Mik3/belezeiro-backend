import type { MiddlewareObj } from '@middy/core';
import type { APIGatewayProxyResult } from 'aws-lambda';
import { DomainError } from '@business/domain/errors';

interface ErrorResponse {
  error: string;
  statusCode: number;
  details?: unknown;
}

export const errorMiddleware = (): MiddlewareObj<any, APIGatewayProxyResult> => {
  return {
    onError: async (request) => {
      const error = request.error;

      // Log do erro para observabilidade
      console.error('Lambda error:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
        event: request.event,
      });

      let response: ErrorResponse;

      // Se for um erro de dom�nio conhecido
      if (error instanceof DomainError) {
        response = {
          error: error.message,
          statusCode: error.statusCode,
        };
      }
      // Erros de valida��o (pode adicionar outras bibliotecas de valida��o)
      else if (error?.name === 'ValidationError') {
        response = {
          error: 'Validation error',
          statusCode: 400,
          details: (error as any).details || error.message,
        };
      }
      // Erros de autoriza��o
      else if (error?.name === 'UnauthorizedError' || error?.message?.includes('Unauthorized')) {
        response = {
          error: 'Unauthorized',
          statusCode: 401,
        };
      }
      // Erros de permiss�o
      else if (error?.name === 'ForbiddenError' || error?.message?.includes('Forbidden')) {
        response = {
          error: 'Forbidden',
          statusCode: 403,
        };
      }
      // Erro gen�rico para erros n�o tratados
      else {
        response = {
          error: 'Internal server error',
          statusCode: 500,
        };

        // Em produ��o, n�o expor detalhes do erro interno
        if (process.env.NODE_ENV !== 'production') {
          response.details = {
            message: error?.message,
            name: error?.name,
          };
        }
      }

      // Define a resposta formatada
      const responseBody: { error: string; details?: unknown } = {
        error: response.error,
      };

      if (response.details) {
        responseBody.details = response.details;
      }

      request.response = {
        statusCode: response.statusCode,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(responseBody),
      };

      // Retorna para n�o propagar o erro
      return request.response;
    },
  };
};
