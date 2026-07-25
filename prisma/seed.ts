import { PrismaClient, QuizStepKind, ContentType, IntegrationType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Утилита: собрать content-запись из ключа/значения.
type C = { key: string; value: unknown; type?: ContentType };
const text = (key: string, value: string): C => ({ key, value, type: ContentType.TEXT });
const json = (key: string, value: unknown): C => ({ key, value, type: ContentType.JSON });

const LOCK = 'https://static.tildacdn.com/tild3266-6638-4635-b536-643634613230/lock.svg';
const CONSULTANT =
  'https://optim.tildacdn.com/tild6436-3436-4039-a132-386131616664/-/cover/176x176/center/center/-/format/webp/consultant.jpg.webp';
const UNISTROY = 'https://static.tildacdn.com/tild3235-6663-4565-b466-386136616134/___.png';

type SiteSeed = {
  slug: string;
  name: string;
  domain: string;
  isDefault?: boolean;
  theme: Record<string, string>;
  logoUrl: string;
  contents: C[];
  settings: {
    phone: string;
    phoneHref: string;
    email: string;
    address: string;
    workingHours: { label: string; value: string }[];
    socials: { type: string; url: string }[];
    metaTitle: string;
    metaDescription: string;
    ogImage: string;
  };
  steps: {
    order: number;
    question: string;
    kind: QuizStepKind;
    gain: string;
    options: { order: number; label: string; value: string; imageUrl?: string }[];
  }[];
};

const SITES: SiteSeed[] = [
  // ================= УНИКОД НА ТЕХНИЧЕСКОЙ =================
  {
    slug: 'unikod',
    name: 'Уникод на Технической',
    domain: 'unikod-na-texnicheskoy.ru',
    theme: {
      accentColor: '#ff4e08',
      accentDark: '#e64606',
      navyColor: '#170c4e', // индиго — база кнопок
      navyDark: '#ff4e08', // hover: кнопки становятся оранжевыми (как на оригинале)
      ctaColor: '#170c4e',
      ctaHover: '#ff4e08',
    },
    logoUrl: 'https://static.tildacdn.com/tild3239-6536-4530-a632-346236396462/logo_1.svg',
    contents: [
      text('hero.badge', 'Квартиры от 28 до 99 м²'),
      text('hero.title', 'Жилой дом «Уникод на Технической» в Казани с выгодой до 900 000 ₽'),
      text('hero.subtitle', 'В 15 минутах от центра'),
      json('hero.features', [
        'Виды на Волгу и озеро Кабан',
        'Квартиры с террасами',
        'Система очистки воды и умные технологии',
        'Приватный двор-парк с прогулочными аллеями',
      ]),
      json('hero.stats', [
        { label: 'Сдача проекта', value: 'в 2028 г.' },
        { label: 'Рассрочка', value: 'от застройщика' },
      ]),
      json('hero.bonuses', [
        {
          title: 'Подборка\nбесплатно',
          image:
            'https://optim.tildacdn.com/tild6532-3965-4438-b833-613061383731/-/resize/240x/-/format/webp/buklet.png.webp',
          lock: LOCK,
        },
        {
          title: 'Бонус до 3%',
          image:
            'https://optim.tildacdn.com/tild6238-3239-4264-b939-646534616537/-/resize/240x/-/format/webp/photo.png.webp',
          lock: LOCK,
        },
      ]),
      json('hero.images', [
        'https://optim.tildacdn.com/tild3939-3866-4239-b737-323037656638/-/resize/1600x/-/format/webp/027_1_1.jpg.webp',
        'https://optim.tildacdn.com/tild3435-3564-4337-a463-616533636435/-/resize/1600x/-/format/webp/005_1_1.jpg.webp',
        'https://optim.tildacdn.com/tild3635-6131-4338-b939-666330643731/-/resize/1600x/-/format/webp/012_1_1.jpg.webp',
      ]),
      text('consultant.name', 'Валеева Альфия'),
      text('consultant.role', 'Менеджер отдела продаж'),
      text('consultant.photo', CONSULTANT),
      json('consultant.quotes', [
        'Ответьте на несколько вопросов и я составлю для вас предложение с вариантами планировок и стоимостью',
        'Подробно расскажу про все интересующие вас акции и предложения, чтобы сделать максимально выгодное предложение',
        'У нас есть 2 варианта бронирования лотов сроком до двух недель. Подробнее расскажу на бесплатной консультации',
        'Оставьте актуальный номер телефона для получения подборки по выбранным параметрам с ценами и планировками',
      ]),
      text('footer.developer', 'ООО «Специализированный Застройщик «Строительная Компания «УнистройДом-6»'),
      text('footer.phonePrefix', ''), // Уникод: телефон в футере без префикса «Тел:»
      json('footer.legal', [
        'ООО «СТРОЙРИЭЛТ»',
        'ИНН 1657193706',
        'КПП 165701001',
        'ОГРН 1151690025695',
        'Юридический адрес: 420133, Республика Татарстан, г. Казань, ул. Гаврилова, д. 1, помещ. 18н, помещ. 172, офис 107',
      ]),
      text('footer.devLogo', UNISTROY),
    ],
    settings: {
      phone: '+7 843 207-13-86',
      phoneHref: 'tel:+78432071386',
      email: 'sale@unikod-na-texnicheskoy.ru',
      address: 'г. Казань, ул. Гаврилова, д. 1',
      workingHours: [
        { label: 'ПН-ПТ', value: '09:00 — 20:00' },
        { label: 'СБ', value: '09:00 — 16:00' },
        { label: 'ВС', value: 'Выходной' },
      ],
      socials: [],
      metaTitle: 'Квартиры комфорт-класса в ЖК «Уникод на Технической» Казань',
      metaDescription:
        'Жилой дом «Уникод на Технической» в Казани с выгодой до 900 000 ₽. Квартиры от 28 до 99 м², 15 минут до центра. Пройдите тест и получите бесплатную подборку планировок с ценами.',
      ogImage:
        'https://optim.tildacdn.com/tild3939-3866-4239-b737-323037656638/-/resize/1600x/-/format/webp/027_1_1.jpg.webp',
    },
    steps: [
      {
        order: 1,
        question: 'Сколько комнат вас интересует?',
        kind: QuizStepKind.CARDS,
        gain: '1%',
        options: [
          { order: 1, label: 'Студия', value: 'Студия', imageUrl: 'https://optim.tildacdn.com/tild3436-6432-4635-b261-323238336333/-/resize/560x/-/format/webp/st.png.webp' },
          { order: 2, label: '1-комнатная', value: '1-комнатная', imageUrl: 'https://optim.tildacdn.com/tild3538-3361-4335-a632-393134313365/-/resize/560x/-/format/webp/1k.png.webp' },
          { order: 3, label: '2-комнатная', value: '2-комнатная', imageUrl: 'https://optim.tildacdn.com/tild3265-6264-4664-b230-613530313032/-/resize/560x/-/format/webp/2k.png.webp' },
          { order: 4, label: '3-комнатная', value: '3-комнатная', imageUrl: 'https://optim.tildacdn.com/tild6639-6130-4238-b266-353164326462/-/resize/560x/-/format/webp/3k.png.webp' },
        ],
      },
      {
        order: 2,
        question: 'Какие акции вам интересны?',
        kind: QuizStepKind.ICONS,
        gain: '2%',
        options: [
          { order: 1, label: '100% оплата', value: '100% оплата', imageUrl: 'https://static.tildacdn.com/tild6336-6136-4238-b966-343935313462/sale_1.svg' },
          { order: 2, label: 'Рассрочка', value: 'Рассрочка', imageUrl: 'https://static.tildacdn.com/tild3632-6434-4461-b936-316362613530/sale_2.svg' },
          { order: 3, label: 'Ипотека', value: 'Ипотека', imageUrl: 'https://static.tildacdn.com/tild6139-3631-4039-b731-326664613334/sale_3.svg' },
          { order: 4, label: 'Трейд-ин', value: 'Трейд-ин', imageUrl: 'https://static.tildacdn.com/tild3030-3166-4364-b135-326137363539/sale_7.svg' },
          { order: 5, label: 'Нужна консультация', value: 'Нужна консультация', imageUrl: 'https://static.tildacdn.com/tild6166-3463-4566-a336-303837363934/sale_5.svg' },
        ],
      },
      {
        order: 3,
        question: 'Когда планируете покупку?',
        kind: QuizStepKind.LIST,
        gain: '3%',
        options: [
          { order: 1, label: 'В ближайшее время', value: 'В ближайшее время' },
          { order: 2, label: '3-6 месяцев', value: '3-6 месяцев' },
          { order: 3, label: 'Еще определяюсь', value: 'Еще определяюсь' },
        ],
      },
      {
        order: 4,
        question: 'Получите подборку квартир под ваш запрос с актуальными ценами и акциями',
        kind: QuizStepKind.FORM,
        gain: '3%',
        options: [],
      },
    ],
  },

  // ================= УНИКУМ НА АМИРХАНА =================
  {
    slug: 'unicum',
    name: 'Уникум на Амирхана',
    domain: 'unicum-amirhana-kazan.ru',
    isDefault: true,
    theme: {
      accentColor: '#458c8e',
      accentDark: '#397374',
      navyColor: '#175844',
      navyDark: '#243f2c',
      ctaColor: '#24272a',
      ctaHover: '#175844',
    },
    logoUrl: 'https://static.tildacdn.com/tild3735-3534-4635-a462-653761663932/logo.svg',
    contents: [
      text('hero.badge', 'Квартиры от 32 до 155 м²'),
      text('hero.title', 'Жилой дом «Уникум на Амирхана» в Казани с выгодой до 1,1 млн. ₽'),
      text('hero.subtitle', 'В 15 минутах от центра'),
      json('hero.features', [
        'Вид на «Малое Чайковое озеро»',
        'Разнообразие планировочных решений',
        'Закрытые дворы-парки',
        'Паркинг с лифтом',
      ]),
      json('hero.stats', [
        { label: 'Сдача проекта', value: 'в 2027 г.' },
        { label: 'Рассрочка', value: 'от застройщика' },
      ]),
      json('hero.bonuses', [
        {
          title: 'Подборка\nбесплатно',
          image:
            'https://optim.tildacdn.com/tild3136-6333-4533-a636-346265326464/-/resize/240x/-/format/webp/buklet.png.webp',
          lock: LOCK,
        },
        {
          title: 'Рассрочка на\nкладовую',
          image:
            'https://optim.tildacdn.com/tild6238-3239-4264-b939-646534616537/-/resize/240x/-/format/webp/photo.png.webp',
          lock: LOCK,
        },
      ]),
      json('hero.images', [
        'https://optim.tildacdn.com/tild3337-3364-4331-b239-366462663664/-/resize/1600x/-/format/webp/unicum-amirhana-3.png.webp',
      ]),
      text('consultant.name', 'Валеева Альфия'),
      text('consultant.role', 'Менеджер отдела продаж'),
      text('consultant.photo', CONSULTANT),
      json('consultant.quotes', [
        'Ответьте на несколько вопросов и я составлю для вас предложение с вариантами планировок и стоимостью',
        'Подробно расскажу про все интересующие вас акции и предложения, чтобы сделать максимально выгодное предложение',
        'У нас есть 2 варианта бронирования лотов сроком до двух недель. Подробнее расскажу на бесплатной консультации',
        'Оставьте актуальный номер телефона для получения подборки по выбранным параметрам с ценами и планировками',
      ]),
      text('footer.developer', 'Застройщик: ООО Специализированный застройщик «СК «УнистройДом-5»'),
      text('footer.phonePrefix', 'Тел: '), // Уникум: телефон в футере с префиксом «Тел:»
      json('footer.legal', [
        'ООО «СТРОЙРИЭЛТ»',
        'ИНН 1657193706, КПП 165701001, ОГРН 1151690025695',
        'Юридический адрес: 420133, Республика Татарстан, г. Казань, ул. Гаврилова, д. 1, помещ. 18н, помещ. 172, офис 107',
      ]),
      text('footer.devLogo', UNISTROY),
    ],
    settings: {
      phone: '+7 843 207-06-45',
      phoneHref: 'tel:+78432070645',
      email: 'sale@unicum-amirhana-kazan.ru',
      address: 'г. Казань, ул. Гаврилова, д. 1',
      workingHours: [
        { label: 'пн - пт', value: '09:00 - 20:00' },
        { label: 'сб', value: '09:00 - 16:00' },
      ],
      socials: [],
      metaTitle: 'Квартиры комфорт-класса в ЖК «Уникум на Амирхана» Казань',
      metaDescription:
        'Жилой дом «Уникум на Амирхана» в Казани с выгодой до 1,1 млн ₽. Квартиры от 32 до 155 м², 15 минут до центра. Пройдите тест и получите бесплатную подборку планировок с ценами.',
      ogImage:
        'https://optim.tildacdn.com/tild3337-3364-4331-b239-366462663664/-/resize/1600x/-/format/webp/unicum-amirhana-3.png.webp',
    },
    steps: [
      {
        order: 1,
        question: 'Сколько комнат вас интересует?',
        kind: QuizStepKind.CARDS,
        gain: '1%',
        options: [
          { order: 1, label: '1-комнатная', value: '1-комнатная', imageUrl: 'https://optim.tildacdn.com/tild3538-3361-4335-a632-393134313365/-/resize/560x/-/format/webp/1k.png.webp' },
          { order: 2, label: '2-комнатная', value: '2-комнатная', imageUrl: 'https://optim.tildacdn.com/tild3265-6264-4664-b230-613530313032/-/resize/560x/-/format/webp/2k.png.webp' },
          { order: 3, label: '3-комнатная', value: '3-комнатная', imageUrl: 'https://optim.tildacdn.com/tild6639-6130-4238-b266-353164326462/-/resize/560x/-/format/webp/3k.png.webp' },
        ],
      },
      {
        order: 2,
        question: 'Какие акции вам интересны?',
        kind: QuizStepKind.ICONS,
        gain: '2%',
        options: [
          { order: 1, label: 'Рассрочка с первым взносом: от 20%', value: 'Рассрочка с первым взносом: от 20%', imageUrl: 'https://static.tildacdn.com/tild3632-6434-4461-b936-316362613530/sale_2.svg' },
          { order: 2, label: 'Ипотека', value: 'Ипотека', imageUrl: 'https://static.tildacdn.com/tild6139-3631-4039-b731-326664613334/sale_3.svg' },
          { order: 3, label: 'Спецпредложение на паркинг', value: 'Специальное предложение на парковочные места', imageUrl: 'https://static.tildacdn.com/tild3030-3166-4364-b135-326137363539/sale_7.svg' },
          { order: 4, label: 'Рассмотрю все акции', value: 'Рассмотрю все акции', imageUrl: 'https://static.tildacdn.com/tild6166-3463-4566-a336-303837363934/sale_5.svg' },
        ],
      },
      {
        order: 3,
        question: 'Когда планируете покупку?',
        kind: QuizStepKind.LIST,
        gain: '3%',
        options: [
          { order: 1, label: 'В ближайшее время', value: 'В ближайшее время' },
          { order: 2, label: '3-6 месяцев', value: '3-6 месяцев' },
          { order: 3, label: 'Еще определяюсь', value: 'Еще определяюсь' },
        ],
      },
      {
        order: 4,
        question: 'Получите подборку квартир под ваш запрос с актуальными ценами и акциями',
        kind: QuizStepKind.FORM,
        gain: '3%',
        options: [],
      },
    ],
  },
];

const INTEGRATION_TYPES: IntegrationType[] = [
  IntegrationType.YANDEX_METRIKA,
  IntegrationType.YANDEX_WEBMASTER,
  IntegrationType.BITRIX24,
  IntegrationType.AMOCRM,
  IntegrationType.GOOGLE_ANALYTICS,
];

async function main() {
  // --- Админ ---
  const email = process.env.ADMIN_EMAIL ?? 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD ?? 'admin12345';
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash, name: 'Администратор' },
  });
  console.log(`✓ Админ: ${email} / ${password}`);

  // --- Площадки ---
  for (const s of SITES) {
    const site = await prisma.site.upsert({
      where: { slug: s.slug },
      update: { name: s.name, domain: s.domain, isDefault: s.isDefault ?? false, logoUrl: s.logoUrl, ...s.theme },
      create: { slug: s.slug, name: s.name, domain: s.domain, isDefault: s.isDefault ?? false, logoUrl: s.logoUrl, ...s.theme },
    });

    // контент
    for (const c of s.contents) {
      const value = typeof c.value === 'string' ? c.value : JSON.stringify(c.value);
      await prisma.content.upsert({
        where: { siteId_key: { siteId: site.id, key: c.key } },
        update: { value, type: c.type ?? ContentType.TEXT },
        create: { siteId: site.id, key: c.key, value, type: c.type ?? ContentType.TEXT },
      });
    }

    // настройки
    await prisma.settings.upsert({
      where: { siteId: site.id },
      update: {
        phone: s.settings.phone,
        phoneHref: s.settings.phoneHref,
        email: s.settings.email,
        address: s.settings.address,
        workingHours: s.settings.workingHours,
        socials: s.settings.socials,
        metaTitle: s.settings.metaTitle,
        metaDescription: s.settings.metaDescription,
        ogImage: s.settings.ogImage,
      },
      create: {
        siteId: site.id,
        phone: s.settings.phone,
        phoneHref: s.settings.phoneHref,
        email: s.settings.email,
        address: s.settings.address,
        workingHours: s.settings.workingHours,
        socials: s.settings.socials,
        metaTitle: s.settings.metaTitle,
        metaDescription: s.settings.metaDescription,
        ogImage: s.settings.ogImage,
      },
    });

    // квиз — пересобираем целиком, чтобы seed был идемпотентным
    await prisma.quizStep.deleteMany({ where: { siteId: site.id } });
    for (const step of s.steps) {
      await prisma.quizStep.create({
        data: {
          siteId: site.id,
          order: step.order,
          question: step.question,
          kind: step.kind,
          gain: step.gain,
          options: { create: step.options },
        },
      });
    }

    // интеграции (выключены по умолчанию)
    for (const type of INTEGRATION_TYPES) {
      await prisma.integration.upsert({
        where: { siteId_type: { siteId: site.id, type } },
        update: {},
        create: { siteId: site.id, type, enabled: false, config: {} },
      });
    }

    console.log(`✓ Площадка: ${s.name} (/${s.slug})`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
