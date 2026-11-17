// Secrets the API can't run without. There are deliberately no fallbacks:
// a default value would be in this public repo, so anyone could use it.
export const REQUIRED_ENV = ["JWT_SECRET", "POS_API_KEY", "PSP_API_KEY"];

export function assertRequiredEnv(env = process.env) {
  const missing = REQUIRED_ENV.filter((name) => !env[name]);
  if (missing.length) {
    throw new Error(`Missing required env var: ${missing.join(", ")}`);
  }
}
