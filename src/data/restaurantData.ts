export type MenuCategory =
  | 'Barchasi'
  | 'Milliy taomlar'
  | 'Kabob va mangal'
  | 'Yevropa oshxonasi'
  | 'Salat va ichimliklar';

export interface DishItem {
  id: string;
  name: string;
  category: Exclude<MenuCategory, 'Barchasi'>;
  description: string;
  price: number;
  portion: string;
  prepTime: string;
  image?: string;
  featured?: boolean;
}

export interface HallOption {
  id: string;
  number: string;
  title: string;
  capacity: string;
  description: string;
  details: string[];
}

export interface GuestReview {
  id: string;
  author: string;
  visitContext: string;
  rating: string;
  quote: string;
}

export const RESTAURANT_INFO = {
  name: 'Tinchlik',
  fullName: 'Tinchlik Oilaviy Restorani',
  city: 'Samarqand shahri',
  address: 'Farhod ko‘chasi, 31 / 42-uy',
  landmark: 'Aziz bozori, 7-maktab va Favqulodda vaziyatlar boshqarmasi yaqinida',
  instagramHandle: '@tinchlik_restaurant_samarqand',
  instagramUrl: 'https://www.instagram.com/tinchlik_restaurant_samarqand/',
  logoSrc:
    '/assets/aistudio/772663878_17962044918168521_5018536621947110371_n_8365f95c.jpg',
  phones: [
    { display: '+998 88 222 08 88', href: 'tel:+998882220888' },
    { display: '+998 91 527 77 74', href: 'tel:+998915277774' },
  ],
  email: 'mr1sardor0130@gmail.com',
  telegramUsername: 'Aligulyamov',
  telegramUrl: 'https://t.me/Aligulyamov',
  telegramPhoneUrl: 'https://t.me/Aligulyamov',
  hours: 'Har kuni · 09:00 – 23:00',
  averageCheck: '50 000 – 150 000 so‘m',
  rating: '4.7 / 5.0',
  ratingSource: 'Yandex Maps bahosi',
  capacity: '250 o‘ringacha',
  amenities: ['Halol oshxona', 'Bepul Wi-Fi', 'Avtoturargoh', 'VIP xonalar'],
  mapsUrl: 'https://maps.app.goo.gl/UHowx8ixeJ3svLaL8',
  mapsAlbumUrl: 'https://maps.app.goo.gl/74R1wjgZLDTzPpaR6',
};

export interface LocalRestaurantPhoto {
  uri: string;
  thumbUri: string;
  authorName: string;
  authorUri?: string;
}

const MAPS_ALBUM_LINK = 'https://maps.app.goo.gl/74R1wjgZLDTzPpaR6';

export const LOCAL_RESTAURANT_PHOTOS: LocalRestaurantPhoto[] = [
  {
    uri: '/assets/photos/tinchlik-real-1.jpg',
    thumbUri: '/assets/photos/tinchlik-real-1.jpg',
    authorName: 'Tinchlik Restorani · Kirish qismi (Google Maps)',
    authorUri: MAPS_ALBUM_LINK,
  },
  {
    uri: '/assets/photos/tinchlik-real-6.jpg',
    thumbUri: '/assets/photos/tinchlik-real-6.jpg',
    authorName: 'Tinchlik Restorani · Kechki ko‘rinish (Google Maps)',
    authorUri: MAPS_ALBUM_LINK,
  },
  {
    uri: '/assets/photos/tinchlik-real-16.jpg',
    thumbUri: '/assets/photos/tinchlik-real-16.jpg',
    authorName: 'Asosiy oilaviy zal interyeri (Google Maps)',
    authorUri: MAPS_ALBUM_LINK,
  },
  {
    uri: '/assets/photos/tinchlik-real-13.jpg',
    thumbUri: '/assets/photos/tinchlik-real-13.jpg',
    authorName: 'Restoran ichki bezagi va Tinchlik ramzi (Google Maps)',
    authorUri: MAPS_ALBUM_LINK,
  },
  {
    uri: '/assets/photos/tinchlik-real-10.jpg',
    thumbUri: '/assets/photos/tinchlik-real-10.jpg',
    authorName: 'Gullar bilan bezatilgan shinam zal (Google Maps)',
    authorUri: MAPS_ALBUM_LINK,
  },
  {
    uri: '/assets/photos/tinchlik-real-2.jpg',
    thumbUri: '/assets/photos/tinchlik-real-2.jpg',
    authorName: 'Tinchlik Restorani fasadi (Google Maps)',
    authorUri: MAPS_ALBUM_LINK,
  },
  {
    uri: '/assets/photos/tinchlik-real-4.jpg',
    thumbUri: '/assets/photos/tinchlik-real-4.jpg',
    authorName: 'Tinchlik maxsus go‘shtli taomi (Google Maps)',
    authorUri: MAPS_ALBUM_LINK,
  },
  {
    uri: '/assets/photos/tinchlik-real-12.jpg',
    thumbUri: '/assets/photos/tinchlik-real-12.jpg',
    authorName: 'Restoran maxsus salati (Google Maps)',
    authorUri: MAPS_ALBUM_LINK,
  },
  {
    uri: '/assets/photos/tinchlik-real-17.jpg',
    thumbUri: '/assets/photos/tinchlik-real-17.jpg',
    authorName: 'Issiq gazak va souslar (Google Maps)',
    authorUri: MAPS_ALBUM_LINK,
  },
  {
    uri: '/assets/photos/tinchlik-real-5.jpg',
    thumbUri: '/assets/photos/tinchlik-real-5.jpg',
    authorName: 'Go‘shtli sabzavotli salat (Google Maps)',
    authorUri: MAPS_ALBUM_LINK,
  },
];

