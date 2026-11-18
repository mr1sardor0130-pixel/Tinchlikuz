import { useState } from 'react';
import { Menu, Phone, X } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/restaurantData';
import { useGooglePlace } from '../context/GooglePlaceContext';
import { TinchlikLogo } from './TinchlikLogo';

interface HeaderProps {
  onReserveClick: () => void;
}

const NAV_LINKS = [
  { href: '#menyu', label: 'Menyu' },
  { href: '#zallar', label: 'Zallar' },
  { href: '#galereya', label: 'Rasmlar' },
  { href: '#manzil', label: 'Manzil' },
];

export function Header({ onReserveClick }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { place, allPhotos } = useGooglePlace();
  const navPhotos = allPhotos;

  const handleMobileNav = (href: string) => {
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    target?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-[#141a17] border-b border-stone-800 overflow-hidden">
      {navPhotos.length > 0 && (
        <div
          aria-hidden="true"
          className="absolute inset-0 flex w-full h-full pointer-events-none select-none overflow-hidden"
        >
          {navPhotos.map((photo, index) => (
            <div
              key={`${place?.id || 'nav'}-bg-${index}`}
              className="flex-1 min-w-[72px] sm:min-w-[110px] h-full overflow-hidden border-r border-black/25 last:border-r-0"
            >
              <img
                src={photo.thumbUri}
                alt=""
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover scale-105 opacity-90"
              />
            </div>
          ))}
        </div>
      )}

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-stone-950/75 via-stone-950/50 to-stone-950/75 pointer-events-none"
      />

      <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4 sm:gap-8">
        <a
          href="#"
          className="inline-flex items-center gap-2.5 sm:gap-3 font-display text-2xl sm:text-[26px] font-semibold tracking-tight text-white drop-shadow-xs whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-400"
        >
          <TinchlikLogo className="w-11 h-11 sm:w-14 sm:h-14 border-white/30" />
          <span>Tinchlik</span>
        </a>

        <nav
          aria-label="Asosiy navigatsiya"
          className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-100"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-white hover:underline underline-offset-4 decoration-emerald-400 transition-colors duration-150 whitespace-nowrap shrink-0 py-1 drop-shadow-xs focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-400"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={onReserveClick}
            className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 min-h-[44px] text-sm font-medium text-white bg-[#115E46] hover:bg-[#0D4A37] border border-white/20 rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
          >
            Stol band qilish
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Menyuni yopish' : 'Navigatsiya menyusini ochish'}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg text-white bg-black/30 hover:bg-black/50 border border-white/15 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-400"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="relative z-10 md:hidden border-t border-white/15 bg-[#141a17]/95 backdrop-blur-md px-4 py-4 space-y-1.5">
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              type="button"
              onClick={() => handleMobileNav(link.href)}
              className="flex items-center w-full text-left px-4 min-h-[48px] text-base font-medium text-stone-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              {link.label}
            </button>
          ))}
          <a
            href={RESTAURANT_INFO.phones[0].href}
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 w-full px-4 min-h-[48px] text-base font-medium text-emerald-300 hover:bg-white/10 rounded-lg transition-colors tabular-nums"
          >
            <Phone className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Qo‘ng‘iroq: {RESTAURANT_INFO.phones[0].display}</span>
          </a>
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onReserveClick();
            }}
            className="w-full mt-2 px-4 min-h-[48px] text-base font-medium text-white bg-[#115E46] hover:bg-[#0D4A37] rounded-lg transition-colors"
          >
            Stol band qilish
          </button>
        </div>
      )}
    </header>
  );
}
