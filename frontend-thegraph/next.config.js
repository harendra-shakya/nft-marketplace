/** @type {import('next').NextConfig} */
const securityHeaders = [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
];

const nextConfig = {
    reactStrictMode: true,
    poweredByHeader: false,
    async headers() {
        return [{ source: "/(.*)", headers: securityHeaders }];
    },
    images: {
        domains: ["ipfs.io"],
    },
};

module.exports = nextConfig;
