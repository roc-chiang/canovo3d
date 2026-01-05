import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // 用于 Docker 部署
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb', // 支持大文件上传
    },
  },
};

export default nextConfig;

