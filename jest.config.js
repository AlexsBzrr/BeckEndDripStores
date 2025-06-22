module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.js?(x)", "**/?(*.)+(spec|test).js?(x)"],
  moduleNameMapper: {
    "^@controllers/(.*)$": "<rootDir>/src/controllers/$1",
    "^@models/(.*)$": "<rootDir>/src/models/$1",
    "^@services/(.*)$": "<rootDir>/src/services/$1",
    "^@validations/(.*)$": "<rootDir>/src/validations/$1",
    "^@database/(.*)$": "<rootDir>/src/database/$1",
  },
  setupFiles: ["<rootDir>/jest.setup.js"],
};
