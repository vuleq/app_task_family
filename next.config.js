const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Static export cho Capacitor (mobile app)
  // Nếu muốn build cho web thông thường, comment dòng output: 'export'
  ...(process.env.BUILD_FOR_MOBILE === 'true' ? { output: 'export' } : {}),
  images: {
    unoptimized: process.env.BUILD_FOR_MOBILE === 'true', // Cần unoptimized cho static export
    domains: ['firebasestorage.googleapis.com', 'res.cloudinary.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: false,
  },
}

module.exports = withPWA(nextConfig)

