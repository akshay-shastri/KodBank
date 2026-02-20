import { validateEnv } from "./lib/validateEnv";

export function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    validateEnv();
  }
}
