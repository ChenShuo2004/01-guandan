/** @type {import('next').NextConfig} */
const isDevelopment = process.env.NODE_ENV === "development";

const nextConfig = {
  distDir: isDevelopment ? ".next-dev" : ".next"
};

export default nextConfig;
