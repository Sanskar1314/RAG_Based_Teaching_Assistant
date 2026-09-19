/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // enables minimal Docker image via .next/standalone
};

export default nextConfig;

