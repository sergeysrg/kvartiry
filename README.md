# Подбор квартир — Next.js 14 (две площадки + админка)

Мультисайтовый лендинг-конструктор с квизом. Две посадочные страницы —
**«Уникод на Технической»** (`/unikod`) и **«Уникум на Амирхана»** (`/unicum`) —
рендерятся из БД одним набором компонентов. Есть защищённая админ-панель
для правки контента, вопросов квиза, интеграций и настроек.

Копии-референсы: https://unikod-na-texnicheskoy.ru/podbor и
https://unicum-amirhana-kazan.ru/podbor

## Стек

- **Next.js 14** (App Router) + **TypeScript** (strict)
- **Tailwind CSS** (+ кастомные классы, тема через CSS-переменные)
- **Framer Motion** — анимации модалки, шагов, прогресс-бара, тостов, hover
- **React Hook Form + Zod** — форма и валидация
- **Prisma + PostgreSQL** — данные и контент
- Аутентификация админки — JWT-сессия (`jose`) в httpOnly-cookie + middleware

## Возможности

**Фронтенд (mobile-first, 320 → 1920px):**
- Шапка (лого, телефон, «Оставить заявку»), герой (бейдж, преимущества,
  статистика, бонусы, кроссфейд-слайдер), футер с реквизитами.
- Квиз в модалке: 4 шага (карточки / иконки / список / форма), прогресс-бар
  **без скругления**, боковая панель с консультантом и «выгодой», авто-переход
  по выбору, валидация с подсветкой, toast-уведомления, экран «Спасибо».
- Плавные переходы между шагами и появление модалки (Framer Motion).

**SEO:**
- `generateMetadata` (title/description/canonical), Open Graph, Twitter Cards.
- JSON-LD Schema.org: **RealEstateAgent** + **Product** (в `<head>` каждого лендинга).
- `sitemap.xml`, `robots.txt` (админка и API закрыты от индексации).

**Админка (`/admin`):**
- Контент: заголовок, подзаголовок, бейдж, преимущества, статистика, бонусы,
  изображения (URL), консультант, реквизиты.
- Квиз: добавление/удаление шагов и вариантов, правка вопросов/ответов, вид
  шага и «выгода».
- Интеграции: Яндекс.Метрика, Яндекс.Вебмастер, Битрикс24, amoCRM, GA4 —
  вкл/выкл + параметры. Метрика/верификация подставляются в лендинг автоматически;
  заявки уходят в Битрикс24/amoCRM (webhook/API).
- Настройки: телефон, email, адрес, режим работы, мета-теги.

## Быстрый старт (локально)

Нужны Node.js 18+ и PostgreSQL 14+.

```bash
# 1. Зависимости
npm install

# 2. Переменные окружения
cp .env.example .env
#   пропишите DATABASE_URL, AUTH_SECRET, ADMIN_EMAIL/ADMIN_PASSWORD

# 3. Схема БД + наполнение данными обеих площадок
npx prisma migrate dev --name init
npm run prisma:seed

# 4. Запуск
npm run dev
```

- Лендинги: http://localhost:3000/unicum и http://localhost:3000/unikod
  (`/` редиректит на площадку по умолчанию — Уникум).
- Админка: http://localhost:3000/admin
  (логин/пароль из `.env`, по умолчанию `admin@example.com` / `admin12345`).

## Скрипты

| Команда | Действие |
|---|---|
| `npm run dev` | Дев-сервер |
| `npm run build` | `prisma generate` + прод-сборка |
| `npm start` | Прод-сервер |
| `npm run prisma:migrate:dev` | Миграции (dev) |
| `npm run prisma:seed` | Наполнение БД |
| `npm run db:setup` | `migrate deploy` + seed (для сервера) |

## Структура

```
app/
  (landing)/
    [site]/page.tsx        # лендинг по slug + generateMetadata + JSON-LD
    components/            # Header, Hero, Footer, QuizModal, QuizStep,
                          #   ProgressBar, Consultant, Toast, Analytics …
  admin/
    page.tsx, layout.tsx, login/
    components/            # AdminDashboard, ContentEditor, QuizEditor,
                          #   Integrations, Settings
  api/                    # content, quiz, integrations, settings, auth, lead
  lib/                    # db, quiz, seo, auth, phone, integrations
  types/                  # общие типы
hooks/useQuiz.ts          # состояние квиза
prisma/schema.prisma      # Site, Content, QuizStep/Option, Integration,
                          #   Settings, User, Lead
prisma/seed.ts            # данные обеих площадок
middleware.ts             # защита /admin
deploy.sh, ecosystem.config.js
```

## Деплой на сервер (SSH + PM2)

Ключ доступа выдаёт **Денис Петренко** — положите его локально и укажите путь.

**На сервере один раз:** установите Node.js 18+, PostgreSQL, PM2 (`npm i -g pm2`),
создайте БД и `.env` в `/var/www/kvartiry` (тот же, что локально, но с боевыми
значениями), примените схему:

```bash
cd /var/www/kvartiry
npm run db:setup     # prisma migrate deploy + seed
```

**Деплой одной командой (с локальной машины):**

```bash
DEPLOY_HOST=<ip-сервера> \
DEPLOY_USER=deploy \
DEPLOY_PATH=/var/www/kvartiry \
SSH_KEY=~/.ssh/kvartiry_key \
./deploy.sh
```

Скрипт: rsync исходников → `npm ci` → `prisma migrate deploy` → `npm run build`
→ копирование статики в standalone → `pm2 startOrReload ecosystem.config.js`.

Проксирование (nginx) на `127.0.0.1:3000` и HTTPS настраиваются отдельно.

## Переменные окружения

| Переменная | Назначение |
|---|---|
| `DATABASE_URL` | Строка подключения PostgreSQL |
| `AUTH_SECRET` | Секрет подписи JWT-сессии (`openssl rand -base64 32`) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Учётка админа (создаётся сидом) |
| `NEXT_PUBLIC_SITE_URL` | Базовый URL (для canonical / OG / sitemap) |

## Примечания

- Изображения тянутся с CDN референсов (`static/optim.tildacdn.com`) — домены
  разрешены в `next.config.js`. Для автономности замените URL в админке на свои
  (положив файлы в `public/images`).
- Заявки квиза сохраняются в таблицу `Lead`, логируются в консоль и (если
  включены интеграции) уходят в Битрикс24 / amoCRM.
```
