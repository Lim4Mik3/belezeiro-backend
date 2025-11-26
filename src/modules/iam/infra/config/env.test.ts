import { describe, it, expect, beforeEach, afterEach } from "bun:test";

describe("envIam", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset process.env before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  it("should load valid IAM environment variables", () => {
    process.env.AUTH_PROVIDER = "google";
    process.env.AUTH_CALLBACK_URL = "http://localhost:3000/auth/callback";
    process.env.GOOGLE_CLIENT_ID = "test-client-id";
    process.env.GOOGLE_CLIENT_SECRET = "test-client-secret";
    process.env.SESSION_SECRET = "this-is-a-super-secret-session-key-with-more-than-32-chars";
    process.env.SESSION_MAX_AGE = "3600000";
    process.env.PASSWORD_MIN_LENGTH = "10";
    process.env.PASSWORD_SALT_ROUNDS = "12";

    delete require.cache[require.resolve("./env")];
    const { envIam } = require("./env");

    expect(envIam.AUTH_PROVIDER).toBe("google");
    expect(envIam.AUTH_CALLBACK_URL).toBe("http://localhost:3000/auth/callback");
    expect(envIam.GOOGLE_CLIENT_ID).toBe("test-client-id");
    expect(envIam.GOOGLE_CLIENT_SECRET).toBe("test-client-secret");
    expect(envIam.SESSION_SECRET).toBe("this-is-a-super-secret-session-key-with-more-than-32-chars");
    expect(envIam.SESSION_MAX_AGE).toBe(3600000);
    expect(envIam.PASSWORD_MIN_LENGTH).toBe(10);
    expect(envIam.PASSWORD_SALT_ROUNDS).toBe(12);
  });

  it("should use default values when optional variables are not provided", () => {
    process.env.AUTH_CALLBACK_URL = "http://localhost:3000/auth/callback";
    process.env.GOOGLE_CLIENT_ID = "test-client-id";
    process.env.GOOGLE_CLIENT_SECRET = "test-client-secret";
    process.env.SESSION_SECRET = "this-is-a-super-secret-session-key-with-more-than-32-chars";

    delete require.cache[require.resolve("./env")];
    const { envIam } = require("./env");

    expect(envIam.AUTH_PROVIDER).toBe("google");
    expect(envIam.SESSION_MAX_AGE).toBe(86400000);
    expect(envIam.PASSWORD_MIN_LENGTH).toBe(8);
    expect(envIam.PASSWORD_SALT_ROUNDS).toBe(10);
  });

  it("should transform string numbers to actual numbers", () => {
    process.env.AUTH_CALLBACK_URL = "http://localhost:3000/auth/callback";
    process.env.GOOGLE_CLIENT_ID = "test-client-id";
    process.env.GOOGLE_CLIENT_SECRET = "test-client-secret";
    process.env.SESSION_SECRET = "this-is-a-super-secret-session-key-with-more-than-32-chars";
    process.env.SESSION_MAX_AGE = "7200000";
    process.env.PASSWORD_MIN_LENGTH = "12";
    process.env.PASSWORD_SALT_ROUNDS = "15";

    delete require.cache[require.resolve("./env")];
    const { envIam } = require("./env");

    expect(typeof envIam.SESSION_MAX_AGE).toBe("number");
    expect(typeof envIam.PASSWORD_MIN_LENGTH).toBe("number");
    expect(typeof envIam.PASSWORD_SALT_ROUNDS).toBe("number");
  });

  it("should validate AUTH_PROVIDER enum", () => {
    process.env.AUTH_PROVIDER = "github";
    process.env.AUTH_CALLBACK_URL = "http://localhost:3000/auth/callback";
    process.env.GOOGLE_CLIENT_ID = "test-client-id";
    process.env.GOOGLE_CLIENT_SECRET = "test-client-secret";
    process.env.SESSION_SECRET = "this-is-a-super-secret-session-key-with-more-than-32-chars";

    delete require.cache[require.resolve("./env")];
    const { envIam } = require("./env");

    expect(envIam.AUTH_PROVIDER).toBe("github");
  });

  it("should validate password length within range", () => {
    process.env.AUTH_CALLBACK_URL = "http://localhost:3000/auth/callback";
    process.env.GOOGLE_CLIENT_ID = "test-client-id";
    process.env.GOOGLE_CLIENT_SECRET = "test-client-secret";
    process.env.SESSION_SECRET = "this-is-a-super-secret-session-key-with-more-than-32-chars";
    process.env.PASSWORD_MIN_LENGTH = "6";

    delete require.cache[require.resolve("./env")];
    const { envIam } = require("./env");

    expect(envIam.PASSWORD_MIN_LENGTH).toBe(6);
  });

  it("should validate salt rounds within range", () => {
    process.env.AUTH_CALLBACK_URL = "http://localhost:3000/auth/callback";
    process.env.GOOGLE_CLIENT_ID = "test-client-id";
    process.env.GOOGLE_CLIENT_SECRET = "test-client-secret";
    process.env.SESSION_SECRET = "this-is-a-super-secret-session-key-with-more-than-32-chars";
    process.env.PASSWORD_SALT_ROUNDS = "4";

    delete require.cache[require.resolve("./env")];
    const { envIam } = require("./env");

    expect(envIam.PASSWORD_SALT_ROUNDS).toBe(4);
  });

  it("should validate callback URL format", () => {
    process.env.AUTH_CALLBACK_URL = "https://example.com/callback";
    process.env.GOOGLE_CLIENT_ID = "test-client-id";
    process.env.GOOGLE_CLIENT_SECRET = "test-client-secret";
    process.env.SESSION_SECRET = "this-is-a-super-secret-session-key-with-more-than-32-chars";

    delete require.cache[require.resolve("./env")];
    const { envIam } = require("./env");

    expect(envIam.AUTH_CALLBACK_URL).toBe("https://example.com/callback");
  });
});
