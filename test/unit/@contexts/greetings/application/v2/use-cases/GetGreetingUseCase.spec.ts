import { IGreetingRepository } from "@contexts/greetings/application/v1/ports/outbound/IGreetingRepository";
import { GetGreetingUseCase } from "@contexts/greetings/application/v2/use-cases/GetGreetingUseCase";
import { Greeting } from "@contexts/greetings/domain/entities/Greeting";
import { GreetingFetchException } from "@contexts/greetings/domain/exceptions/GreetingFetchException";
import { DomainException } from "@shared/domain/exceptions/DomainException";
import { ILogger } from "@shared/infrastructure/observability/ILogger";
import { isFailure, isSuccess } from "@shared/types/result";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("GetGreetingUseCase v2", () => {
  let useCase: GetGreetingUseCase;
  let mockRepository: IGreetingRepository;
  let mockLogger: ILogger;
  let loggerDebugSpy: ReturnType<typeof vi.fn>;
  let loggerInfoSpy: ReturnType<typeof vi.fn>;
  let loggerErrorSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    loggerDebugSpy = vi.fn();
    loggerInfoSpy = vi.fn();
    loggerErrorSpy = vi.fn();

    mockLogger = {
      debug: loggerDebugSpy,
      info: loggerInfoSpy,
      warn: vi.fn(),
      error: loggerErrorSpy,
    } as unknown as ILogger;

    mockRepository = {
      getGreeting: vi.fn(),
      save: vi.fn(),
    };

    useCase = new GetGreetingUseCase(mockRepository, mockLogger);
  });

  describe("execute - success path", () => {
    it("should return greeting DTO when successful", async () => {
      const greeting = Greeting.create("Hello v2");
      vi.spyOn(mockRepository, "getGreeting").mockResolvedValue(greeting);

      const result = await useCase.execute();

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.value).toHaveProperty("message");
        expect(result.value).toHaveProperty("timestamp");
        expect(result.value).toHaveProperty("version");
        expect(result.value.version).toBe("2.0");
      }
    });

    it("should log debug message when fetching greeting", async () => {
      const greeting = Greeting.create("Test");
      vi.spyOn(mockRepository, "getGreeting").mockResolvedValue(greeting);

      await useCase.execute();

      expect(loggerDebugSpy).toHaveBeenCalledWith(
        "GetGreetingUseCase V2: Fetching greeting"
      );
    });

    it("should log info message on successful fetch", async () => {
      const greeting = Greeting.create("Test");
      vi.spyOn(mockRepository, "getGreeting").mockResolvedValue(greeting);

      await useCase.execute();

      expect(loggerInfoSpy).toHaveBeenCalledWith(
        "GetGreetingUseCase V2: Greeting fetched successfully"
      );
    });

    it("should call repository getGreeting", async () => {
      const greeting = Greeting.create("Test");
      const getGreetingSpy = vi
        .spyOn(mockRepository, "getGreeting")
        .mockResolvedValue(greeting);

      await useCase.execute();

      expect(getGreetingSpy).toHaveBeenCalledTimes(1);
    });

    it("should include message in DTO", async () => {
      const greeting = Greeting.create("Custom message");
      vi.spyOn(mockRepository, "getGreeting").mockResolvedValue(greeting);

      const result = await useCase.execute();

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.value.message).toBe("Custom message");
      }
    });

    it("should include ISO timestamp in response", async () => {
      const greeting = Greeting.create("Test");
      vi.spyOn(mockRepository, "getGreeting").mockResolvedValue(greeting);

      const result = await useCase.execute();

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        const timestamp = new Date(result.value.timestamp);
        expect(timestamp).toBeInstanceOf(Date);
        expect(isNaN(timestamp.getTime())).toBe(false);
      }
    });
  });

  describe("execute - error handling", () => {
    it("should handle DomainException from repository", async () => {
      const domainError = new DomainException("Test error");
      vi.spyOn(mockRepository, "getGreeting").mockRejectedValue(domainError);

      const result = await useCase.execute();

      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        expect(result.error).toBe(domainError);
        expect(result.error.message).toBe("Test error");
      }
    });

    it("should log error when fetch fails", async () => {
      const error = new Error("Repository error");
      vi.spyOn(mockRepository, "getGreeting").mockRejectedValue(error);

      await useCase.execute();

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        "GetGreetingUseCase V2: Failed to fetch greeting",
        error
      );
    });

    it("should wrap non-DomainException errors", async () => {
      const genericError = new Error("Generic error");
      vi.spyOn(mockRepository, "getGreeting").mockRejectedValue(genericError);

      const result = await useCase.execute();

      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(GreetingFetchException);
      }
    });

    it("should return GreetingFetchException for unexpected errors", async () => {
      const unexpectedError = new TypeError("Unexpected type error");
      vi.spyOn(mockRepository, "getGreeting").mockRejectedValue(
        unexpectedError
      );

      const result = await useCase.execute();

      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(GreetingFetchException);
        expect(result.error).toBeInstanceOf(DomainException);
      }
    });

    it("should preserve DomainException subclass", async () => {
      const greetingError = new GreetingFetchException();
      vi.spyOn(mockRepository, "getGreeting").mockRejectedValue(greetingError);

      const result = await useCase.execute();

      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        expect(result.error).toBe(greetingError);
      }
    });

    it("should handle null/undefined errors gracefully", async () => {
      vi.spyOn(mockRepository, "getGreeting").mockRejectedValue(null);

      const result = await useCase.execute();

      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(GreetingFetchException);
      }
    });

    it("should handle string errors", async () => {
      vi.spyOn(mockRepository, "getGreeting").mockRejectedValue("String error");

      const result = await useCase.execute();

      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(GreetingFetchException);
      }
    });
  });

  describe("Result pattern usage", () => {
    it("should return Ok result on success", async () => {
      const greeting = Greeting.create("Success");
      vi.spyOn(mockRepository, "getGreeting").mockResolvedValue(greeting);

      const result = await useCase.execute();

      expect(isSuccess(result)).toBe(true);
      expect(isFailure(result)).toBe(false);
    });

    it("should return Err result on failure", async () => {
      const error = new Error("Failure");
      vi.spyOn(mockRepository, "getGreeting").mockRejectedValue(error);

      const result = await useCase.execute();

      expect(isFailure(result)).toBe(true);
      expect(isSuccess(result)).toBe(false);
    });

    it("should allow pattern matching on result", async () => {
      const greeting = Greeting.create("Test");
      vi.spyOn(mockRepository, "getGreeting").mockResolvedValue(greeting);

      const result = await useCase.execute();

      let outcome: string;
      if (isSuccess(result)) {
        outcome = "success";
      } else {
        outcome = "failure";
      }

      expect(outcome).toBe("success");
    });
  });

  describe("constructor", () => {
    it("should initialize with repository and logger", () => {
      const newUseCase = new GetGreetingUseCase(mockRepository, mockLogger);

      expect(newUseCase).toBeInstanceOf(GetGreetingUseCase);
    });

    it("should use injected repository", async () => {
      const customRepository: IGreetingRepository = {
        getGreeting: vi.fn().mockResolvedValue(Greeting.create("Custom")),
        save: vi.fn(),
      };

      const customUseCase = new GetGreetingUseCase(
        customRepository,
        mockLogger
      );
      await customUseCase.execute();

      expect(customRepository.getGreeting).toHaveBeenCalled();
      expect(mockRepository.getGreeting).not.toHaveBeenCalled();
    });

    it("should use injected logger", async () => {
      const customLogger: ILogger = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      };

      const greeting = Greeting.create("Test");
      vi.spyOn(mockRepository, "getGreeting").mockResolvedValue(greeting);

      const customUseCase = new GetGreetingUseCase(
        mockRepository,
        customLogger
      );
      await customUseCase.execute();

      expect(customLogger.debug).toHaveBeenCalled();
      expect(loggerDebugSpy).not.toHaveBeenCalled();
    });
  });
});
