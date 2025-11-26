import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { DomainError } from "@business/domain/errors";

export async function errorHandlerMiddleware(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Se for um erro de domínio conhecido
  if (error instanceof DomainError) {
    return reply.status(error.statusCode).send({
      error: error.message,
      statusCode: error.statusCode
    });
  }

  // Log de erros desconhecidos para debug
  console.error("Unhandled error:", error);

  // Erro genérico para erros não tratados
  return reply.status(500).send({
    error: "Internal server error",
    statusCode: 500
  });
}
