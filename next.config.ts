import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  output: 'export',
  images: {
    unoptimized: true,
    domains: ["www.facebook.com", "res.cloudinary.com"],
  },
  // rewrites are not supported with static export
  // async rewrites() {
  //   return [
  //     {
  //       source: "/sitemap.xml",
  //       destination: "/api/sitemap",
  //     },
  //     {
  //       source: "/robots.txt",
  //       destination: "/api/robots",
  //     },
  //   ];
  // },
};

export default nextConfig;
