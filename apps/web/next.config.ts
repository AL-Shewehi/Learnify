import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@learnify/shared"],
  async rewrites() {
    const apiUrl = process.env.API_PROXY_TARGET;
    if (!apiUrl) return [];
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
