import { beforeEach, describe, expect, it, vi } from "vitest";

import { GetGreetingUseCase } from "@contexts/greetings/application/v1/use-cases/GetGreetingUseCase";
import { IGreetingRepository } from "@contexts/greetings/application/v1/ports/outbound/IGreetingRepository";
import { ILogger } from "@shared/infrastructure/observability/ILogger";
import { Greeting } from "@contexts/greetings/domain/entities/Greeting";

describe("GetGreetingUseCase", () => {
  let useCase: GetGreetingUseCase;
  let mockRepository: IGreetingRepository;
  let mockLogger: ILogger;

  beforeEach(() => {
    mockRepository = {
      getGreeting: vi.fn(),
      save: vi.fn(),
    };

    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    };

    useCase = new GetGreetingUseCase(mockRepository, mockLogger);
  });

  it("should return greeting DTO from repository", async () => {
    const greeting = Greeting.create("Test Greeting");
    vi.mocked(mockRepository.getGreeting).mockResolvedValue(greeting);

    const result = await useCase.execute();

    expect(result).toEqual({ message: "Test Greeting" });
    expect(mockRepository.getGreeting).toHaveBeenCalledTimes(1);
  });

  it("should log debug message when fetching", async () => {
    const greeting = Greeting.create("Hello");
    vi.mocked(mockRepository.getGreeting).mockResolvedValue(greeting);

    await useCase.execute();

    expect(mockLogger.debug).toHaveBeenCalledWith(
      "GetGreetingUseCase: Fetching greeting"
    );
  });

  it("should log info message on success", async () => {
    const greeting = Greeting.create("Hello");
    vi.mocked(mockRepository.getGreeting).mockResolvedValue(greeting);

    await useCase.execute();

    expect(mockLogger.info).toHaveBeenCalledWith(
      "GetGreetingUseCase: Greeting fetched successfully"
    );
  });

  it("should propagate repository errors", async () => {
    const error = new Error("Repository error");
    vi.mocked(mockRepository.getGreeting).mockRejectedValue(error);

    await expect(useCase.execute()).rejects.toThrow("Repository error");
  });

  it("should not call logger.info if repository fails", async () => {
    const error = new Error("Repository error");
    vi.mocked(mockRepository.getGreeting).mockRejectedValue(error);

    await expect(useCase.execute()).rejects.toThrow();
    expect(mockLogger.info).not.toHaveBeenCalled();
  });
});
