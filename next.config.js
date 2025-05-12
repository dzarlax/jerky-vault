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
  // Completely disable static generation
  staticPageGenerationTimeout: 1,
  // Disable static exports
  trailingSlash: false,
  // Disable image optimization during build
  images: {
    disableStaticImages: true,
  },
};


export default nextTranslate({
  ...nextConfig,
  i18n: await import('./i18n.cjs').then(mod => mod.default || mod),
});
