# Сдача проекта — «Подбор квартир» (две площадки)

Лендинги подбора квартир с квизом и админ-панелью. Две площадки —
**«Уникод на Технической»** и **«Уникум на Амирхана»** — работают из одной
кодовой базы (data-driven, контент в БД).

## 🔗 Ссылки

| Что | Ссылка |
|---|---|
| **Живое демо — Уникум** | https://kvartiry.netlify.app/unicum |
| **Живое демо — Уникод** | https://kvartiry.netlify.app/unikod |
| **Админ-панель** | https://kvartiry.netlify.app/admin |
| **Исходный код** | https://github.com/sergeysrg/kvartiry |

**Доступ в админку (демо):** `admin@example.com` / `admin12345`

## Развёрнуто
- **Публичное демо (Netlify + Neon PostgreSQL):** https://kvartiry.netlify.app —
  открывается сразу, обе площадки + админка. Автодеплой из GitHub.
- **Staging-сервер (деплой по SSH, как в ТЗ):** приложение развёрнуто в
  `/home/test/app`, зависимости + `prisma db push` + seed в отдельную БД
  `kvartiry_staging`, запущено через **PM2** на `127.0.0.1:3020`. Обратный
  прокси **Caddy** проксирует домен `test.1development.online → :3020`.
  Проверено на сервере: `/unicum`, `/unikod` → 200, `/admin` → защита,
  логин админки работает. Публичный домен откроется с авто-HTTPS после
  добавления DNS-записи `A → <IP сервера>` (управляется на стороне заказчика).

## Технологии
Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion ·
React Hook Form + Zod · Prisma · PostgreSQL. Аутентификация админки — JWT в
httpOnly-cookie + middleware.

## Что реализовано
- Две посадочные страницы с индивидуальной темой (цвета, контент, квиз) из БД.
- Квиз в модалке: 4 шага, прогресс-бар, боковая панель, валидация, тосты,
  плавные переходы (Framer Motion). Mobile-first (320→1920).
- SEO: JSON-LD Schema.org (RealEstateAgent + Product), Open Graph, Twitter,
  canonical, sitemap.xml, robots.txt.
- Админ-панель: правка контента и изображений, добавление/удаление вопросов и
  вариантов квиза, интеграции (Яндекс.Метрика, Вебмастер, Битрикс24, amoCRM, GA4),
  настройки (телефон, адрес, режим работы, мета).

## Запуск локально
```bash
npm install
cp .env.example .env          # прописать DATABASE_URL, AUTH_SECRET
npx prisma db push            # создать таблицы
npm run prisma:seed           # наполнить данными обеих площадок
npm run dev                   # http://localhost:3000
```

## Развёртывание на основной домен

Нужна своя база PostgreSQL (напр. бесплатный Neon) и любой из хостингов.
Весь контент — в `prisma/seed.ts`; на новой базе выполнить `prisma db push` +
`npm run prisma:seed`, дальше правки — через админку.

**Переменные окружения:**

| Переменная | Назначение |
|---|---|
| `DATABASE_URL` | строка подключения PostgreSQL (для serverless — pooled) |
| `AUTH_SECRET` | секрет подписи сессии (`openssl rand -base64 32`) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | учётка админа (создаётся сидом) |
| `NEXT_PUBLIC_SITE_URL` | боевой адрес (для canonical / OG / sitemap) |

**Варианты хостинга:**
1. **Netlify/Vercel** — импорт репозитория + переменные окружения. Основной
   домен привязывается в настройках домена хостинга (DNS). См. `DEPLOY-NETLIFY.md`.
2. **Свой сервер по SSH + PM2** — скрипт `deploy.sh` (rsync → build → PM2) и
   `ecosystem.config.js`. См. `README.md`.

## Примечания
- Демо-БД (Neon) — временная; для прода развернуть свою и сбросить пароль.
- Изображения/логотипы тянутся с CDN исходных сайтов; для автономности заменить
  URL в админке на свои (файлы в `public/images`).
- Телефоны на исходных сайтах — call-tracking (меняются), в проекте заданы
  канонические офисные номера.
- Заявки квиза сохраняются в таблицу `Lead` и (если включены интеграции)
  уходят в Битрикс24 / amoCRM.
