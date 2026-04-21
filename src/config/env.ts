import { z } from 'zod';

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url(),
  VITE_SUPABASE_URL: z.string().url().optional().or(z.literal('')),
  VITE_SUPABASE_ANON_KEY: z.string().optional().or(z.literal('')),
  VITE_SENTRY_DSN: z.string().optional().or(z.literal('')),
  VITE_SENTRY_TRACES_SAMPLE_RATE: z.coerce
    .number()
    .min(0)
    .max(1)
    .optional()
    .default(0.1),
  VITE_APP_RELEASE: z.string().optional().default('dev'),
  VITE_POSTHOG_KEY: z.string().optional().or(z.literal('')),
  VITE_APP_NAME: z.string().min(1).default('Kayan Sweets'),
  MODE: z.enum(['development', 'production', 'test']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  // import.meta.env is accessed ONLY here. Everywhere else imports `env`.
  const source = import.meta.env as Record<string, string | undefined>;
  const parsed = envSchema.safeParse(source);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(
      `[env] Invalid or missing Vite environment variables:\n${issues}`,
    );
  }
  return parsed.data;
}

export const env: Env = loadEnv();
export const isDev: boolean = env.MODE === 'development';
export const isProd: boolean = env.MODE === 'production';
