import { Language } from '../context/LanguageContext';
import { MenuCategory } from './restaurantData';

export interface DishTranslation {
  name: string;
  description: string;
  portion: string;
  prepTime: string;
}

export interface HallTranslation {
  title: string;
  capacity: string;
  description: string;
  details: string[];
}

export interface ReviewTranslation {
  id: string;
  author: string;
  visitContext: string;
  rating: string;
  quote: string;
}

export interface SiteTranslation {
  nav: {
    menu: string;
    halls: string;
    photos: string;
    address: string;
    reserveBtn: string;
    callLabel: string;
    openMenu: string;
    closeMenu: string;
  };
  restaurant: {
    city: string;
    address: string;
    fullName: string;
    landmark: string;
    hours: string;
    averageCheck: string;
    capacity: string;
    ratingSource: string;
    amenities: string[];
    currency: string;
  };
  hero: {
    headline: string;
    subtitle: string;
    reserveCta: string;
    menuCta: string;
    carouselLabel: string;
    prevPhoto: string;
    nextPhoto: string;
    goToPhoto: (n: number) => string;
    metrics: {
      ratingLabelFallback: string;
      ratingLabelGoogle: string;
      ratingDetailFallback: string;
      ratingDetailGoogle: (count: number) => string;
      hallLabel: string;
      hallDetail: string;
      hoursValue: string;
      hoursLabel: string;
      hoursDetail: string;
      halalValue: string;
      halalLabel: string;
      halalDetail: string;
    };
  };
  menu: {
    eyebrow: string;
    title: string;
    subtitle: string;
    reserveBtn: string;
    categories: Record<MenuCategory, string>;
    searchPlaceholder: string;
    emptyTitle: string;
    emptySubtitle: string;
    resetBtn: string;
    chefPicksLabel: string;
  };
  halls: {
    eyebrow: string;
    title: string;
    subtitle: string;
    fallbackText: string;
    bookBtn: string;
  };
  reviews: {
    eyebrow: string;
    title: string;
  };
  location: {
    eyebrow: string;
    heading: string;
    landmarkPrefix: string;
    copyAddress: string;
    copiedAddress: string;
    openInMaps: string;
    addressLabel: string;
    phonesLabel: string;
    hoursServicesLabel: string;
    refreshBtn: string;
    mapFailedTitle: string;
    mapFailedDesc: string;
    getDirections: string;
    ratingPrefix: string;
    reviewsUnit: string;
    galleryTitle: string;
    galleryCount: (count: number) => string;
    galleryFallbackSubtitle: string;
    allPhotosLink: string;
    sourcePrefix: string;
    emptyGalleryMsg: string;
    openGalleryPhotos: string;
    enlargePhotoAria: (n: number) => string;
    closeAria: string;
    prevAria: string;
    nextAria: string;
  };
  reservation: {
    eyebrow: string;
    title: string;
    subtitlePrefix: string;
    subtitleMiddle: string;
    subtitleSuffix: string;
    quickContactTitle: string;
    savedBadge: string;
    savingBadge: string;
    fallbackBadge: string;
    confirmedTitle: string;
    confirmedSubtitle: (tg: string, email: string) => string;
    guestLabel: string;
    phoneLabel: string;
    hallLabel: string;
    dateTimeGuestsLabel: string;
    guestsUnit: string;
    emailPreviewLabel: string;
    copyText: string;
    copiedText: string;
    sendTelegramBtn: string;
    sendEmailBtn: string;
    newBookingBtn: string;
    chooseHallLabel: string;
    dateLabel: string;
    guestsCountLabel: string;
    decreaseGuestsAria: string;
    increaseGuestsAria: string;
    arrivalTimeLabel: string;
    nameLabel: string;
    namePlaceholder: string;
    phoneInputLabel: string;
    notesLabel: string;
    notesPlaceholder: string;
    submitBtn: string;
    submitHint: (tg: string, email: string) => string;
    errName: string;
    errPhone: string;
    errDate: string;
    errTime: string;
    msgGreeting: string;
    msgCode: string;
    msgHall: string;
    msgDate: string;
    msgTime: string;
    msgGuests: string;
    msgName: string;
    msgPhone: string;
    msgNotes: string;
    mailSubjectPrefix: string;
  };
  footer: {
    menu: string;
    halls: string;
    reserve: string;
    map: string;
  };
  photoCaptions: string[];
  dishes: Record<string, DishTranslation>;
  hallsData: Record<string, HallTranslation>;
  reviewsData: ReviewTranslation[];
}

