/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow webpack to handle wasm if needed for vision models
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };
    return config;
  },
};

export default nextConfig;
