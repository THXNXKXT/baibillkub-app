import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // คง connection กับ Neon ไว้ข้าม request — cold start query เร็วขึ้นมาก
  serverExternalPackages: ["@neondatabase/serverless"],
};

export default nextConfig;
