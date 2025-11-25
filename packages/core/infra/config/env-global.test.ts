import { describe, it, expect, beforeEach, afterEach } from "bun:test";

describe("envGlobal", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset process.env before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  it("should load valid environment variables", () => {
    process.env.NODE_ENV = "development";
    process.env.PORT = "3000";
    process.env.LOG_LEVEL = "info";
    process.env.DATABASE_URL = "postgresql://localhost:5432/test";
    process.env.REDIS_HOST = "localhost";
    process.env.REDIS_PORT = "6379";
    process.env.JWT_SECRET = "this-is-a-super-secret-jwt-key-with-more-than-32-chars";
    process.env.JWT_EXPIRES_IN = "7d";
    process.env.API_VERSION = "v1";

    // Re-import to trigger validation with new env vars
    delete require.cache[require.resolve("./env-global")];
    const { envGlobal } = require("./env-global");

    expect(envGlobal.NODE_ENV).toBe("development");
    expect(envGlobal.PORT).toBe(3000);
    expect(envGlobal.LOG_LEVEL).toBe("info");
    expect(envGlobal.DATABASE_URL).toBe("postgresql://localhost:5432/test");
    expect(envGlobal.REDIS_HOST).toBe("localhost");
    expect(envGlobal.REDIS_PORT).toBe(6379);
    expect(envGlobal.JWT_SECRET).toBe("this-is-a-super-secret-jwt-key-with-more-than-32-chars");
    expect(envGlobal.JWT_EXPIRES_IN).toBe("7d");
    expect(envGlobal.API_VERSION).toBe("v1");
  });

  it("should use default values when optional variables are not provided", () => {
    process.env.DATABASE_URL = "postgresql://localhost:5432/test";
    process.env.JWT_SECRET = "this-is-a-super-secret-jwt-key-with-more-than-32-chars";
    process.env.AUTH_CALLBACK_URL = "http://localhost:3000/callback";

    delete require.cache[require.resolve("./env-global")];
    const { envGlobal } = require("./env-global");

    // NODE_ENV can be "test" when running tests, so we check for valid values
    expect(["development", "production", "test"]).toContain(envGlobal.NODE_ENV);
    expect(envGlobal.PORT).toBe(3000);
    expect(envGlobal.LOG_LEVEL).toBe("info");
    expect(envGlobal.REDIS_HOST).toBe("localhost");
    expect(envGlobal.REDIS_PORT).toBe(6379);
    expect(envGlobal.JWT_EXPIRES_IN).toBe("7d");
    expect(envGlobal.API_VERSION).toBe("v1");
  });

  it("should transform PORT string to number", () => {
    process.env.PORT = "8080";
    process.env.DATABASE_URL = "postgresql://localhost:5432/test";
    process.env.JWT_SECRET = "this-is-a-super-secret-jwt-key-with-more-than-32-chars";
    process.env.AUTH_CALLBACK_URL = "http://localhost:3000/callback";

    delete require.cache[require.resolve("./env-global")];
    const { envGlobal } = require("./env-global");

    expect(envGlobal.PORT).toBe(8080);
    expect(typeof envGlobal.PORT).toBe("number");
  });

  it("should validate NODE_ENV enum", () => {
    process.env.NODE_ENV = "production";
    process.env.DATABASE_URL = "postgresql://localhost:5432/test";
    process.env.JWT_SECRET = "this-is-a-super-secret-jwt-key-with-more-than-32-chars";
    process.env.AUTH_CALLBACK_URL = "http://localhost:3000/callback";

    delete require.cache[require.resolve("./env-global")];
    const { envGlobal } = require("./env-global");

    expect(envGlobal.NODE_ENV).toBe("production");
  });

  it("should validate LOG_LEVEL enum", () => {
    process.env.LOG_LEVEL = "debug";
    process.env.DATABASE_URL = "postgresql://localhost:5432/test";
    process.env.JWT_SECRET = "this-is-a-super-secret-jwt-key-with-more-than-32-chars";
    process.env.AUTH_CALLBACK_URL = "http://localhost:3000/callback";

    delete require.cache[require.resolve("./env-global")];
    const { envGlobal } = require("./env-global");

    expect(envGlobal.LOG_LEVEL).toBe("debug");
  });
});
