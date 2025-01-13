/** @type {import('next').NextConfig} */
const nextConfig = {
    rewrites: async () => [
        {
            source: '/api/viacep/:cep',
            destination: 'https://viacep.com.br/ws/:cep/json/',
        },
    ],
    headers: [
        {
            source: 'https://viacep.com.br/ws/:cep/json/',
            headers: [
                { key: 'Access-Control-Allow-Origin', value: '*' },  // Permite CORS
            ],
        },
    ],
    crossOrigin: 'anonymous',
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'www.google.com',
            },
            {
                protocol: 'https',
                hostname: 'github.com',
            },
        ],
    },
};

export default nextConfig;
