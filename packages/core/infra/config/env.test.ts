import { describe, it, expect, beforeEach, afterEach } from "bun:test";

describe("envCore", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset process.env before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  it("should load valid core environment variables", () => {
    process.env.EVENT_BUS_TYPE = "redis";
    process.env.EVENT_BUS_RETRY_ATTEMPTS = "5";
    process.env.EVENT_BUS_RETRY_DELAY = "2000";
    process.env.ID_GENERATOR_TYPE = "ulid";
    process.env.CACHE_TTL = "7200";
    process.env.CACHE_MAX_SIZE = "5000";

    delete require.cache[require.resolve("./env")];
    const { envCore } = require("./env");

    expect(envCore.EVENT_BUS_TYPE).toBe("redis");
    expect(envCore.EVENT_BUS_RETRY_ATTEMPTS).toBe(5);
    expect(envCore.EVENT_BUS_RETRY_DELAY).toBe(2000);
    expect(envCore.ID_GENERATOR_TYPE).toBe("ulid");
    expect(envCore.CACHE_TTL).toBe(7200);
    expect(envCore.CACHE_MAX_SIZE).toBe(5000);
  });

  it("should use default values when variables are not provided", () => {
    delete require.cache[require.resolve("./env")];
    const { envCore } = require("./env");

    expect(envCore.EVENT_BUS_TYPE).toBe("redis");
    expect(envCore.EVENT_BUS_RETRY_ATTEMPTS).toBe(3);
    expect(envCore.EVENT_BUS_RETRY_DELAY).toBe(1000);
    expect(envCore.ID_GENERATOR_TYPE).toBe("ulid");
    expect(envCore.CACHE_TTL).toBe(3600);
    expect(envCore.CACHE_MAX_SIZE).toBe(1000);
  });

  it("should transform string numbers to actual numbers", () => {
    process.env.EVENT_BUS_RETRY_ATTEMPTS = "7";
    process.env.EVENT_BUS_RETRY_DELAY = "3000";
    process.env.CACHE_TTL = "1800";
    process.env.CACHE_MAX_SIZE = "2000";

    delete require.cache[require.resolve("./env")];
    const { envCore } = require("./env");

    expect(typeof envCore.EVENT_BUS_RETRY_ATTEMPTS).toBe("number");
    expect(typeof envCore.EVENT_BUS_RETRY_DELAY).toBe("number");
    expect(typeof envCore.CACHE_TTL).toBe("number");
    expect(typeof envCore.CACHE_MAX_SIZE).toBe("number");
  });

  it("should validate EVENT_BUS_TYPE enum", () => {
    process.env.EVENT_BUS_TYPE = "memory";

    delete require.cache[require.resolve("./env")];
    const { envCore } = require("./env");

    expect(envCore.EVENT_BUS_TYPE).toBe("memory");
  });

  it("should validate ID_GENERATOR_TYPE enum", () => {
    process.env.ID_GENERATOR_TYPE = "uuid";

    delete require.cache[require.resolve("./env")];
    const { envCore } = require("./env");

    expect(envCore.ID_GENERATOR_TYPE).toBe("uuid");
  });

  it("should validate retry attempts within range", () => {
    process.env.EVENT_BUS_RETRY_ATTEMPTS = "1";

    delete require.cache[require.resolve("./env")];
    const { envCore } = require("./env");

    expect(envCore.EVENT_BUS_RETRY_ATTEMPTS).toBe(1);
  });

  it("should validate minimum cache values", () => {
    process.env.CACHE_TTL = "1";
    process.env.CACHE_MAX_SIZE = "1";

    delete require.cache[require.resolve("./env")];
    const { envCore } = require("./env");

    expect(envCore.CACHE_TTL).toBe(1);
    expect(envCore.CACHE_MAX_SIZE).toBe(1);
  });
});
