import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  images: {
    remotePatterns: [
      {
        hostname: "janmarshall-lms-yt-video.t3.storage.dev", //"janmarshall-lms-yt-video.t3.tigrisfiles.io", // "janmashall-lms-yt-video.t3.tigrisfiles.io",
        protocol: "https",
      },
    ],
    minimumCacheTTL: 31536000, // 1 year cache for optimized images
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  reactCompiler: true,
};

export default nextConfig;
