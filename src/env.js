import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),
    MAPBOX_ACCESS_TOKEN: z.string().optional(),
    NEXT_DISABLE_SSG: z.string().transform((val) => val === 'true').optional(),
    SKIP_ENV_VALIDATION: z.string().transform((val) => val === 'true').optional(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // API URL for backend connection
    NEXT_PUBLIC_API_URL: z.string().url().optional(),
    // Frontend URL for CORS and redirects
    NEXT_PUBLIC_FRONTEND_URL: z.string().url().optional(),
    // Authentication settings
    NEXT_PUBLIC_AUTH_ENABLED: z.string().transform((val) => val === 'true').optional(),
    // Build optimization flags
    NEXT_PUBLIC_OPTIMIZE_IMAGES: z.string().transform((val) => val === 'true').optional(),
    NEXT_PUBLIC_OPTIMIZE_FONTS: z.string().transform((val) => val === 'true').optional(),
    // Disable static generation for authenticated routes during build
    NEXT_PUBLIC_SKIP_AUTH_ROUTES_SSG: z.string().transform((val) => val === 'true').optional(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN,
    NEXT_DISABLE_SSG: process.env.NEXT_DISABLE_SSG,
    SKIP_ENV_VALIDATION: process.env.SKIP_ENV_VALIDATION,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL,
    NEXT_PUBLIC_AUTH_ENABLED: process.env.NEXT_PUBLIC_AUTH_ENABLED,
    NEXT_PUBLIC_OPTIMIZE_IMAGES: process.env.NEXT_PUBLIC_OPTIMIZE_IMAGES,
    NEXT_PUBLIC_OPTIMIZE_FONTS: process.env.NEXT_PUBLIC_OPTIMIZE_FONTS,
    NEXT_PUBLIC_SKIP_AUTH_ROUTES_SSG: process.env.NEXT_PUBLIC_SKIP_AUTH_ROUTES_SSG,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
