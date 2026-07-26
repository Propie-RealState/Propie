/**
 * UI-facing app version. Sourced from web/package.json via Vite JSON import.
 */
import packageJson from "../../package.json";

export function getAppVersion(): string {
  return packageJson.version;
}
