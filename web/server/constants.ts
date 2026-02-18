import { tmpdir, homedir } from "node:os";
import { join } from "node:path";

export const DEFAULT_PORT_DEV = 3457;
export const DEFAULT_PORT_PROD = 3456;

export function isDev(): boolean {
  return process.env.NODE_ENV !== "production";
}

/**
 * Session persistence directory.
 * Dev: $TMPDIR/vibe-sessions-dev/
 * Prod: $TMPDIR/vibe-sessions/
 */
export function getSessionDir(): string {
  if (process.env.COMPANION_SESSION_DIR) return process.env.COMPANION_SESSION_DIR;
  return join(tmpdir(), isDev() ? "vibe-sessions-dev" : "vibe-sessions");
}

/**
 * Recordings directory.
 * Dev: ~/.companion/recordings-dev/
 * Prod: ~/.companion/recordings/
 */
export function getRecordingsDir(): string {
  if (process.env.COMPANION_RECORDINGS_DIR) return process.env.COMPANION_RECORDINGS_DIR;
  return join(homedir(), ".companion", isDev() ? "recordings-dev" : "recordings");
}

/**
 * Session names file.
 * Dev: ~/.companion/session-names-dev.json
 * Prod: ~/.companion/session-names.json
 */
export function getSessionNamesPath(): string {
  return join(homedir(), ".companion", isDev() ? "session-names-dev.json" : "session-names.json");
}
