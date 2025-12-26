import { IGetGreetingUseCase } from "@contexts/greetings/application/v2/ports/inbound/IGetGreetingUseCase";
import { ILogger } from "@shared/infrastructure/observability/ILogger";
import { isFailure } from "@shared/types/result";
import { FastifyReply, FastifyRequest } from "fastify";

/**
 * Greeting Controller (Fastify v2)
 * Handles HTTP requests for greeting endpoints (v2)
 * Delegates business logic to use cases
 * Handles Result type from use cases
 */
export class GreetingController {
  constructor(
    private readonly getGreetingUseCase: IGetGreetingUseCase,
    private readonly logger: ILogger
  ) {}

  async handle(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    this.logger.info("GET /api/v2/greetings request received", {
      requestId: request.id,
    });

    const result = await this.getGreetingUseCase.execute();

    if (isFailure(result)) {
      this.logger.error("Failed to get greeting", result.error);
      return reply.status(result.error.statusCode).send({
        error: result.error.name,
        message: result.error.message,
        code: result.error.code,
        requestId: request.id,
      });
    }

    return reply.status(200).send(result.value);
  }
}
