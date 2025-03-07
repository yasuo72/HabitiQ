/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
  images: {
    domains: ['metaschool.so', 'images.unsplash.com'],
  },
}

export default nextConfig;