import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  // Add your allowed origins here (e.g. "192.168.1.x:3000" or specific domains)
  // modifying this list will require a server restart
  allowedDevOrigins: ["localhost:3000"],
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
