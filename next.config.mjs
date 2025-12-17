/** @type {import('next').NextConfig} */
const nextConfig = {
    crossOrigin: 'anonymous',
    distDir: 'build',
    output: 'standalone',
    images: {
        domains: ['gazaltechgfood.s3.us-east-2.amazonaws.com'],
        minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days to avoid frequent S3 fetches
        unoptimized: false,
        dangerouslyAllowSVG: true,
    },
};

export default nextConfig;
