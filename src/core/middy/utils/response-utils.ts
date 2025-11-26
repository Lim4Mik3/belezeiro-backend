import type { APIGatewayProxyResult } from 'aws-lambda';

export interface ResponseConfig {
  statusCode?: number;
  headers?: Record<string, string | boolean | number>;
  cookies?: string[];
}

/**
 * Cria uma resposta HTTP formatada para AWS Lambda
 *
 * @param payload - Dados a serem retornados no body (ser� convertido para JSON)
 * @param config - Configura��es opcionais da resposta (statusCode, headers, cookies)
 * @returns Objeto de resposta no formato esperado pela AWS Lambda
 *
 * @example
 * ```ts
 * return createResponse({ message: 'Success', data: user }, {
 *   statusCode: 201,
 *   headers: { 'X-Custom-Header': 'value' },
 *   cookies: ['session=abc123; HttpOnly; Secure']
 * });
 * ```
 */
export function response(
  payload: unknown,
  config: ResponseConfig = {}
): APIGatewayProxyResult {
  const {
    statusCode = 200,
    headers = {},
    cookies = [],
  } = config;

  // Headers padrao
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const mergedHeaders = {
    ...defaultHeaders,
    ...Object.entries(headers).reduce((acc, [key, value]) => {
      acc[key] = String(value);
      return acc;
    }, {} as Record<string, string>),
  };

  return {
    statusCode,
    headers: mergedHeaders,
    ...(cookies.length > 0 && { cookies }),
    body: JSON.stringify(payload),
  };
};
