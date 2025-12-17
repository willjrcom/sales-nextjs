/** @type {import('next').NextConfig} */
const nextConfig = {
    crossOrigin: 'anonymous',
    distDir: 'build',
    output: 'standalone',
    images: {
        minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days to avoid frequent S3 fetches
        domains: ['gazaltechgfood.s3.us-east-2.amazonaws.com'],
        unoptimized: false,
        dangerouslyAllowSVG: true,
    },
};

export default nextConfig;
