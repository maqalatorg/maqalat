import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  // Windows workers OOM with default multi-worker static generation;
  // Vercel (Linux) builds fine. Cap workers locally to avoid heap crash.
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  outputFileTracingIncludes: {
    "/og-default.png": ["./public/fonts/*.ttf"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

export default withMDX(nextConfig);
