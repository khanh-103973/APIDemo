/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    // Bật tối ưu hóa ảnh (WebP/AVIF) ở Production với domain CDN thật;
    // tắt ở Development hoặc khi chạy Docker local (localhost:5066) qua NEXT_PUBLIC_IMAGE_UNOPTIMIZED=true
    unoptimized:
      process.env.NEXT_PUBLIC_IMAGE_UNOPTIMIZED === 'true' ||
      process.env.NODE_ENV !== 'production',
    formats: ['image/avif', 'image/webp'],
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
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '5066',
      },
      {
        protocol: 'http',
        hostname: 'api',
        port: '8080',
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
