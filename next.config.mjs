/** @type {import('next').NextConfig} */
const nextConfig = {
  // Sharp는 서버 사이드에서만 사용됨 (이미지 압축)
  // 클라이언트 번들에서 제외
  experimental: {
    serverComponentsExternalPackages: ["sharp"],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // 클라이언트 번들에서 sharp 관련 모듈 제외
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        child_process: false,
        "node:child_process": false,
      };
    }
    return config;
  },
};

export default nextConfig;
