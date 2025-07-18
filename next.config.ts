import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.placeholder.com',
        port: '',
        pathname: '/**',
      }
    ],
    domains: [
      'via.placeholder.com',
      'placeholder.com'
    ]
  },
  experimental: {
    optimizePackageImports: ['lucide-react']
  }
};

export default nextConfig;
