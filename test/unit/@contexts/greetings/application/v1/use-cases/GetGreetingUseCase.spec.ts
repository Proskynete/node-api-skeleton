import { IGreetingRepository } from "@contexts/greetings/application/v1/ports/outbound/IGreetingRepository";
import { GetGreetingUseCase } from "@contexts/greetings/application/v1/use-cases/GetGreetingUseCase";
import { Greeting } from "@contexts/greetings/domain/entities/Greeting";
import { ILogger } from "@shared/infrastructure/observability/ILogger";
import { isFailure, isSuccess } from "@shared/types/result";
import { beforeEach, describe, expect, it, vi } from "vitest";

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
    const getGreetingSpy = vi
      .spyOn(mockRepository, "getGreeting")
      .mockResolvedValue(greeting);

    const result = await useCase.execute();

    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.value).toEqual({ message: "Test Greeting" });
    }
    expect(getGreetingSpy).toHaveBeenCalledTimes(1);
  });

  it("should log debug message when fetching", async () => {
    const greeting = Greeting.create("Hello");
    vi.spyOn(mockRepository, "getGreeting").mockResolvedValue(greeting);
    const debugSpy = vi.spyOn(mockLogger, "debug");

    await useCase.execute();

    expect(debugSpy).toHaveBeenCalledWith(
      "GetGreetingUseCase: Fetching greeting"
    );
  });

  it("should log info message on success", async () => {
    const greeting = Greeting.create("Hello");
    vi.spyOn(mockRepository, "getGreeting").mockResolvedValue(greeting);
    const infoSpy = vi.spyOn(mockLogger, "info");

    await useCase.execute();

    expect(infoSpy).toHaveBeenCalledWith(
      "GetGreetingUseCase: Greeting fetched successfully"
    );
  });

  it("should return failure result for repository errors", async () => {
    const error = new Error("Repository error");
    vi.spyOn(mockRepository, "getGreeting").mockRejectedValue(error);

    const result = await useCase.execute();

    expect(isFailure(result)).toBe(true);
    if (isFailure(result)) {
      expect(result.error.message).toBe("Failed to fetch greeting");
      expect(result.error.code).toBe("GREETING_FETCH_ERROR");
    }
  });

  it("should not call logger.info if repository fails", async () => {
    const error = new Error("Repository error");
    vi.spyOn(mockRepository, "getGreeting").mockRejectedValue(error);
    const infoSpy = vi.spyOn(mockLogger, "info");

    await useCase.execute();

    expect(infoSpy).not.toHaveBeenCalled();
  });
});
