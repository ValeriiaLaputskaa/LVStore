/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "@happy-dom/jest-environment",
  roots: ["<rootDir>/src"],
  testMatch: ["**/*.test.tsx"],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "^.+\\.svg\\?raw$": "<rootDir>/src/test/mocks/svgRawMock.js",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: "react-jsx",
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          module: "CommonJS",
          target: "ES2022",
          strict: true,
          skipLibCheck: true,
          moduleResolution: "node",
          isolatedModules: true,
          ignoreDeprecations: "6.0",
        },
      },
    ],
  },
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
};
