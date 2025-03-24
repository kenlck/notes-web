import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^superjson$": "<rootDir>/node_modules/superjson/dist/index.cjs",
  },
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
        useESM: true,
      },
    ],
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(@tiptap|prosemirror-*|@radix-ui|@floating-ui|tailwindcss|clsx|class-variance-authority)/)",
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  coverageDirectory: "coverage",
  testTimeout: 20000,
  extensionsToTreatAsEsm: [".ts", ".tsx"],
};

export default createJestConfig(config);
