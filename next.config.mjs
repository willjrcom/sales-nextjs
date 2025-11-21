/** @type {import('next').NextConfig} */
const nextConfig = {
    crossOrigin: 'anonymous',
    reactStrictMode: true,
    output: 'standalone',
    distDir: 'build',
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.amazonaws.com'
            }
        ],
    },
};

export default nextConfig;
