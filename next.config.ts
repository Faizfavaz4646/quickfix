import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   images: {
    domains: ['res.cloudinary.com'], // <-- add Cloudinary here
  },
  /* config options here */
};

export default nextConfig;
