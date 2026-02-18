/**
 * Shared platform helpers for Windows/Unix compatibility.
 */

import { delimiter } from "node:path";

/** True when running on Windows. */
export const isWindows = process.platform === "win32";

/** PATH separator: ";" on Windows, ":" on Unix. Re-export of path.delimiter. */
export const pathDelimiter = delimiter;

/** Returns the platform-appropriate binary lookup command ("where" on Windows, "which" on Unix). */
export function whichCommand(): string {
  return isWindows ? "where" : "which";
}
