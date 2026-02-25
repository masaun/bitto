/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    STACKS_NETWORK: process.env.STACKS_NETWORK || 'testnet'
  }
}

module.exports = nextConfig
