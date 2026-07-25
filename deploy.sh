#!/usr/bin/env bash
# ============================================================================
# Деплой на сервер по SSH.
# Ключ выдаёт Денис Петренко — положите его и укажите путь в SSH_KEY.
#
# Использование:
#   DEPLOY_HOST=1.2.3.4 DEPLOY_USER=deploy SSH_KEY=~/.ssh/kvartiry ./deploy.sh
#
# Что делает:
#   1) rsync исходников на сервер (без node_modules/.next/.env)
#   2) на сервере: npm ci → prisma migrate deploy → prisma seed (1 раз) → build
#   3) подготавливает standalone и (пере)запускает PM2
# ============================================================================
set -euo pipefail

DEPLOY_HOST="${DEPLOY_HOST:?Укажите DEPLOY_HOST (IP/домен сервера)}"
DEPLOY_USER="${DEPLOY_USER:-deploy}"
DEPLOY_PATH="${DEPLOY_PATH:-/var/www/kvartiry}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_rsa}"
SSH_PORT="${SSH_PORT:-22}"

SSH="ssh -i ${SSH_KEY} -p ${SSH_PORT} ${DEPLOY_USER}@${DEPLOY_HOST}"

echo "▸ 1/4 Синхронизация файлов на ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}"
rsync -az --delete \
  -e "ssh -i ${SSH_KEY} -p ${SSH_PORT}" \
  --exclude node_modules \
  --exclude .next \
  --exclude .git \
  --exclude .env \
  ./ "${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/"

echo "▸ 2/4 Установка зависимостей и миграции"
$SSH bash -lc "'
  set -e
  cd ${DEPLOY_PATH}
  npm ci
  npx prisma generate
  npx prisma migrate deploy
'"

echo "▸ 3/4 Сборка и подготовка standalone"
$SSH bash -lc "'
  set -e
  cd ${DEPLOY_PATH}
  npm run build
  # копируем статику и public внутрь standalone-сборки
  cp -r .next/static .next/standalone/.next/static
  [ -d public ] && cp -r public .next/standalone/public || true
'"

echo "▸ 4/4 Перезапуск PM2"
$SSH bash -lc "'
  set -e
  cd ${DEPLOY_PATH}
  mkdir -p /var/log/kvartiry || sudo mkdir -p /var/log/kvartiry || true
  pm2 startOrReload ecosystem.config.js --update-env
  pm2 save
'"

echo "✓ Готово. Проверьте: http://${DEPLOY_HOST}:3000"
