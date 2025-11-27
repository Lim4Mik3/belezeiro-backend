import type { MiddlewareObj } from '@middy/core';
import type { APIGatewayProxyEventV2, APIGatewayProxyResult } from 'aws-lambda';

interface ParsedEvent extends APIGatewayProxyEventV2 {
  body: any;
}

/**
 * Middleware customizado do Middy para parsing de JSON body
 *
 * Converte automaticamente o body da requisi��o de string para objeto JSON
 * Adiciona valida��o e tratamento de erros de parsing
 */
export const httpBodyJsonMiddleware = (): MiddlewareObj<APIGatewayProxyEventV2, APIGatewayProxyResult> => {
  return {
    before: async (request) => {
      const event = request.event as ParsedEvent;

      // Se n�o houver body, n�o faz nada
      if (!event.body) {
        return;
      }

      // Se o body j� for um objeto (j� foi parseado), n�o faz nada
      if (typeof event.body !== 'string') {
        return;
      }

      try {
        // Tenta fazer o parse do JSON
        event.body = JSON.parse(event.body);
      } catch (error) {
        // Se falhar no parse, lan�a um erro de valida��o
        const parseError = new Error('Invalid JSON body');
        parseError.name = 'ValidationError';
        (parseError as any).statusCode = 400;
        (parseError as any).details = {
          message: 'The request body must be valid JSON',
          originalError: (error as Error).message,
        };

        throw parseError;
      }

      if (process.env.DEBUG_REQUESTS === 'true') {
        console.log('Parsed body:', event.body);
      }
    },
  };
};
