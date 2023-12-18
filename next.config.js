/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  experimental: {
    serverComponentsExternalPackages: ["@react-email/components",
      "@react-email/tailwind"]
  }
}
module.exports = nextConfig
