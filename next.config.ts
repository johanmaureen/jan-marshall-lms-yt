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
  },
  reactCompiler: true,
};

export default nextConfig;
