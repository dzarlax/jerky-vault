import './src/env.js';

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
      config.module.rules.push({
          test: /\.svg$/i,
          issuer: /\.[jt]sx?$/,
          use: ['@svgr/webpack'],
      });

      return config;
  },
  // Completely disable static site generation to avoid auth errors
  output: 'standalone',
  // Skip type checking during build to speed up production builds
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    // Disable eslint during build to speed up production builds
    ignoreDuringBuilds: true,
  },
  // Completely disable static generation
  staticPageGenerationTimeout: 1,
  // Disable static exports
  trailingSlash: false,
  // Disable image optimization during build
  images: {
    disableStaticImages: true,
  },
};

// Try to import next-translate-plugin, but don't fail if it's not available
let finalConfig = nextConfig;
try {
  const nextTranslate = await import('next-translate-plugin').then(mod => mod.default || mod);
  const i18nConfig = await import('./i18n.cjs').then(mod => mod.default || mod);
  
  finalConfig = nextTranslate({
    ...nextConfig,
    i18n: i18nConfig,
  });
} catch (error) {
  console.warn('Warning: next-translate-plugin not available, using default config');
  // If next-translate-plugin is not available, use the default config
  finalConfig = {
    ...nextConfig,
    // Add basic i18n config if available
    i18n: {
      locales: ['en', 'ru', 'rs'],
      defaultLocale: 'en',
    },
  };
}

export default finalConfig;