export const TRANSLATIONS: Record<Language, SiteTranslation> = {
  uz: {
    nav: {
      menu: 'Menyu',
      halls: 'Zallar',
      photos: 'Rasmlar',
      address: 'Manzil',
      reserveBtn: 'Stol band qilish',
      callLabel: 'Qo‘ng‘iroq',
      openMenu: 'Navigatsiya menyusini ochish',
      closeMenu: 'Menyuni yopish',
    },
    restaurant: {
      city: 'Samarqand shahri',
      address: 'Farhod ko‘chasi, 31 / 42-uy',
      fullName: 'Tinchlik Oilaviy Restorani',
      landmark: 'Aziz bozori, 7-maktab va Favqulodda vaziyatlar boshqarmasi yaqinida',
      hours: 'Har kuni · 09:00 – 23:00',
      averageCheck: '50 000 – 150 000 so‘m',
      capacity: '250 o‘ringacha',
      ratingSource: 'Yandex Maps bahosi',
      amenities: ['Halol oshxona', 'Bepul Wi-Fi', 'Avtoturargoh', 'VIP xonalar'],
      currency: 'so‘m',
    },
    hero: {
      headline: 'Samarqand mehmondo‘stligi va oilaviy dasturxon fayzi',
      subtitle:
        'Tinchlik oilaviy restorani Farhod ko‘chasida milliy o‘zbek taomlari, cho‘g‘da pishirilgan shashlik hamda Yevropa oshxonasining sara taomlarini shinam va sokin muhitda taqdim etadi.',
      reserveCta: 'Stol bron qilish',
      menuCta: 'Menyuni ko‘rish',
      carouselLabel: 'Restoran rasmlari karuseli',
      prevPhoto: 'Oldingi rasm',
      nextPhoto: 'Keyingi rasm',
      goToPhoto: (n) => `${n}-rasmga o‘tish`,
      metrics: {
        ratingLabelFallback: 'Yandex Maps reytingi',
        ratingLabelGoogle: 'Google Maps reytingi',
        ratingDetailFallback: 'Samarqand mehmonlari bahosi',
        ratingDetailGoogle: (c) => `${c} ta haqiqiy sharh asosida`,
        hallLabel: 'Oilaviy va banket zali',
        hallDetail: 'Alohida VIP xonalar mavjud',
        hoursValue: '09:00 – 23:00',
        hoursLabel: 'Har kuni ochiq',
        hoursDetail: 'Tushlik, kechki ovqat va tadbirlar',
        halalValue: '100% Halol',
        halalLabel: 'Sertifikatlangan oshxona',
        halalDetail: 'Milliy va Yevropa taomlari',
      },
    },
    menu: {
      eyebrow: 'Oshxona va taomnoma',
      title: 'Milliy va Yevropa taomlari menyusi',
      subtitle:
        'Barcha taomlar yangi halol mahsulotlardan tayyorlanadi. O‘rtacha chek — 50 000 dan 150 000 so‘mgacha.',
      reserveBtn: 'Stol bron qilish',
      categories: {
        Barchasi: 'Barchasi',
        'Milliy taomlar': 'Milliy taomlar',
        'Kabob va mangal': 'Kabob va mangal',
        'Yevropa oshxonasi': 'Yevropa oshxonasi',
        'Salat va ichimliklar': 'Salat va ichimliklar',
      },
      searchPlaceholder: 'Taom nomini qidirish...',
      emptyTitle: 'Qidiruv bo‘yicha taom topilmadi',
      emptySubtitle: 'Boshqa toifani tanlang yoki qidiruv so‘zini tozalang.',
      resetBtn: 'Barcha taomlarni ko‘rish',
      chefPicksLabel: 'Oshpaz tavsiyasi · Mashhur taomlar',
    },
    halls: {
      eyebrow: 'Zallar va marosimlar',
      title: 'Har bir oilaviy uchrashuv va tantana uchun qulay makon',
      subtitle:
        'Kundalik oilaviy tushlikdan tortib 250 kishigacha bo‘lgan to‘y va yubileylargacha — mehmonlaringiz uchun qulay o‘rindiqlar, raqs maydonchasi va sokin VIP xonalar tayyor.',
      fallbackText: '250 nafargacha mehmon uchun oilaviy va banket zallari',
      bookBtn: 'Band qilish',
    },
    reviews: {
      eyebrow: 'Mehmonlar fikri',
      title: 'Samarqand aholisi va mehmonlari ishonchi',
    },
    location: {
      eyebrow: 'Manzil, xarita va Instagram',
      heading: 'Samarqand shahri, Farhod ko‘chasi, 31 / 42-uy',
      landmarkPrefix: 'Mo‘ljal',
      copyAddress: 'Manzilni nusxalash',
      copiedAddress: 'Manzil nusxalandi',
      openInMaps: 'Google Maps’da ochish',
      addressLabel: 'Manzil',
      phonesLabel: 'Telefon raqamlar',
      hoursServicesLabel: 'Ish vaqti va xizmatlar',
      refreshBtn: 'Yangilash',
      mapFailedTitle: 'Interaktiv xarita yuklanmadi',
      mapFailedDesc:
        'Samarqand shahri, Farhod ko‘chasi, 31 / 42-uy manzilini bevosita Google Maps ilovasida ko‘rishingiz mumkin.',
      getDirections: 'Yo‘nalish olish',
      ratingPrefix: 'Reyting',
      reviewsUnit: 'ta sharh',
      galleryTitle: 'Restoran rasmlari',
      galleryCount: (c) => `${c} ta haqiqiy rasm — kattalashtirish uchun bosing`,
      galleryFallbackSubtitle: 'Google Maps sahifasidagi haqiqiy restoran fotosuratlari',
      allPhotosLink: 'Google Maps’da barcha rasmlar',
      sourcePrefix: 'Manba',
      emptyGalleryMsg: 'Google Maps’dagi rasmlarni ko‘rish uchun quyidagi havolani oching.',
      openGalleryPhotos: 'Google Maps rasmlarini ochish',
      enlargePhotoAria: (n) => `Rasmni kattalashtirish (${n})`,
      closeAria: 'Yopish',
      prevAria: 'Oldingi rasm',
      nextAria: 'Keyingi rasm',
    },
    reservation: {
      eyebrow: 'Stol va zal bron qilish',
      title: 'Stol yoki banket zalini band qiling',
      subtitlePrefix: 'Ma’lumotlarni to‘ldirib «Bron qilish» tugmasini bosing — darhol ',
      subtitleMiddle:
        ' Telegram akkauntiga ariza ochiladi, restoran bazasiga yoziladi va ',
      subtitleSuffix: ' manziliga yuborish uchun tayyor holatda chiqadi.',
      quickContactTitle: 'Tezkor bog‘lanish va bron',
      savedBadge: 'Bazaga saqlandi',
      savingBadge: 'Bazaga saqlanmoqda...',
      fallbackBadge: 'Telegram va Email orqali yuborishingiz mumkin',
      confirmedTitle: 'Bron ma’lumotlari yuborildi va tayyor',
      confirmedSubtitle: (tg, email) =>
        `Arizangiz @${tg} Telegramiga yo‘naltirildi hamda ${email} manziliga yuborish uchun tayyorlandi.`,
      guestLabel: 'Mehmon',
      phoneLabel: 'Telefon raqam',
      hallLabel: 'Tanlangan zal',
      dateTimeGuestsLabel: 'Sana, vaqt va mehmonlar',
      guestsUnit: 'kishi',
      emailPreviewLabel: 'Yuboriladigan bron xati',
      copyText: 'Nusxa olish',
      copiedText: 'Nusxalandi',
      sendTelegramBtn: 'Telegramga yuborish',
      sendEmailBtn: 'Emailga yuborish',
      newBookingBtn: 'Yangi bron qilish',
      chooseHallLabel: 'Zal turini tanlang',
      dateLabel: 'Sana',
      guestsCountLabel: 'Mehmonlar soni',
      decreaseGuestsAria: 'Mehmonlar sonini kamaytirish',
      increaseGuestsAria: 'Mehmonlar sonini oshirish',
      arrivalTimeLabel: 'Kelish vaqti',
      nameLabel: 'Ismingiz',
      namePlaceholder: 'Masalan, Sardorbek',
      phoneInputLabel: 'Telefon raqamingiz',
      notesLabel: 'Qo‘shimcha istaklar (ixtiyoriy)',
      notesPlaceholder: 'Bolalar o‘rindig‘i, tug‘ilgan kun bezagi yoki maxsus istaklar...',
      submitBtn: 'Bron qilish',
      submitHint: (tg, email) =>
        `Bosganingizda ariza @${tg} Telegramiga ochiladi, bazaga saqlanadi hamda ${email} manziliga yuborish uchun tayyorlanadi.`,
      errName: 'Iltimos, ismingizni kiriting (kamida 2 ta harf).',
      errPhone: 'Iltimos, bog‘lanish uchun amaldagi telefon raqamingizni kiriting.',
      errDate: 'Iltimos, sanani to‘g‘ri kiriting.',
      errTime: 'Iltimos, kelish vaqtini tanlang.',
      msgGreeting: 'Assalomu alaykum! Tinchlik Oilaviy Restoranida stol bron qilmoqchiman:',
      msgCode: 'Bron raqami',
      msgHall: 'Zal',
      msgDate: 'Sana',
      msgTime: 'Kelish vaqti',
      msgGuests: 'Mehmonlar soni',
      msgName: 'Ism',
      msgPhone: 'Telefon',
      msgNotes: 'Qo‘shimcha izoh',
      mailSubjectPrefix: 'Stol bron qilish',
    },
    footer: {
      menu: 'Menyu',
      halls: 'Zallar',
      reserve: 'Stol band qilish',
      map: 'Manzil va xarita',
    },
    photoCaptions: [
      'Tinchlik Restorani · Kirish qismi (Google Maps)',
      'Tinchlik Restorani · Kechki ko‘rinish (Google Maps)',
      'Asosiy oilaviy zal interyeri (Google Maps)',
      'Restoran ichki bezagi va Tinchlik ramzi (Google Maps)',
      'Gullar bilan bezatilgan shinam zal (Google Maps)',
      'Tinchlik Restorani fasadi (Google Maps)',
      'Tinchlik maxsus go‘shtli taomi (Google Maps)',
      'Restoran maxsus salati (Google Maps)',
      'Issiq gazak va souslar (Google Maps)',
      'Go‘shtli sabzavotli salat (Google Maps)',
    ],
    dishes: {
      'samarqand-osh': {
        name: 'Samarqandcha zig‘ir osh',
        description:
          'An’anaviy qozonda alohida qatlamlab damlangan Samarqand palovi: sariq sabzi, no‘xat, mayin mol go‘shti va sarimsoq bilan.',
        portion: '380 g',
        prepTime: '15 daqiqa',
      },
      'komir-shashlik': {
        name: 'Assorti ko‘mir shashlik',
        description:
          'Saksovul cho‘g‘ida pishirilgan qo‘y va mol go‘shti sixlari, qizil piyoz, sumax va tandirda yopilgan issiq non bilan.',
        portion: '450 g · 4 six',
        prepTime: '20 daqiqa',
      },
      'uy-mantisi': {
        name: 'Qo‘lda tugilgan manti',
        description:
          'Yupqa xamir ichida mayda to‘g‘ralgan go‘sht va piyoz, bug‘da pishirilib suzma hamda ko‘katlar bilan tortiladi.',
        portion: '5 dona',
        prepTime: '20 daqiqa',
      },
      'ribay-steyk': {
        name: 'Marmar go‘shtli Ribay steyk',
        description:
          'Rozmarin va sarimsoq bilan qovurilgan suvli mol go‘shti steyki, pishirilgan kartoshka va murchli sous hamrohligida.',
        portion: '320 g',
        prepTime: '25 daqiqa',
      },
      'qaynatma-shorva': {
        name: 'Qo‘y go‘shtidan qaynatma sho‘rva',
        description:
          'Past olovda uzoq qaynatilgan tiniq bulyon, yirik sabzi, kartoshka, no‘xat va yangi kashnich.',
        portion: '420 ml',
        prepTime: '12 daqiqa',
      },
      'uygur-lagmon': {
        name: 'Cho‘zma lag‘mon',
        description:
          'Qo‘lda cho‘zilgan lag‘mon xamiri, qovurilgan sabzavotlar, bolgar qalampiri va xushbo‘y go‘shtli qayla.',
        portion: '400 g',
        prepTime: '18 daqiqa',
      },
      'qiyma-kabob': {
        name: 'Samarqandcha qiyma kabob',
        description:
          'Ziravorlar bilan to‘yintirilgan mayin qiyma kabob, ko‘mirda qizartirilgan pomidor va piyoz bilan.',
        portion: '1 six',
        prepTime: '15 daqiqa',
      },
      'tovuq-shashlik': {
        name: 'Ziravorli tovuq soni shashligi',
        description:
          'Qatiq va paprika marinadida yumshatilgan tovuq filesi, mangalda oltin rangda pishirilgan.',
        portion: '1 six',
        prepTime: '15 daqiqa',
      },
      'motsarella-pitsa': {
        name: 'Tinchlik maxsus pitsasi',
        description:
          'Yupqa xamirda pishirilgan halol kolbasa, motsarella pishlog‘i, zaytun va xushbo‘y pomidor sousi.',
        portion: '32 sm',
        prepTime: '20 daqiqa',
      },
      'imeruli-xachapuri': {
        name: 'Issiq xachapuri',
        description:
          'Tandirda qizargan yumshoq xamir va eritilgan suluguni pishlog‘i uyg‘unligi.',
        portion: '350 g',
        prepTime: '18 daqiqa',
      },
      'achichuk-salat': {
        name: 'Yangi uzilgan achichuk',
        description:
          'Samarqandning shirin pomidorlari, yupqa to‘g‘ralgan piyoz, achchiq qalampir va rayhon.',
        portion: '220 g',
        prepTime: '5 daqiqa',
      },
      'sezar-salat': {
        name: 'Grilda pishgan tovuqli Sezar',
        description:
          'Qarsildoq aysberg barglari, gril tovuq filesi, parmezan qirindisi, suxarik va klassik sous.',
        portion: '260 g',
        prepTime: '10 daqiqa',
      },
      'kok-choy-limon': {
        name: 'Limonli ko‘k choy (choynak)',
        description:
          'Samarqandcha damlangan oliy navli ko‘k choy, yangi limon bo‘laklari va yalpiz bilan.',
        portion: '800 ml',
        prepTime: '5 daqiqa',
      },
      'uy-kompot': {
        name: 'Mevazor sharbati (grafin)',
        description: 'Olcha, o‘rik va behidan tayyorlangan salqin uy kompoti.',
        portion: '1 litr',
        prepTime: '5 daqiqa',
      },
    },
    hallsData: {
      'oilaviy-zal': {
        title: 'Asosiy Oilaviy Zal',
        capacity: '80 nafargacha mehmon',
        description:
          'Kundalik tushliklar, oilaviy kechki ovqatlar va do‘stona uchrashuvlar uchun yorug‘ hamda keng zal.',
        details: ['Qulay yog‘och stollar', 'Bolalar uchun qulay muhit', 'Tezkor xizmat'],
      },
      'vip-xona': {
        title: 'Alohida VIP Xonalar',
        capacity: '8 – 24 nafar mehmon',
        description:
          'Sokin suhbatlar, oilaviy tug‘ilgan kunlar va ishbilarmonlik uchrashuvlari uchun yopiq shinam xonalar.',
        details: ['Shaxsiy ofitsiant xizmati', 'Alohida ovoz tizimi', 'Bepul Wi-Fi'],
      },
      'banket-zali': {
        title: 'Katta Banket Zali',
        capacity: '250 nafargacha mehmon',
        description:
          'To‘y, yubiley, korporativ kechalar va katta oilaviy marosimlar uchun bezatilgan tantanavor zal.',
        details: ['Raqs maydonchasi', 'Maxsus banket menyusi', 'Avtoturargoh'],
      },
    },
    reviewsData: [
      {
        id: 'rev-1',
        author: 'Dilshodjon Rahimov',
        visitContext: 'Oilaviy kechki ovqat · Samarqand',
        rating: '5.0 / 5',
        quote:
          'Samarqandcha oshi va ko‘mir shashliklari juda mazali. Oilamiz bilan tez-tez kelamiz, joyi tinch, xizmat ko‘rsatish madaniyati baland.',
      },
      {
        id: 'rev-2',
        author: 'Malika Karimova',
        visitContext: 'VIP xonada tug‘ilgan kun',
        rating: '4.8 / 5',
        quote:
          'Farhod ko‘chasidagi eng qulay oilaviy maskanlardan biri. Ham milliy taomlar, ham pitsa va salatlar bir joyda borligi bolalar uchun ayni muddao.',
      },
      {
        id: 'rev-3',
        author: 'Jasur Toshpo‘latov',
        visitContext: 'Banket tadbiri · 120 mehmon',
        rating: '4.7 / 5',
        quote:
          'Zali keng va shinam, dasturxon o‘z vaqtida tortildi. Narxlari ham sifatiga nisbatan juda maqbul.',
      },
    ],
  },

  ru: {
    nav: {
      menu: 'Меню',
      halls: 'Залы',
      photos: 'Фото',
      address: 'Адрес',
      reserveBtn: 'Забронировать стол',
      callLabel: 'Позвонить',
      openMenu: 'Открыть меню навигации',
      closeMenu: 'Закрыть меню',
    },
    restaurant: {
      city: 'г. Самарканд',
      address: 'ул. Фархада, 31 / дом 42',
      fullName: 'Семейный ресторан Tinchlik',
      landmark: 'Рядом с рынком Азиз, школой №7 и Управлением ЧС',
      hours: 'Ежедневно · 09:00 – 23:00',
      averageCheck: '50 000 – 150 000 сум',
      capacity: 'До 250 мест',
      ratingSource: 'Оценка на Яндекс Картах',
      amenities: ['Халяль кухня', 'Бесплатный Wi-Fi', 'Парковка', 'VIP-кабины'],
      currency: 'сум',
    },
    hero: {
      headline: 'Самаркандское гостеприимство и уютный семейный дастархан',
      subtitle:
        'Семейный ресторан Tinchlik на улице Фархада приглашает насладиться национальной узбекской кухней, шашлыком на углях и лучшими блюдами европейской кухни в спокойной, тёплой атмосфере.',
      reserveCta: 'Забронировать стол',
      menuCta: 'Смотреть меню',
      carouselLabel: 'Галерея фотографий ресторана',
      prevPhoto: 'Предыдущее фото',
      nextPhoto: 'Следующее фото',
      goToPhoto: (n) => `Перейти к фото ${n}`,
      metrics: {
        ratingLabelFallback: 'Рейтинг Яндекс Карты',
        ratingLabelGoogle: 'Рейтинг Google Карты',
        ratingDetailFallback: 'Оценка гостей Самарканда',
        ratingDetailGoogle: (c) => `На основе ${c} отзывов`,
        hallLabel: 'Семейный и банкетный зал',
        hallDetail: 'Есть отдельные VIP-комнаты',
        hoursValue: '09:00 – 23:00',
        hoursLabel: 'Открыто ежедневно',
        hoursDetail: 'Обеды, ужины и торжества',
        halalValue: '100% Халяль',
        halalLabel: 'Сертифицированная кухня',
        halalDetail: 'Узбекская и европейская кухня',
      },
    },
    menu: {
      eyebrow: 'Кухня и меню',
      title: 'Меню национальной и европейской кухни',
      subtitle:
        'Все блюда готовятся из свежих халяльных продуктов. Средний чек — от 50 000 до 150 000 сум.',
      reserveBtn: 'Забронировать стол',
      categories: {
        Barchasi: 'Все',
        'Milliy taomlar': 'Национальная кухня',
        'Kabob va mangal': 'Шашлык и мангал',
        'Yevropa oshxonasi': 'Европейская кухня',
        'Salat va ichimliklar': 'Салаты и напитки',
      },
      searchPlaceholder: 'Поиск по названию блюда...',
      emptyTitle: 'По вашему запросу ничего не найдено',
      emptySubtitle: 'Выберите другую категорию или очистите строку поиска.',
      resetBtn: 'Показать все блюда',
      chefPicksLabel: 'Выбор шефа · Популярные блюда',
    },
    halls: {
      eyebrow: 'Залы и банкеты',
      title: 'Комфортное пространство для семейных встреч и торжеств',
      subtitle:
        'От уютного семейного ужина до свадеб и юбилеев до 250 гостей — удобные столы, танцпол и отдельные VIP-залы к вашим услугам.',
      fallbackText: 'Семейные и банкетные залы вместимостью до 250 гостей',
      bookBtn: 'Забронировать',
    },
    reviews: {
      eyebrow: 'Отзывы гостей',
      title: 'Доверие жителей и гостей Самарканда',
    },
    location: {
      eyebrow: 'Адрес, карта и Instagram',
      heading: 'г. Самарканд, ул. Фархада, 31 / дом 42',
      landmarkPrefix: 'Ориентир',
      copyAddress: 'Скопировать адрес',
      copiedAddress: 'Адрес скопирован',
      openInMaps: 'Открыть в Google Maps',
      addressLabel: 'Адрес',
      phonesLabel: 'Телефоны',
      hoursServicesLabel: 'Время работы и удобства',
      refreshBtn: 'Обновить',
      mapFailedTitle: 'Интерактивная карта не загрузилась',
      mapFailedDesc:
        'Вы можете открыть точное местоположение ресторана (ул. Фархада, 31 / 42) прямо в приложении Google Maps.',
      getDirections: 'Построить маршрут',
      ratingPrefix: 'Рейтинг',
      reviewsUnit: 'отзывов',
      galleryTitle: 'Фотографии ресторана',
      galleryCount: (c) => `${c} реальных фото — нажмите для увеличения`,
      galleryFallbackSubtitle: 'Реальные фотографии ресторана из Google Maps',
      allPhotosLink: 'Все фото в Google Maps',
      sourcePrefix: 'Источник',
      emptyGalleryMsg: 'Чтобы увидеть фотографии в Google Maps, перейдите по ссылке ниже.',
      openGalleryPhotos: 'Открыть фото в Google Maps',
      enlargePhotoAria: (n) => `Увеличить фото (${n})`,
      closeAria: 'Закрыть',
      prevAria: 'Предыдущее фото',
      nextAria: 'Следующее фото',
    },
    reservation: {
      eyebrow: 'Бронирование столов и залов',
      title: 'Забронируйте стол или банкетный зал',
      subtitlePrefix: 'Заполните данные и нажмите «Забронировать» — заявка сразу откроется в Telegram ',
      subtitleMiddle: ', сохранится в базе ресторана и будет готова к отправке на ',
      subtitleSuffix: '.',
      quickContactTitle: 'Быстрая связь и бронь',
      savedBadge: 'Сохранено в базу',
      savingBadge: 'Сохранение...',
      fallbackBadge: 'Отправьте заявку через Telegram или Email',
      confirmedTitle: 'Заявка на бронь готова',
      confirmedSubtitle: (tg, email) =>
        `Ваша заявка направлена в Telegram @${tg} и подготовлена для отправки на ${email}.`,
      guestLabel: 'Гость',
      phoneLabel: 'Телефон',
      hallLabel: 'Выбранный зал',
      dateTimeGuestsLabel: 'Дата, время и гости',
      guestsUnit: 'чел.',
      emailPreviewLabel: 'Текст заявки на бронь',
      copyText: 'Копировать',
      copiedText: 'Скопировано',
      sendTelegramBtn: 'Отправить в Telegram',
      sendEmailBtn: 'Отправить на Email',
      newBookingBtn: 'Сделать новую бронь',
      chooseHallLabel: 'Выберите зал',
      dateLabel: 'Дата',
      guestsCountLabel: 'Количество гостей',
      decreaseGuestsAria: 'Уменьшить количество гостей',
      increaseGuestsAria: 'Увеличить количество гостей',
      arrivalTimeLabel: 'Время визита',
      nameLabel: 'Ваше имя',
      namePlaceholder: 'Например, Сардорбек',
      phoneInputLabel: 'Ваш телефон',
      notesLabel: 'Дополнительные пожелания (необязательно)',
      notesPlaceholder: 'Детский стульчик, оформление к дню рождения и т.д.',
      submitBtn: 'Забронировать',
      submitHint: (tg, email) =>
        `При нажатии откроется Telegram @${tg}, бронь сохранится в системе и подготовится письмо на ${email}.`,
      errName: 'Пожалуйста, введите ваше имя (минимум 2 символа).',
      errPhone: 'Пожалуйста, укажите действующий номер телефона.',
      errDate: 'Пожалуйста, выберите корректную дату.',
      errTime: 'Пожалуйста, выберите время визита.',
      msgGreeting: 'Здравствуйте! Хочу забронировать стол в семейном ресторане Tinchlik:',
      msgCode: 'Номер брони',
      msgHall: 'Зал',
      msgDate: 'Дата',
      msgTime: 'Время',
      msgGuests: 'Количество гостей',
      msgName: 'Имя',
      msgPhone: 'Телефон',
      msgNotes: 'Пожелания',
      mailSubjectPrefix: 'Бронирование стола',
    },
    footer: {
      menu: 'Меню',
      halls: 'Залы',
      reserve: 'Бронирование',
      map: 'Адрес и карта',
    },
    photoCaptions: [
      'Ресторан Tinchlik · Входная группа (Google Maps)',
      'Ресторан Tinchlik · Вечерняя подсветка (Google Maps)',
      'Интерьер основного семейного зала (Google Maps)',
      'Логотип Tinchlik в интерьере зала (Google Maps)',
      'Уютный зал с цветочным декором (Google Maps)',
      'Фасад ресторана Tinchlik (Google Maps)',
      'Фирменное мясное блюдо Tinchlik (Google Maps)',
      'Фирменный салат ресторана (Google Maps)',
      'Горячая закуска с соусами (Google Maps)',
      'Мясной салат со свежими овощами (Google Maps)',
    ],
    dishes: {
      'samarqand-osh': {
        name: 'Самаркандский зигир-плов',
        description:
          'Традиционный самаркандский плов, томлённый слоями в казане с жёлтой морковью, нутом, нежной говядиной и чесноком.',
        portion: '380 г',
        prepTime: '15 мин',
      },
      'komir-shashlik': {
        name: 'Ассорти шашлык на углях',
        description:
          'Сочные шампуры из баранины и говядины на углях саксаула с красным луком, сумахом и горячей тандырной лепёшкой.',
        portion: '450 г · 4 шампура',
        prepTime: '20 мин',
      },
      'uy-mantisi': {
        name: 'Домашние манты ручной лепки',
        description:
          'Тонкое тесто с рубленым мясом и луком на пару, подаётся со свежей сюзьмой и зеленью.',
        portion: '5 шт.',
        prepTime: '20 мин',
      },
      'ribay-steyk': {
        name: 'Стейк Рибай из мраморной говядины',
        description:
          'Сочный говяжий стейк, обжаренный с розмарином и чесноком, подаётся с запечённым картофелем и перечным соусом.',
        portion: '320 г',
        prepTime: '25 мин',
      },
      'qaynatma-shorva': {
        name: 'Кайнатма шурпа из баранины',
        description:
          'Прозрачный наваристый бульон долгого томления с крупной морковью, картофелем, нутом и свежей кинзой.',
        portion: '420 мл',
        prepTime: '12 мин',
      },
      'uygur-lagmon': {
        name: 'Тянутый лагман',
        description:
          'Домашняя лапша ручной работы с обжаренными овощами, болгарским перцем и ароматной мясной подливой.',
        portion: '400 г',
        prepTime: '18 мин',
      },
      'qiyma-kabob': {
        name: 'Самаркандский люля-кебаб',
        description:
          'Нежный рубленый шашлык со специями, подаётся с запечёнными на мангале томатами и луком.',
        portion: '1 шампур',
        prepTime: '15 мин',
      },
      'tovuq-shashlik': {
        name: 'Пряный куриный шашлык',
        description:
          'Филе куриного бедра, маринованное в катыке и паприке, обжаренное до золотистой корочки на углях.',
        portion: '1 шампур',
        prepTime: '15 мин',
      },
      'motsarella-pitsa': {
        name: 'Фирменная пицца Tinchlik',
        description:
          'Тонкое хрустящее тесто, халяль-колбаса, нежная моцарелла, оливки и томатный соус.',
        portion: '32 см',
        prepTime: '20 мин',
      },
      'imeruli-xachapuri': {
        name: 'Горячий хачапури',
        description:
          'Пышная выпечка из печи с тягучим расплавленным сыром сулугуни.',
        portion: '350 г',
        prepTime: '18 мин',
      },
      'achichuk-salat': {
        name: 'Свежий салат Ачичук',
        description:
          'Сладкие самаркандские томаты, тонко нарезанный лук, острый перчик и свежий базилик.',
        portion: '220 г',
        prepTime: '5 мин',
      },
      'sezar-salat': {
        name: 'Цезарь с курицей-гриль',
        description:
          'Хрустящие листья айсберга, куриное филе на гриле, пармезан, гренки и классический соус.',
        portion: '260 г',
        prepTime: '10 мин',
      },
      'kok-choy-limon': {
        name: 'Зелёный чай с лимоном (чайник)',
        description:
          'Свежезаваренный самаркандский зелёный чай высшего сорта с дольками лимона и мятой.',
        portion: '800 мл',
        prepTime: '5 мин',
      },
      'uy-kompot': {
        name: 'Домашний ягодный компот (графин)',
        description: 'Освежающий компот из вишни, абрикосов и айвы.',
        portion: '1 литр',
        prepTime: '5 мин',
      },
    },
    hallsData: {
      'oilaviy-zal': {
        title: 'Основной семейный зал',
        capacity: 'До 80 гостей',
        description:
          'Светлый и просторный зал для ежедневных обедов, семейных ужинов и тёплых встреч с близкими.',
        details: ['Удобные столы', 'Комфортно для семей с детьми', 'Быстрое обслуживание'],
      },
      'vip-xona': {
        title: 'Отдельные VIP-кабины',
        capacity: '8 – 24 гостя',
        description:
          'Закрытые уютные комнаты для приватных бесед, семейных дней рождения и деловых встреч.',
        details: ['Персональный официант', 'Отдельная аудиосистема', 'Бесплатный Wi-Fi'],
      },
      'banket-zali': {
        title: 'Большой банкетный зал',
        capacity: 'До 250 гостей',
        description:
          'Торжественно оформленный зал для свадеб, юбилеев, корпоративов и больших семейных мероприятий.',
        details: ['Танцпол', 'Специальное банкетное меню', 'Парковка'],
      },
    },
    reviewsData: [
      {
        id: 'rev-1',
        author: 'Дилшоджон Рахимов',
        visitContext: 'Семейный ужин · Самарканд',
        rating: '5.0 / 5',
        quote:
          'Самаркандский плов и шашлык на углях просто превосходные. Часто приходим всей семьёй — спокойно, вкусно и высокий уровень сервиса.',
      },
      {
        id: 'rev-2',
        author: 'Малика Каримова',
        visitContext: 'День рождения в VIP-зале',
        rating: '4.8 / 5',
        quote:
          'Одно из самых уютных семейных мест на улице Фархада. Детям нравится пицца и салаты, а взрослым — национальные блюда.',
      },
      {
        id: 'rev-3',
        author: 'Жасур Тошпулатов',
        visitContext: 'Банкет · 120 гостей',
        rating: '4.7 / 5',
        quote:
          'Зал просторный и красивый, блюда подали вовремя. Цены полностью соответствуют качеству.',
      },
    ],
  },

  en: {
    nav: {
      menu: 'Menu',
      halls: 'Halls',
      photos: 'Photos',
      address: 'Location',
      reserveBtn: 'Book a table',
      callLabel: 'Call',
      openMenu: 'Open navigation menu',
      closeMenu: 'Close navigation menu',
    },
    restaurant: {
      city: 'Samarkand',
      address: 'Farhod St, 31 / Bldg 42',
      fullName: 'Tinchlik Family Restaurant',
      landmark: 'Near Aziz Bazaar, School #7 & Emergency Management Dept.',
      hours: 'Daily · 09:00 – 23:00',
      averageCheck: '50,000 – 150,000 UZS',
      capacity: 'Up to 250 seats',
      ratingSource: 'Yandex Maps rating',
      amenities: ['Halal Kitchen', 'Free Wi-Fi', 'Parking', 'VIP Rooms'],
      currency: 'UZS',
    },
    hero: {
      headline: 'Samarkand hospitality and warm family dining',
      subtitle:
        'Located on Farhod Street, Tinchlik Family Restaurant serves authentic Uzbek dishes, charcoal-grilled shashlik, and selected European classics in a calm, welcoming atmosphere.',
      reserveCta: 'Book a table',
      menuCta: 'View menu',
      carouselLabel: 'Restaurant photo carousel',
      prevPhoto: 'Previous photo',
      nextPhoto: 'Next photo',
      goToPhoto: (n) => `Go to photo ${n}`,
      metrics: {
        ratingLabelFallback: 'Yandex Maps rating',
        ratingLabelGoogle: 'Google Maps rating',
        ratingDetailFallback: 'Rated by Samarkand guests',
        ratingDetailGoogle: (c) => `Based on ${c} verified reviews`,
        hallLabel: 'Family & banquet halls',
        hallDetail: 'Private VIP rooms available',
        hoursValue: '09:00 – 23:00',
        hoursLabel: 'Open every day',
        hoursDetail: 'Lunch, dinner & private events',
        halalValue: '100% Halal',
        halalLabel: 'Certified kitchen',
        halalDetail: 'Uzbek & European cuisine',
      },
    },
    menu: {
      eyebrow: 'Kitchen & Menu',
      title: 'National & European Cuisine Menu',
      subtitle:
        'All dishes are freshly prepared with certified halal ingredients. Average bill — 50,000 to 150,000 UZS.',
      reserveBtn: 'Book a table',
      categories: {
        Barchasi: 'All',
        'Milliy taomlar': 'National Dishes',
        'Kabob va mangal': 'Grill & Kebabs',
        'Yevropa oshxonasi': 'European Cuisine',
        'Salat va ichimliklar': 'Salads & Drinks',
      },
      searchPlaceholder: 'Search dish name...',
      emptyTitle: 'No dishes matched your search',
      emptySubtitle: 'Try selecting a different category or clearing the search box.',
      resetBtn: 'Show all dishes',
      chefPicksLabel: 'Chef’s Selection · Popular Dishes',
    },
    halls: {
      eyebrow: 'Halls & Events',
      title: 'A welcoming setting for family dinners and grand celebrations',
      subtitle:
        'From everyday family lunches to weddings and anniversaries for up to 250 guests — comfortable seating, a dance floor, and quiet private VIP rooms.',
      fallbackText: 'Family and banquet halls for up to 250 guests',
      bookBtn: 'Reserve',
    },
    reviews: {
      eyebrow: 'Guest Reviews',
      title: 'Trusted by Samarkand locals and travelers',
    },
    location: {
      eyebrow: 'Address, Map & Instagram',
      heading: 'Samarkand, Farhod Street, 31 / 42',
      landmarkPrefix: 'Landmark',
      copyAddress: 'Copy address',
      copiedAddress: 'Address copied',
      openInMaps: 'Open in Google Maps',
      addressLabel: 'Address',
      phonesLabel: 'Phone numbers',
      hoursServicesLabel: 'Opening hours & amenities',
      refreshBtn: 'Refresh',
      mapFailedTitle: 'Interactive map did not load',
      mapFailedDesc:
        'You can open our exact location (Farhod Street, 31 / 42, Samarkand) directly in Google Maps.',
      getDirections: 'Get directions',
      ratingPrefix: 'Rating',
      reviewsUnit: 'reviews',
      galleryTitle: 'Restaurant Photos',
      galleryCount: (c) => `${c} authentic photos — click to enlarge`,
      galleryFallbackSubtitle: 'Real photos from the restaurant’s Google Maps gallery',
      allPhotosLink: 'All photos on Google Maps',
      sourcePrefix: 'Source',
      emptyGalleryMsg: 'Open the link below to browse photos on Google Maps.',
      openGalleryPhotos: 'View photos on Google Maps',
      enlargePhotoAria: (n) => `Enlarge photo (${n})`,
      closeAria: 'Close',
      prevAria: 'Previous photo',
      nextAria: 'Next photo',
    },
    reservation: {
      eyebrow: 'Table & Hall Reservation',
      title: 'Reserve a table or banquet hall',
      subtitlePrefix: 'Fill in your details and press “Book a table” — your request opens directly in Telegram ',
      subtitleMiddle: ', is saved in our booking system, and is formatted to send to ',
      subtitleSuffix: '.',
      quickContactTitle: 'Direct Contact & Booking',
      savedBadge: 'Saved to booking system',
      savingBadge: 'Saving...',
      fallbackBadge: 'Send via Telegram or Email below',
      confirmedTitle: 'Your reservation request is ready',
      confirmedSubtitle: (tg, email) =>
        `Your request has been routed to Telegram @${tg} and prepared for sending to ${email}.`,
      guestLabel: 'Guest',
      phoneLabel: 'Phone',
      hallLabel: 'Selected hall',
      dateTimeGuestsLabel: 'Date, time & guests',
      guestsUnit: 'guests',
      emailPreviewLabel: 'Reservation summary',
      copyText: 'Copy',
      copiedText: 'Copied',
      sendTelegramBtn: 'Send via Telegram',
      sendEmailBtn: 'Send via Email',
      newBookingBtn: 'Make another booking',
      chooseHallLabel: 'Select hall type',
      dateLabel: 'Date',
      guestsCountLabel: 'Number of guests',
      decreaseGuestsAria: 'Decrease guest count',
      increaseGuestsAria: 'Increase guest count',
      arrivalTimeLabel: 'Arrival time',
      nameLabel: 'Your name',
      namePlaceholder: 'e.g., Sardorbek',
      phoneInputLabel: 'Phone number',
      notesLabel: 'Special requests (optional)',
      notesPlaceholder: 'Baby chair, birthday setup, or dietary preferences...',
      submitBtn: 'Book a table',
      submitHint: (tg, email) =>
        `Clicking submits your booking to our system, opens Telegram @${tg}, and prepares an email to ${email}.`,
      errName: 'Please enter your name (at least 2 characters).',
      errPhone: 'Please enter a valid contact phone number.',
      errDate: 'Please select a valid date.',
      errTime: 'Please select an arrival time.',
      msgGreeting: 'Hello! I would like to reserve a table at Tinchlik Family Restaurant:',
      msgCode: 'Booking Ref',
      msgHall: 'Hall',
      msgDate: 'Date',
      msgTime: 'Time',
      msgGuests: 'Guests',
      msgName: 'Name',
      msgPhone: 'Phone',
      msgNotes: 'Notes',
      mailSubjectPrefix: 'Table Reservation',
    },
    footer: {
      menu: 'Menu',
      halls: 'Halls',
      reserve: 'Reservation',
      map: 'Location & Map',
    },
    photoCaptions: [
      'Tinchlik Restaurant · Entrance (Google Maps)',
      'Tinchlik Restaurant · Evening exterior (Google Maps)',
      'Main family hall interior (Google Maps)',
      'Tinchlik golden emblem wall decor (Google Maps)',
      'Floral ceiling family dining hall (Google Maps)',
      'Tinchlik Restaurant facade (Google Maps)',
      'Signature slow-roasted lamb platter (Google Maps)',
      'Signature crispy beef salad (Google Maps)',
      'Warm cheese appetizer with sauces (Google Maps)',
      'Fresh vegetable & beef salad (Google Maps)',
    ],
    dishes: {
      'samarqand-osh': {
        name: 'Samarkand Zigir Plov',
        description:
          'Traditional Samarkand plov layered in a cast-iron kazan with yellow carrots, chickpeas, tender beef, and whole garlic.',
        portion: '380 g',
        prepTime: '15 min',
      },
      'komir-shashlik': {
        name: 'Assorted Charcoal Shashlik',
        description:
          'Skewers of tender lamb and beef grilled over saxaul embers, served with red onion, sumac, and hot tandoor bread.',
        portion: '450 g · 4 skewers',
        prepTime: '20 min',
      },
      'uy-mantisi': {
        name: 'Handmade Steamed Manti',
        description:
          'Thin hand-rolled dumplings filled with finely chopped beef and onion, steamed and served with suzma yogurt and herbs.',
        portion: '5 pcs',
        prepTime: '20 min',
      },
      'ribay-steyk': {
        name: 'Marbled Ribeye Steak',
        description:
          'Juicy beef ribeye seared with rosemary and garlic, accompanied by roasted potatoes and black pepper sauce.',
        portion: '320 g',
        prepTime: '25 min',
      },
      'qaynatma-shorva': {
        name: 'Slow-Simmered Lamb Shurpa',
        description:
          'Clear aromatic lamb broth simmered slowly with chunky carrots, potatoes, chickpeas, and fresh cilantro.',
        portion: '420 ml',
        prepTime: '12 min',
      },
      'uygur-lagmon': {
        name: 'Hand-Pulled Lagman',
        description:
          'Fresh hand-stretched noodles topped with stir-fried bell peppers, vegetables, and rich savory beef sauce.',
        portion: '400 g',
        prepTime: '18 min',
      },
      'qiyma-kabob': {
        name: 'Samarkand Minced Kebab',
        description:
          'Spiced minced meat kebab grilled over open coals, served with blistered tomatoes and sliced onion.',
        portion: '1 skewer',
        prepTime: '15 min',
      },
      'tovuq-shashlik': {
        name: 'Spiced Chicken Shashlik',
        description:
          'Chicken fillet marinated in yogurt and paprika, flame-grilled to a golden finish.',
        portion: '1 skewer',
        prepTime: '15 min',
      },
      'motsarella-pitsa': {
        name: 'Tinchlik Special Pizza',
        description:
          'Crisp thin-crust pizza topped with halal sausage, mozzarella cheese, olives, and rich tomato sauce.',
        portion: '32 cm',
        prepTime: '20 min',
      },
      'imeruli-xachapuri': {
        name: 'Oven-Baked Khachapuri',
        description:
          'Warm tandoor-baked flatbread filled with melted suluguni cheese.',
        portion: '350 g',
        prepTime: '18 min',
      },
      'achichuk-salat': {
        name: 'Fresh Achichuk Salad',
        description:
          'Sweet Samarkand tomatoes thinly sliced with sweet onion, chili pepper, and fresh basil.',
        portion: '220 g',
        prepTime: '5 min',
      },
      'sezar-salat': {
        name: 'Grilled Chicken Caesar',
        description:
          'Crisp iceberg lettuce, grilled chicken breast, shaved parmesan, croutons, and classic Caesar dressing.',
        portion: '260 g',
        prepTime: '10 min',
      },
      'kok-choy-limon': {
        name: 'Green Tea with Lemon (Pot)',
        description:
          'Premium Samarkand green tea brewed in a porcelain pot with fresh lemon slices and mint.',
        portion: '800 ml',
        prepTime: '5 min',
      },
      'uy-kompot': {
        name: 'Homemade Fruit Compote (Carafe)',
        description: 'Chilled house compote made with sour cherries, apricots, and quince.',
        portion: '1 liter',
        prepTime: '5 min',
      },
    },
    hallsData: {
      'oilaviy-zal': {
        title: 'Main Family Hall',
        capacity: 'Up to 80 guests',
        description:
          'Bright and spacious dining hall suited for daily lunches, family dinners, and friendly gatherings.',
        details: ['Comfortable wooden tables', 'Family-friendly atmosphere', 'Attentive service'],
      },
      'vip-xona': {
        title: 'Private VIP Rooms',
        capacity: '8 – 24 guests',
        description:
          'Enclosed cozy rooms designed for private conversations, family birthdays, and business meetings.',
        details: ['Dedicated waiter', 'Private sound system', 'Free Wi-Fi'],
      },
      'banket-zali': {
        title: 'Grand Banquet Hall',
        capacity: 'Up to 250 guests',
        description:
          'Festive ceremonial hall tailored for weddings, anniversaries, corporate banquets, and large family events.',
        details: ['Dance floor', 'Custom banquet menu', 'Guest parking'],
      },
    },
    reviewsData: [
      {
        id: 'rev-1',
        author: 'Dilshodjon Rahimov',
        visitContext: 'Family dinner · Samarkand',
        rating: '5.0 / 5',
        quote:
          'Their Samarkand plov and charcoal shashlik are outstanding. We visit with our family often — peaceful atmosphere and attentive service.',
      },
      {
        id: 'rev-2',
        author: 'Malika Karimova',
        visitContext: 'Birthday in a VIP room',
        rating: '4.8 / 5',
        quote:
          'One of the coziest family spots on Farhod Street. Having both Uzbek classics and pizza/salads makes it ideal when dining with kids.',
      },
      {
        id: 'rev-3',
        author: 'Jasur Toshpulatov',
        visitContext: 'Banquet event · 120 guests',
        rating: '4.7 / 5',
        quote:
          'Spacious, clean hall and every course was served right on schedule. Great value for the quality.',
      },
    ],
  },
};
