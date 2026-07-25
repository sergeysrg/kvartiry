/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'static.tildacdn.com' },
      { protocol: 'https', hostname: 'optim.tildacdn.com' },
      { protocol: 'https', hostname: '**' },
    ],
  },
  // standalone — только для self-host (PM2/Docker). На Netlify адаптер
  // собирает вывод сам, поэтому там standalone отключаем (Netlify задаёт NETLIFY=true).
  output: process.env.NETLIFY ? undefined : 'standalone',
};

module.exports = nextConfig;
