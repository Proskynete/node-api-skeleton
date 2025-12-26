import { Greeting } from "@contexts/greetings/domain/entities/Greeting";
import { InMemoryGreetingRepository } from "@contexts/greetings/infrastructure/persistence/InMemoryGreetingRepository";
import { beforeEach, describe, expect, it } from "vitest";

describe("InMemoryGreetingRepository", () => {
  let repository: InMemoryGreetingRepository;

  beforeEach(() => {
    repository = new InMemoryGreetingRepository();
  });

  describe("getGreeting", () => {
    it("should return default greeting when repository is empty", async () => {
      const greeting = await repository.getGreeting();

      expect(greeting).toBeInstanceOf(Greeting);
      expect(greeting.message).toBe("Hello World!");
    });

    it("should return last saved greeting when repository has greetings", async () => {
      const firstGreeting = Greeting.create("First greeting");
      const secondGreeting = Greeting.create("Second greeting");

      await repository.save(firstGreeting);
      await repository.save(secondGreeting);

      const result = await repository.getGreeting();

      expect(result).toBe(secondGreeting);
      expect(result.message).toBe("Second greeting");
    });

    it("should return most recently saved greeting", async () => {
      const greetings = [
        Greeting.create("Greeting 1"),
        Greeting.create("Greeting 2"),
        Greeting.create("Greeting 3"),
      ];

      for (const greeting of greetings) {
        await repository.save(greeting);
      }

      const result = await repository.getGreeting();

      expect(result).toBe(greetings[2]);
      expect(result.message).toBe("Greeting 3");
    });

    it("should return promise that resolves to greeting", async () => {
      const greeting = await repository.getGreeting();

      expect(greeting).toBeDefined();
      expect(typeof greeting.message).toBe("string");
    });
  });

  describe("save", () => {
    it("should save greeting to repository", async () => {
      const greeting = Greeting.create("Test greeting");

      await repository.save(greeting);
      const retrieved = await repository.getGreeting();

      expect(retrieved).toBe(greeting);
    });

    it("should save multiple greetings", async () => {
      const greeting1 = Greeting.create("First");
      const greeting2 = Greeting.create("Second");

      await repository.save(greeting1);
      await repository.save(greeting2);

      const result = await repository.getGreeting();

      expect(result).toBe(greeting2);
    });

    it("should return resolved promise after saving", async () => {
      const greeting = Greeting.create("Test");

      const result = await repository.save(greeting);

      expect(result).toBeUndefined();
    });

    it("should maintain order of saved greetings", async () => {
      const greetings = [
        Greeting.create("A"),
        Greeting.create("B"),
        Greeting.create("C"),
        Greeting.create("D"),
      ];

      for (const greeting of greetings) {
        await repository.save(greeting);
      }

      const lastGreeting = await repository.getGreeting();
      expect(lastGreeting).toBe(greetings[3]);
      expect(lastGreeting.message).toBe("D");
    });

    it("should handle saving same greeting instance multiple times", async () => {
      const greeting = Greeting.create("Repeated");

      await repository.save(greeting);
      await repository.save(greeting);
      await repository.save(greeting);

      const result = await repository.getGreeting();
      expect(result).toBe(greeting);
    });

    it("should preserve greeting immutability", async () => {
      const originalMessage = "Original";
      const greeting = Greeting.create(originalMessage);

      await repository.save(greeting);
      const retrieved = await repository.getGreeting();

      expect(retrieved.message).toBe(originalMessage);
    });
  });

  describe("integration scenarios", () => {
    it("should support save and retrieve workflow", async () => {
      // Empty state
      const defaultGreeting = await repository.getGreeting();
      expect(defaultGreeting.message).toBe("Hello World!");

      // Save custom greeting
      const customGreeting = Greeting.create("Custom greeting");
      await repository.save(customGreeting);

      // Retrieve saved greeting
      const retrievedGreeting = await repository.getGreeting();
      expect(retrievedGreeting).toBe(customGreeting);
      expect(retrievedGreeting.message).toBe("Custom greeting");
    });

    it("should handle rapid consecutive saves", async () => {
      const promises = [
        repository.save(Greeting.create("1")),
        repository.save(Greeting.create("2")),
        repository.save(Greeting.create("3")),
      ];

      await Promise.all(promises);

      const result = await repository.getGreeting();
      expect(result.message).toMatch(/[123]/);
    });

    it("should return last greeting after multiple operations", async () => {
      await repository.save(Greeting.create("First"));
      await repository.getGreeting();

      await repository.save(Greeting.create("Second"));
      await repository.getGreeting();

      await repository.save(Greeting.create("Third"));
      const final = await repository.getGreeting();

      expect(final.message).toBe("Third");
    });

    it("should work with greetings of different lengths", async () => {
      const shortGreeting = Greeting.create("Hi");
      const longGreeting = Greeting.create("A".repeat(200)); // Max length

      await repository.save(shortGreeting);
      expect((await repository.getGreeting()).message).toBe("Hi");

      await repository.save(longGreeting);
      expect((await repository.getGreeting()).message).toBe("A".repeat(200));
    });
  });

  describe("empty state behavior", () => {
    it("should handle multiple getGreeting calls when empty", async () => {
      const greeting1 = await repository.getGreeting();
      const greeting2 = await repository.getGreeting();

      expect(greeting1.message).toBe("Hello World!");
      expect(greeting2.message).toBe("Hello World!");
    });

    it("should create new instance each time when empty", async () => {
      const greeting1 = await repository.getGreeting();
      const greeting2 = await repository.getGreeting();

      // Different instances
      expect(greeting1).not.toBe(greeting2);
      // But same value
      expect(greeting1.message).toBe(greeting2.message);
    });
  });

  describe("repository lifecycle", () => {
    it("should start with empty state", async () => {
      const newRepository = new InMemoryGreetingRepository();
      const greeting = await newRepository.getGreeting();

      expect(greeting.message).toBe("Hello World!");
    });

    it("should maintain state across operations", async () => {
      await repository.save(Greeting.create("State 1"));
      expect((await repository.getGreeting()).message).toBe("State 1");

      await repository.save(Greeting.create("State 2"));
      expect((await repository.getGreeting()).message).toBe("State 2");

      await repository.save(Greeting.create("State 3"));
      expect((await repository.getGreeting()).message).toBe("State 3");
    });

    it("should be isolated between instances", async () => {
      const repo1 = new InMemoryGreetingRepository();
      const repo2 = new InMemoryGreetingRepository();

      await repo1.save(Greeting.create("Repo1 greeting"));
      await repo2.save(Greeting.create("Repo2 greeting"));

      expect((await repo1.getGreeting()).message).toBe("Repo1 greeting");
      expect((await repo2.getGreeting()).message).toBe("Repo2 greeting");
    });
  });
});
