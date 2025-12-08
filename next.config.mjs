/** @type {import('next').NextConfig} */
const nextConfig = {
    crossOrigin: 'anonymous',
    distDir: 'build',
    images: {
        minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days to avoid frequent S3 fetches
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.amazonaws.com',
                pathname: '/**',
            },
        ],
    },
};

export default nextConfig;
