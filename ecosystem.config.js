// PM2 — процесс-менеджер для продакшена.
// Запускает standalone-сервер Next.js (output: 'standalone').
module.exports = {
  apps: [
    {
      name: 'kvartiry',
      script: '.next/standalone/server.js',
      cwd: '/var/www/kvartiry',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
      },
      out_file: '/var/log/kvartiry/out.log',
      error_file: '/var/log/kvartiry/error.log',
      time: true,
    },
  ],
};
