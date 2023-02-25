import type { Config } from "@jest/types";
import { join } from "path";

const config: Config.InitialOptions = {
  moduleFileExtensions: ["ts", "js", "json", "node"],
  roots: ["<rootDir>/src"],
  testEnvironment: "node",
  testRegex: "(\\.|/)(test|spec)\\.ts$",
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: join(__dirname, "tsconfig.json"),
      },
    ],
  },
};

export default config;
