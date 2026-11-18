import { RESTAURANT_INFO } from '../data/restaurantData';
import { useLanguage } from '../context/LanguageContext';
import { TRANSLATIONS } from '../data/translations';
import { TinchlikLogo } from './TinchlikLogo';

export function Footer() {
  const { lang } = useLanguage();
  const t = TRANSLATIONS[lang];

  return (
    <footer className="bg-[#f8f9f8] border-t border-stone-200 py-10">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <TinchlikLogo className="w-14 h-14 sm:w-16 sm:h-16 shrink-0" />
          <div>
            <a
              href="#"
              className="font-display text-2xl font-semibold text-stone-900 leading-none"
            >
              {RESTAURANT_INFO.name}
            </a>
            <p className="mt-1 text-xs text-stone-500">
              {t.restaurant.city} · {t.restaurant.address} · {t.restaurant.hours}
            </p>
          </div>
        </div>

        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center gap-6 text-xs font-medium text-stone-600"
        >
          <a href="#menyu" className="hover:text-stone-900 transition-colors">
            {t.footer.menu}
          </a>
          <a href="#zallar" className="hover:text-stone-900 transition-colors">
            {t.footer.halls}
          </a>
          <a href="#bron" className="hover:text-stone-900 transition-colors">
            {t.footer.reserve}
          </a>
          <a href="#manzil" className="hover:text-stone-900 transition-colors">
            {t.footer.map}
          </a>
          <a
            href={RESTAURANT_INFO.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-stone-900 transition-colors"
          >
            Instagram
          </a>
        </nav>

        <p className="text-xs text-stone-500">
          © {new Date().getFullYear()} {t.restaurant.fullName}
        </p>
      </div>
    </footer>
  );
}
