/** @type {import('next').NextConfig} */
const nextConfig = {
    crossOrigin: 'anonymous',
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
