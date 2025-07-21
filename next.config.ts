import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Remote patterns for external images
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
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.buymeacoffee.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'audiosphere.app',
        port: '',
        pathname: '/uploads/**',
      }
    ],
    // Local domains for uploaded content
    domains: [
      'via.placeholder.com',
      'placeholder.com',
      'localhost',
      'audiosphere.app'
    ],
    // Image formats to support (AVIF first for better compression, then WebP)
    formats: ['image/avif', 'image/webp'],
    // Device sizes for responsive images (optimized for AudioSphere use cases)
    deviceSizes: [320, 420, 640, 768, 1024, 1200, 1536, 1920],
    // Image sizes for different components (album covers, avatars, thumbnails)
    imageSizes: [16, 24, 32, 48, 64, 96, 128, 150, 200, 256, 300, 400, 500, 600, 800],
    // Minimum cache TTL for optimized images (7 days for better performance)
    minimumCacheTTL: 60 * 60 * 24 * 7,
    // Enable dangerous use of SVG (disabled for security)
    dangerouslyAllowSVG: false,
    // Content security policy for SVG
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Loader configuration for custom optimization
    loader: 'default',
    // Default quality settings (can be overridden per image)
    quality: 75,
    // Default placeholder configuration
    placeholder: 'blur',
    // Unoptimized disabled for better performance
    unoptimized: false,
  },
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@tanstack/react-query'],
    // Enable modern bundling
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  // Webpack configuration for image optimization
  webpack: (config, { isServer }) => {
    // Optimize images during build
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    
    // Add support for importing images as modules
    config.module.rules.push({
      test: /\.(png|jpe?g|gif|svg|webp|avif)$/i,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/images/',
          outputPath: 'static/images/',
          esModule: false,
        },
      },
    });
    
    return config;
  },
  // Headers for better caching
  async headers() {
    return [
      {
        source: '/_next/image(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/uploads/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400', // 1 day for user uploads
          },
        ],
      },
    ];
  },
};

export default nextConfig;
