/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5066',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '7255',
      },
    ],
  },
};

export default nextConfig;
