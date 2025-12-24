import { IGetGreetingUseCase } from "@contexts/greetings/application/v1/ports/inbound/IGetGreetingUseCase";
import { ILogger } from "@shared/infrastructure/observability/ILogger";
import { FastifyReply, FastifyRequest } from "fastify";

/**
 * Greeting Controller (Fastify v1)
 * Handles HTTP requests for greeting endpoints
 * Delegates business logic to use cases
 */
export class GreetingController {
  constructor(
    private readonly getGreetingUseCase: IGetGreetingUseCase,
    private readonly logger: ILogger
  ) {}

  async handle(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    this.logger.info("GET /api/v1/greetings request received", {
      requestId: request.id,
    });

    const result = await this.getGreetingUseCase.execute();

    return reply.status(200).send(result);
  }
}
