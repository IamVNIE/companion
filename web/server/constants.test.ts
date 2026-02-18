import { tmpdir, homedir } from "node:os";
import { join } from "node:path";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { isDev, getSessionDir, getRecordingsDir, getSessionNamesPath } from "./constants.js";

/**
 * Tests for dev/prod path isolation.
 *
 * The path functions (getSessionDir, getRecordingsDir, getSessionNamesPath)
 * return different paths based on NODE_ENV so that dev and prod instances
 * running simultaneously don't share on-disk state (sessions, recordings, names).
 *
 * All functions read process.env at call time, so we can manipulate env vars
 * in each test without needing module re-imports.
 */

describe("constants — dev/prod isolation", () => {
  let originalNodeEnv: string | undefined;
  let originalSessionDir: string | undefined;
  let originalRecordingsDir: string | undefined;

  beforeEach(() => {
    originalNodeEnv = process.env.NODE_ENV;
    originalSessionDir = process.env.COMPANION_SESSION_DIR;
    originalRecordingsDir = process.env.COMPANION_RECORDINGS_DIR;
    delete process.env.COMPANION_SESSION_DIR;
    delete process.env.COMPANION_RECORDINGS_DIR;
  });

  afterEach(() => {
    if (originalNodeEnv !== undefined) process.env.NODE_ENV = originalNodeEnv;
    else delete process.env.NODE_ENV;
    if (originalSessionDir !== undefined) process.env.COMPANION_SESSION_DIR = originalSessionDir;
    else delete process.env.COMPANION_SESSION_DIR;
    if (originalRecordingsDir !== undefined) process.env.COMPANION_RECORDINGS_DIR = originalRecordingsDir;
    else delete process.env.COMPANION_RECORDINGS_DIR;
  });

  describe("isDev()", () => {
    it("returns true when NODE_ENV=development", () => {
      process.env.NODE_ENV = "development";
      expect(isDev()).toBe(true);
    });

    it("returns true when NODE_ENV is unset (safe default: treat as dev)", () => {
      delete process.env.NODE_ENV;
      expect(isDev()).toBe(true);
    });

    it("returns true for any non-production value (e.g. 'test')", () => {
      process.env.NODE_ENV = "test";
      expect(isDev()).toBe(true);
    });

    it("returns false when NODE_ENV=production", () => {
      process.env.NODE_ENV = "production";
      expect(isDev()).toBe(false);
    });
  });

  describe("getSessionDir()", () => {
    // Ensures dev sessions go to a separate directory so the reconnection
    // watchdog and session listing don't interfere with production.
    it("appends -dev suffix in development mode", () => {
      process.env.NODE_ENV = "development";
      expect(getSessionDir()).toBe(join(tmpdir(), "vibe-sessions-dev"));
    });

    it("uses the standard path in production", () => {
      process.env.NODE_ENV = "production";
      expect(getSessionDir()).toBe(join(tmpdir(), "vibe-sessions"));
    });

    it("dev and prod paths are different", () => {
      process.env.NODE_ENV = "development";
      const devDir = getSessionDir();
      process.env.NODE_ENV = "production";
      const prodDir = getSessionDir();
      expect(devDir).not.toBe(prodDir);
    });

    it("COMPANION_SESSION_DIR override takes priority over NODE_ENV", () => {
      process.env.COMPANION_SESSION_DIR = "/custom/sessions";
      process.env.NODE_ENV = "development";
      expect(getSessionDir()).toBe("/custom/sessions");
      process.env.NODE_ENV = "production";
      expect(getSessionDir()).toBe("/custom/sessions");
    });
  });

  describe("getRecordingsDir()", () => {
    // Ensures protocol recordings from dev sessions don't intermingle
    // with production recordings.
    it("appends -dev suffix in development mode", () => {
      process.env.NODE_ENV = "development";
      expect(getRecordingsDir()).toBe(join(homedir(), ".companion", "recordings-dev"));
    });

    it("uses the standard path in production", () => {
      process.env.NODE_ENV = "production";
      expect(getRecordingsDir()).toBe(join(homedir(), ".companion", "recordings"));
    });

    it("dev and prod paths are different", () => {
      process.env.NODE_ENV = "development";
      const devDir = getRecordingsDir();
      process.env.NODE_ENV = "production";
      const prodDir = getRecordingsDir();
      expect(devDir).not.toBe(prodDir);
    });

    it("COMPANION_RECORDINGS_DIR override takes priority over NODE_ENV", () => {
      process.env.COMPANION_RECORDINGS_DIR = "/custom/recordings";
      process.env.NODE_ENV = "development";
      expect(getRecordingsDir()).toBe("/custom/recordings");
      process.env.NODE_ENV = "production";
      expect(getRecordingsDir()).toBe("/custom/recordings");
    });
  });

  describe("getSessionNamesPath()", () => {
    // Session names map (sessionId -> human-friendly name) must be
    // isolated so dev sessions don't appear with names in the prod sidebar.
    it("appends -dev to filename in development mode", () => {
      process.env.NODE_ENV = "development";
      expect(getSessionNamesPath()).toBe(join(homedir(), ".companion", "session-names-dev.json"));
    });

    it("uses the standard filename in production", () => {
      process.env.NODE_ENV = "production";
      expect(getSessionNamesPath()).toBe(join(homedir(), ".companion", "session-names.json"));
    });

    it("dev and prod paths are different", () => {
      process.env.NODE_ENV = "development";
      const devPath = getSessionNamesPath();
      process.env.NODE_ENV = "production";
      const prodPath = getSessionNamesPath();
      expect(devPath).not.toBe(prodPath);
    });
  });
});
