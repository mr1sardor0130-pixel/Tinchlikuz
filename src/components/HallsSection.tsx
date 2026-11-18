import { ArrowRight } from 'lucide-react';
import { HALL_OPTIONS } from '../data/restaurantData';
import { useGooglePlace } from '../context/GooglePlaceContext';
import { useLanguage } from '../context/LanguageContext';
import { TRANSLATIONS } from '../data/translations';
import { ResilientImage } from './ResilientImage';
import { TinchlikLogo } from './TinchlikLogo';

interface HallsSectionProps {
  onSelectHall: (hallId: string) => void;
}

export function HallsSection({ onSelectHall }: HallsSectionProps) {
  const { place, isLoading, allPhotos } = useGooglePlace();
  const { lang } = useLanguage();
  const t = TRANSLATIONS[lang];
  const hallPhoto = allPhotos[2] || allPhotos[1] || allPhotos[0];
  const hallCaption = t.photoCaptions[2] || hallPhoto?.authorName || '';

  return (
    <section id="zallar" className="py-12 sm:py-16 lg:py-20 bg-white border-y border-stone-200">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              <p className="text-xs font-medium text-[#115E46] tracking-wide mb-2">
                {t.halls.eyebrow}
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-stone-900 tracking-tight text-balance">
                {t.halls.title}
              </h2>
              <p className="mt-3 text-sm sm:text-base text-stone-600 leading-relaxed max-w-[54ch]">
                {t.halls.subtitle}
              </p>
            </div>

            <div className="mt-6 sm:mt-8 relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-stone-200 bg-stone-100">
              {isLoading && !hallPhoto ? (
                <div className="w-full h-full bg-stone-200/70 animate-pulse" />
              ) : hallPhoto ? (
                <>
                  <ResilientImage
                    src={hallPhoto.uri}
                    alt={`${place?.displayName || t.restaurant.fullName} — ${t.halls.eyebrow}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent px-4 py-2.5 text-[11px] text-white/90 truncate">
                    {hallCaption}
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-stone-50 gap-3">
                  <TinchlikLogo className="w-16 h-16" />
                  <p className="text-xs text-stone-600">
                    {t.halls.fallbackText}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-6 divide-y divide-stone-200 border-t lg:border-t-0 border-stone-200 flex flex-col justify-between">
            {HALL_OPTIONS.map((hall) => {
              const tr = t.hallsData[hall.id];
              const title = tr?.title || hall.title;
              const capacity = tr?.capacity || hall.capacity;
              const description = tr?.description || hall.description;
              const details = tr?.details || hall.details;

              return (
                <div key={hall.id} className="py-5 sm:py-6 first:pt-2 last:pb-2 flex flex-col gap-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-sans text-lg font-semibold text-stone-900">
                      {hall.number}. {title}
                    </h3>
                    <span className="text-xs font-medium text-stone-500 tabular-nums">
                      {capacity}
                    </span>
                  </div>

                  <p className="text-sm text-stone-600 leading-relaxed">
                    {description}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <p className="text-xs text-stone-500">
                      {details.map((detail, idx) => (
                        <span key={detail}>
                          {detail}
                          {idx < details.length - 1 && (
                            <span aria-hidden="true" className="mx-2 text-stone-300">
                              ·
                            </span>
                          )}
                        </span>
                      ))}
                    </p>

                    <button
                      type="button"
                      onClick={() => onSelectHall(hall.id)}
                      className="inline-flex items-center gap-1.5 min-h-[44px] px-3 -mr-3 text-xs sm:text-sm font-semibold text-[#115E46] hover:text-[#0D4A37] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <span>{t.halls.bookBtn}</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
