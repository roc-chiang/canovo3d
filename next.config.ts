import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // 用于 Docker 部署
  typescript: {
    ignoreBuildErrors: true, // 临时禁用 TypeScript 检查
  },
  eslint: {
    ignoreDuringBuilds: true, // 临时禁用 ESLint 检查
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb', // 支持大文件上传
    },
  },
};

export default nextConfig;

