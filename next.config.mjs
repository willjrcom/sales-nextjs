/** @type {import('next').NextConfig} */
const nextConfig = {
    crossOrigin: 'anonymous',
    distDir: 'build',
    output: 'standalone',
    images: {
        minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days to avoid frequent S3 fetches
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'gazaltechgfood.s3.us-east-2.amazonaws.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: '*.s3.*.amazonaws.com',
                pathname: '/**',
            },
        ],
        unoptimized: false, // Ensure image optimization is enabled
        dangerouslyAllowSVG: true,
    },
};

export default nextConfig;
