import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: process.env.NEXT_PUBLIC_S3_PROTOCOL || 'https',
        // @ts-expect-error cause it was misbahaving
        hostname: process.env.NEXT_PUBLIC_S3_HOSTNAME,
        port: '',
        pathname: process.env.NEXT_PUBLIC_S3_PATHNAME || '/database/**',
      },
    ],
  },
  
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;