export const MENU_CATEGORIES: MenuCategory[] = [
  'Barchasi',
  'Milliy taomlar',
  'Kabob va mangal',
  'Yevropa oshxonasi',
  'Salat va ichimliklar',
];

export const DISHES: DishItem[] = [
  {
    id: 'samarqand-osh',
    name: 'Samarqandcha zig‘ir osh',
    category: 'Milliy taomlar',
    description:
      'An’anaviy qozonda alohida qatlamlab damlangan Samarqand palovi: sariq sabzi, no‘xat, mayin mol go‘shti va sarimsoq bilan.',
    price: 48000,
    portion: '380 g',
    prepTime: '15 daqiqa',
    image: '/assets/photos/plov-bowl.jpg',
    featured: true,
  },
  {
    id: 'komir-shashlik',
    name: 'Assorti ko‘mir shashlik',
    category: 'Kabob va mangal',
    description:
      'Saksovul cho‘g‘ida pishirilgan qo‘y va mol go‘shti sixlari, qizil piyoz, sumax va tandirda yopilgan issiq non bilan.',
    price: 92000,
    portion: '450 g · 4 six',
    prepTime: '20 daqiqa',
    image: '/assets/photos/shashlik.jpg',
    featured: true,
  },
  {
    id: 'uy-mantisi',
    name: 'Qo‘lda tugilgan manti',
    category: 'Milliy taomlar',
    description:
      'Yupqa xamir ichida mayda to‘g‘ralgan go‘sht va piyoz, bug‘da pishirilib suzma hamda ko‘katlar bilan tortiladi.',
    price: 42000,
    portion: '5 dona',
    prepTime: '20 daqiqa',
    image: '/assets/photos/manti.jpg',
    featured: true,
  },
  {
    id: 'ribay-steyk',
    name: 'Marmar go‘shtli Ribay steyk',
    category: 'Yevropa oshxonasi',
    description:
      'Rozmarin va sarimsoq bilan qovurilgan suvli mol go‘shti steyki, pishirilgan kartoshka va murchli sous hamrohligida.',
    price: 135000,
    portion: '320 g',
    prepTime: '25 daqiqa',
    image: '/assets/photos/ribeye.jpg',
    featured: true,
  },
  {
    id: 'qaynatma-shorva',
    name: 'Qo‘y go‘shtidan qaynatma sho‘rva',
    category: 'Milliy taomlar',
    description:
      'Past olovda uzoq qaynatilgan tiniq bulyon, yirik sabzi, kartoshka, no‘xat va yangi kashnich.',
    price: 38000,
    portion: '420 ml',
    prepTime: '12 daqiqa',
    image: '/assets/photos/shorva.jpg',
  },
  {
    id: 'uygur-lagmon',
    name: 'Cho‘zma lag‘mon',
    category: 'Milliy taomlar',
    description:
      'Qo‘lda cho‘zilgan lag‘mon xamiri, qovurilgan sabzavotlar, bolgar qalampiri va xushbo‘y go‘shtli qayla.',
    price: 44000,
    portion: '400 g',
    prepTime: '18 daqiqa',
    image: '/assets/photos/lagman.jpg',
  },
  {
    id: 'qiyma-kabob',
    name: 'Samarqandcha qiyma kabob',
    category: 'Kabob va mangal',
    description:
      'Ziravorlar bilan to‘yintirilgan mayin qiyma kabob, ko‘mirda qizartirilgan pomidor va piyoz bilan.',
    price: 26000,
    portion: '1 six',
    prepTime: '15 daqiqa',
    image: '/assets/photos/qiyma-kabob.jpg',
  },
  {
    id: 'tovuq-shashlik',
    name: 'Ziravorli tovuq soni shashligi',
    category: 'Kabob va mangal',
    description:
      'Qatiq va paprika marinadida yumshatilgan tovuq filesi, mangalda oltin rangda pishirilgan.',
    price: 28000,
    portion: '1 six',
    prepTime: '15 daqiqa',
    image: '/assets/photos/tovuq-shashlik.jpg',
  },
  {
    id: 'motsarella-pitsa',
    name: 'Tinchlik maxsus pitsasi',
    category: 'Yevropa oshxonasi',
    description:
      'Yupqa xamirda pishirilgan halol kolbasa, motsarella pishlog‘i, zaytun va xushbo‘y pomidor sousi.',
    price: 78000,
    portion: '32 sm',
    prepTime: '20 daqiqa',
    image: '/assets/photos/pizza.jpg',
  },
  {
    id: 'imeruli-xachapuri',
    name: 'Issiq xachapuri',
    category: 'Yevropa oshxonasi',
    description:
      'Tandirda qizargan yumshoq xamir va eritilgan suluguni pishlog‘i uyg‘unligi.',
    price: 54000,
    portion: '350 g',
    prepTime: '18 daqiqa',
    image: '/assets/photos/khachapuri.jpg',
  },
  {
    id: 'achichuk-salat',
    name: 'Yangi uzilgan achichuk',
    category: 'Salat va ichimliklar',
    description:
      'Samarqandning shirin pomidorlari, yupqa to‘g‘ralgan piyoz, achchiq qalampir va rayhon.',
    price: 18000,
    portion: '220 g',
    prepTime: '5 daqiqa',
    image: '/assets/photos/achichuk.jpg',
  },
  {
    id: 'sezar-salat',
    name: 'Grilda pishgan tovuqli Sezar',
    category: 'Salat va ichimliklar',
    description:
      'Qarsildoq aysberg barglari, gril tovuq filesi, parmezan qirindisi, suxarik va klassik sous.',
    price: 46000,
    portion: '260 g',
    prepTime: '10 daqiqa',
    image: '/assets/photos/caesar.jpg',
  },
  {
    id: 'kok-choy-limon',
    name: 'Limonli ko‘k choy (choynak)',
    category: 'Salat va ichimliklar',
    description:
      'Samarqandcha damlangan oliy navli ko‘k choy, yangi limon bo‘laklari va yalpiz bilan.',
    price: 15000,
    portion: '800 ml',
    prepTime: '5 daqiqa',
    image: '/assets/photos/green-tea.jpg',
  },
  {
    id: 'uy-kompot',
    name: 'Mevazor sharbati (grafin)',
    category: 'Salat va ichimliklar',
    description: 'Olcha, o‘rik va behidan tayyorlangan salqin uy kompoti.',
    price: 22000,
    portion: '1 litr',
    prepTime: '5 daqiqa',
    image: '/assets/photos/kompot.jpg',
  },
];

