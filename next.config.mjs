/** @type {import('next').NextConfig} */
const nextConfig = {
    crossOrigin: 'anonymous',
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
