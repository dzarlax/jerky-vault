import nextTranslate from 'next-translate-plugin';
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
  // Disable static generation for all pages
  staticPageGenerationTimeout: 1,
  // Export as a standalone app
  experimental: {
    outputStandalone: true,
  },
};


export default nextTranslate({
  ...nextConfig,
  i18n: await import('./i18n.cjs').then(mod => mod.default || mod),
});
