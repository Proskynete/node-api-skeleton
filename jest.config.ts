import type { Config } from "jest";
import { defaults } from "jest-config";

const config: Config = {
  moduleFileExtensions: [...defaults.moduleFileExtensions, "ts", "js"],
  modulePathIgnorePatterns: ["<rootDir>/dist"],
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json",
    },
  },
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  testMatch: ["**/test/**/*.spec.(ts|js)"],
  testEnvironment: "node",
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.ts"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

export default config;
