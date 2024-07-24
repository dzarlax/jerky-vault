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
};


export default nextTranslate({
  ...nextConfig,
  i18n: await import('./i18n.cjs').then(mod => mod.default || mod),
});
