import { RESTAURANT_INFO } from '../data/restaurantData';
import { TinchlikLogo } from './TinchlikLogo';

export function Footer() {
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
              {RESTAURANT_INFO.city} · {RESTAURANT_INFO.address} · {RESTAURANT_INFO.hours}
            </p>
          </div>
        </div>

        <nav
          aria-label="Pastki navigatsiya"
          className="flex flex-wrap items-center gap-6 text-xs font-medium text-stone-600"
        >
          <a href="#menyu" className="hover:text-stone-900 transition-colors">
            Menyu
          </a>
          <a href="#zallar" className="hover:text-stone-900 transition-colors">
            Zallar
          </a>
          <a href="#bron" className="hover:text-stone-900 transition-colors">
            Stol band qilish
          </a>
          <a href="#manzil" className="hover:text-stone-900 transition-colors">
            Manzil va xarita
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
          © {new Date().getFullYear()} {RESTAURANT_INFO.fullName}
        </p>
      </div>
    </footer>
  );
}
