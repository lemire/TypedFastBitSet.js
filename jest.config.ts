import type { Config } from "@jest/types";
import { join } from "path";
import type { TsJestGlobalOptions } from "ts-jest";

const tsJestCfg: TsJestGlobalOptions = {
  tsconfig: join(__dirname, "tsconfig.json"),
};

const config: Config.InitialOptions = {
  globals: {
    "ts-jest": tsJestCfg,
  },
  moduleFileExtensions: ["ts", "js", "json", "node"],
  roots: ["<rootDir>/src"],
  testEnvironment: "node",
  testRegex: "(\\.|/)(test|spec)\\.ts$",
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
};

export default config;
