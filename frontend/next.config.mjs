/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        API_BASE_URL: process.env.NODE_ENV === 'production'
          ? 'http://localhost:8000'
          : 'http://localhost:8000', // or your development URL
    },
};

export default nextConfig;
