import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // ponytail: คง connection กับ Neon ไว้ข้าม request — cold start query เร็วขึ้นมาก
    serverComponentsExternalPackages: ["@neondatabase/serverless"],
  },
};

export default nextConfig;
