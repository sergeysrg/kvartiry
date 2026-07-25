# Бесплатный деплой на Netlify + Neon

Netlify — хостинг кода. Базы данных у него нет, поэтому PostgreSQL берём
бесплатно у **Neon**. Итог: публичный адрес вида `https://<имя>.netlify.app`.

```
Netlify (Next.js: страницы, API, админка)  ──→  Neon (PostgreSQL)
```

Всё бесплатно, карта не нужна.

---

## Шаг 1. База данных Neon (5 минут)

1. Зайдите на https://neon.tech → зарегистрируйтесь (можно через GitHub).
2. Create Project → регион поближе (EU Central / Frankfurt).
3. В разделе **Connection string** скопируйте **Pooled connection** (важно — именно
   pooled, с `-pooler` в хосте). Она выглядит так:
   ```
   postgresql://user:pass@ep-xxx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```

## Шаг 2. Залить схему и данные в Neon (один раз, локально)

В папке проекта, подставив свою строку Neon:

```bash
# Windows PowerShell:
$env:DATABASE_URL="postgresql://...pooler...neon.tech/neondb?sslmode=require"
$env:ADMIN_EMAIL="admin@example.com"
$env:ADMIN_PASSWORD="ваш-надёжный-пароль"
npx prisma db push        # создаёт таблицы в Neon
npm run prisma:seed       # наполняет данными обеих площадок
```

> Это делается **один раз**. При будущих редеплоях данные (включая правки из
> админки) сохраняются — сборка их не трогает.

## Шаг 3. Код в Git (Netlify деплоит из репозитория)

```bash
git init
git add .
git commit -m "kvartiry-nextjs"
```
Создайте пустой репозиторий на GitHub и запушьте туда (`git remote add origin ...`,
`git push -u origin main`).

> Без Git можно через Netlify CLI (см. «Альтернатива» ниже).

## Шаг 4. Netlify

1. https://app.netlify.com → зарегистрируйтесь.
2. **Add new site → Import an existing project** → выберите ваш GitHub-репозиторий.
3. Настройки сборки Netlify подхватит из `netlify.toml` — менять не нужно.
4. Откройте **Site settings → Environment variables** и добавьте:

   | Переменная | Значение |
   |---|---|
   | `DATABASE_URL` | пул-строка Neon (как в шаге 2) |
   | `AUTH_SECRET` | длинная случайная строка (сгенерируйте: `openssl rand -base64 32`) |
   | `ADMIN_EMAIL` | admin@example.com |
   | `ADMIN_PASSWORD` | ваш пароль админки |
   | `NEXT_PUBLIC_SITE_URL` | адрес сайта, напр. `https://ваш-сайт.netlify.app` |

5. **Deploy site**. Через пару минут будет живой адрес.

### Готово
- `https://ваш-сайт.netlify.app/unicum` и `/unikod` — площадки
- `https://ваш-сайт.netlify.app/admin` — админка (логин/пароль из env)

---

## Альтернатива без Git — Netlify CLI

```bash
npm i -g netlify-cli
netlify login            # откроет браузер для входа
netlify init             # создаст сайт
# добавьте env-переменные (шаг 4) в дашборде Netlify
netlify deploy --build --prod
```

## Частые проблемы
- **Prisma «engine not found»** — проверьте, что в `schema.prisma` есть
  `binaryTargets = ["native", "rhel-openssl-3.0.x"]` (уже добавлено).
- **Пустые страницы / 404 на /unikod** — база не наполнена: повторите шаг 2.
- **Ошибки соединения с БД под нагрузкой** — используйте именно **pooled**-строку Neon.

## Ещё проще (альтернатива Netlify)
Для Next.js самый простой бесплатный хостинг — **Vercel** (создатели Next):
`vercel` CLI или импорт репозитория, база — тот же Neon. Шаги аналогичны.
