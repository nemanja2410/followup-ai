import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/register",
        destination: "/login?mode=signup",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
