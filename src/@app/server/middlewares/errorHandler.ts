import { DomainException } from "@shared/domain/exceptions/DomainException";
import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";

/**
 * Global Error Handler Middleware
 * Handles all errors and formats appropriate responses
 * Supports DomainException, ZodError, and Fastify errors
 */
export async function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  request.log.error(error);

  // Domain exceptions (business logic errors)
  if (error instanceof DomainException) {
    return reply.status(error.statusCode).send({
      error: error.name,
      message: error.message,
      code: error.code,
      requestId: request.id,
    });
  }

  // Zod validation errors
  if (error instanceof ZodError) {
    const validationErrors = error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));

    await reply.status(400).send({
      error: "ValidationError",
      message: "Request validation failed",
      details: validationErrors,
      requestId: request.id,
    });
    return;
  }

  // Fastify errors
  if ("statusCode" in error) {
    await reply.status(error.statusCode ?? 500).send({
      error: error.name,
      message: error.message,
      requestId: request.id,
    });
  }

  // Unhandled errors
  return reply.status(500).send({
    error: "InternalServerError",
    message:
      process.env.NODE_ENV === "production"
        ? "An unexpected error occurred"
        : error.message,
    requestId: request.id,
  });
}
