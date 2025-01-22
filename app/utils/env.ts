// app/utils/env.ts

/**
 * Extracts string properties from ImportMetaEnv.
 * @param env - The ImportMetaEnv object containing environment variables.
 * @returns A Record<string, string> containing only string-based environment variables.
 */
export function getStringEnv(env: ImportMetaEnv): Record<string, string> {
  const stringEnv: Record<string, string> = {};

  for (const key in env) {
    const value = env[key];
    if (typeof value === 'string') {
      stringEnv[key] = value;
    }
  }

  return stringEnv;
}
