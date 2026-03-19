import type { Config } from "jest";

const config: Config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@cloudscape-design/components/(.*)$":
      "<rootDir>/tests/__mocks__/cloudscape.tsx",
  },
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: { jsx: "react-jsx" } }],
  },
  testMatch: ["**/tests/unit/**/*.test.(ts|tsx)"],
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/*.d.ts"],
};

export default config;
