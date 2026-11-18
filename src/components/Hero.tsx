import { useEffect, useRef, useState, type TouchEvent } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/restaurantData';
import { useGooglePlace } from '../context/GooglePlaceContext';
import { useLanguage } from '../context/LanguageContext';
import { TRANSLATIONS } from '../data/translations';
import { TinchlikLogo } from './TinchlikLogo';

interface HeroProps {
  onReserveClick: () => void;
}

export function Hero({ onReserveClick }: HeroProps) {
  const { place, allPhotos } = useGooglePlace();
  const { lang } = useLanguage();
  const t = TRANSLATIONS[lang];

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const slideCount = allPhotos.length;

  useEffect(() => {
    if (activeIndex >= slideCount && slideCount > 0) {
      setActiveIndex(0);
    }
  }, [activeIndex, slideCount]);

  useEffect(() => {
    if (slideCount <= 1 || isPaused) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slideCount);
    }, 5200);

    return () => window.clearInterval(timer);
  }, [slideCount, isPaused]);

  const handlePrev = () => {
    if (slideCount <= 1) return;
    setActiveIndex((prev) => (prev - 1 + slideCount) % slideCount);
  };

  const handleNext = () => {
    if (slideCount <= 1) return;
    setActiveIndex((prev) => (prev + 1) % slideCount);
  };

  const handleTouchStart = (e: TouchEvent<HTMLElement>) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: TouchEvent<HTMLElement>) => {
    if (touchStartX.current === null || slideCount <= 1) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(delta) > 40) {
      if (delta < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  const heroMetrics = [
    {
      value: place?.rating
        ? `${place.rating.toFixed(1)} / 5.0`
        : RESTAURANT_INFO.rating,
      label: place?.rating
        ? t.hero.metrics.ratingLabelGoogle
        : t.hero.metrics.ratingLabelFallback,
      detail: place?.userRatingCount
        ? t.hero.metrics.ratingDetailGoogle(place.userRatingCount)
        : t.hero.metrics.ratingDetailFallback,
    },
    {
      value: t.restaurant.capacity,
      label: t.hero.metrics.hallLabel,
      detail: t.hero.metrics.hallDetail,
    },
    {
      value: t.hero.metrics.hoursValue,
      label: t.hero.metrics.hoursLabel,
      detail: t.hero.metrics.hoursDetail,
    },
    {
      value: t.hero.metrics.halalValue,
      label: t.hero.metrics.halalLabel,
      detail: t.hero.metrics.halalDetail,
    },
  ];

  const activeCaption =
    t.photoCaptions[activeIndex] ||
    allPhotos[activeIndex]?.authorName ||
    t.restaurant.fullName;

  return (
    <section className="border-b border-stone-200 bg-white">
      <div
        className="relative overflow-hidden bg-[#121815] text-white"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-roledescription={slideCount > 1 ? 'carousel' : undefined}
        aria-label={t.hero.carouselLabel}
      >
        <div className="absolute inset-0 z-0 pointer-events-none select-none">
          {slideCount > 0 ? (
            allPhotos.map((photo, index) => {
              const isActive = index === activeIndex;
              return (
                <img
                  key={`${photo.uri}-${index}`}
                  src={photo.uri}
                  alt=""
                  referrerPolicy="no-referrer"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out ${
                    isActive
                      ? 'opacity-100 scale-100'
                      : 'opacity-0 scale-[1.03]'
                  }`}
                />
              );
            })
          ) : (
            <div className="w-full h-full bg-[#121815] bg-[radial-gradient(ellipse_at_top_right,rgba(17,94,70,0.42),transparent_62%)]" />
          )}

          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-[#0b100d]/85 via-[#0b100d]/62 to-[#0b100d]/30"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[#0b100d]/78 via-transparent to-[#0b100d]/35"
          />
        </div>

        <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24 min-h-[460px] sm:min-h-[520px] flex flex-col justify-between">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="md:col-span-7 max-w-2xl">
              <div className="text-xs sm:text-sm text-stone-200 tracking-wide leading-relaxed mb-5">
                <p className="font-medium text-emerald-300">
                  <span>{t.restaurant.city}</span>
                  <span aria-hidden="true" className="mx-2 text-white/35">
                    ·
                  </span>
                  <span>{t.restaurant.address}</span>
                </p>
                <p className="text-white font-semibold mt-0.5 text-sm sm:text-base">
                  {t.restaurant.fullName}
                </p>
              </div>

              <h1 className="font-display font-semibold text-white text-[clamp(2.25rem,4.4vw,3.9rem)] leading-[1.07] tracking-tight text-balance drop-shadow-sm">
                {t.hero.headline}
              </h1>

              <p className="mt-4 sm:mt-5 text-base sm:text-lg text-stone-200 leading-relaxed max-w-[56ch]">
                {t.hero.subtitle}
              </p>

              <div className="mt-7 sm:mt-9 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-5">
                <button
                  type="button"
                  onClick={onReserveClick}
                  className="inline-flex items-center justify-center gap-2 px-6 min-h-[48px] text-sm font-medium text-white bg-[#115E46] hover:bg-[#0D4A37] border border-white/20 rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
                >
                  <span>{t.hero.reserveCta}</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>

                <a
                  href="#menyu"
                  className="inline-flex items-center justify-center min-h-[48px] px-5 text-sm font-medium text-white bg-white/10 hover:bg-white/18 border border-white/25 backdrop-blur-xs rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
                >
                  {t.hero.menuCta}
                </a>
              </div>
            </div>

            <div className="md:col-span-5 flex justify-end items-center">
              <TinchlikLogo className="w-40 h-40 sm:w-52 sm:h-52 md:w-60 md:h-60 lg:w-72 lg:h-72 border-2 border-white/40 shadow-2xl" />
            </div>
          </div>

          {slideCount > 0 && (
            <div className="mt-8 pt-5 border-t border-white/15 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-xs text-stone-200">
                <span className="tabular-nums font-medium text-white">
                  {activeIndex + 1} / {slideCount}
                </span>
                <span className="text-white/40" aria-hidden="true">
                  ·
                </span>
                <span className="truncate max-w-[220px] sm:max-w-xs">
                  {activeCaption}
                </span>
              </div>

              {slideCount > 1 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 mr-1">
                    {allPhotos.map((_, idx) => (
                      <button
                        key={`dot-${idx}`}
                        type="button"
                        onClick={() => setActiveIndex(idx)}
                        aria-label={t.hero.goToPhoto(idx + 1)}
                        aria-current={idx === activeIndex ? 'true' : undefined}
                        className="p-2 cursor-pointer group"
                      >
                        <span
                          className={`block h-1.5 rounded-full transition-all duration-200 ${
                            idx === activeIndex
                              ? 'w-6 bg-white'
                              : 'w-2 bg-white/40 group-hover:bg-white/70'
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label={t.hero.prevPhoto}
                    className="w-11 h-11 rounded-lg bg-black/45 hover:bg-black/70 border border-white/20 text-white inline-flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label={t.hero.nextPhoto}
                    className="w-11 h-11 rounded-lg bg-black/45 hover:bg-black/70 border border-white/20 text-white inline-flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-8">
        {heroMetrics.map((metric) => (
          <div key={metric.label} className="space-y-1">
            <p className="text-lg sm:text-xl font-semibold text-stone-900 tabular-nums">
              {metric.value}
            </p>
            <p className="text-xs sm:text-sm font-medium text-stone-800">
              {metric.label}
            </p>
            <p className="text-[11px] sm:text-xs text-stone-500">{metric.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
