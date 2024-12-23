import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_URL_API: process.env.NEXT_URL_API,
  },
};

export default nextConfig;
