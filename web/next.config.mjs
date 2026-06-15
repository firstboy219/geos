/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // static HTML/CSS/JS → served by nginx (no Node on server)
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