export const HALL_OPTIONS: HallOption[] = [
  {
    id: 'oilaviy-zal',
    number: '01',
    title: 'Asosiy Oilaviy Zal',
    capacity: '80 nafargacha mehmon',
    description:
      'Kundalik tushliklar, oilaviy kechki ovqatlar va do‘stona uchrashuvlar uchun yorug‘ hamda keng zal.',
    details: ['Qulay yog‘och stollar', 'Bolalar uchun qulay muhit', 'Tezkor xizmat'],
  },
  {
    id: 'vip-xona',
    number: '02',
    title: 'Alohida VIP Xonalar',
    capacity: '8 – 24 nafar mehmon',
    description:
      'Sokin suhbatlar, oilaviy tug‘ilgan kunlar va ishbilarmonlik uchrashuvlari uchun yopiq shinam xonalar.',
    details: ['Shaxsiy ofitsiant xizmati', 'Alohida ovoz tizimi', 'Bepul Wi-Fi'],
  },
  {
    id: 'banket-zali',
    number: '03',
    title: 'Katta Banket Zali',
    capacity: '250 nafargacha mehmon',
    description:
      'To‘y, yubiley, korporativ kechalar va katta oilaviy marosimlar uchun bezatilgan tantanavor zal.',
    details: ['Raqs maydonchasi', 'Maxsus banket menyusi', 'Avtoturargoh'],
  },
];

export const GUEST_REVIEWS: GuestReview[] = [
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
];

export function formatUZS(amount: number): string {
  return `${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so‘m`;
}
