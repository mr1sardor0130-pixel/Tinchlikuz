import { useState } from 'react';
import { Check, Copy, ExternalLink, MapPin, Phone, Clock, Instagram } from 'lucide-react';
import { GUEST_REVIEWS, RESTAURANT_INFO } from '../data/restaurantData';
import { GoogleMapsLocation } from './GoogleMapsLocation';
import { TinchlikLogo } from './TinchlikLogo';

export function LocationReviewsSection() {
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async () => {
    const fullAddress = `${RESTAURANT_INFO.city}, ${RESTAURANT_INFO.address}`;
    try {
      await navigator.clipboard.writeText(fullAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <section id="sharhlar" className="py-16 lg:py-20 bg-[#f8f9f8]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-stone-200">
            <div>
              <p className="text-xs font-medium text-[#115E46] tracking-wide mb-2">
                Mehmonlar fikri
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-stone-900 tracking-tight text-balance">
                Samarqand aholisi va mehmonlari ishonchi
              </h2>
            </div>
            <p className="text-sm text-stone-600 tabular-nums">
              <span className="font-semibold text-stone-900">{RESTAURANT_INFO.rating}</span>
              <span aria-hidden="true" className="mx-2 text-stone-300">
                ·
              </span>
              <span>{RESTAURANT_INFO.ratingSource}</span>
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {GUEST_REVIEWS.map((review) => (
              <article
                key={review.id}
                className="bg-white border border-stone-200 rounded-xl p-6 flex flex-col justify-between gap-5"
              >
                <p className="text-sm text-stone-700 leading-relaxed">
                  “{review.quote}”
                </p>

                <div className="pt-4 border-t border-stone-100 flex items-baseline justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-stone-900">
                      {review.author}
                    </p>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {review.visitContext}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-stone-900 tabular-nums shrink-0">
                    {review.rating}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="manzil" className="py-16 lg:py-20 bg-white border-t border-stone-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-6 space-y-6">
              <div className="flex items-start gap-5">
                <TinchlikLogo className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 shadow-sm" />
                <div>
                  <p className="text-xs font-medium text-[#115E46] tracking-wide mb-1.5">
                    Manzil, xarita va Instagram
                  </p>
                  <h2 className="font-display text-3xl sm:text-4xl font-semibold text-stone-900 tracking-tight text-balance">
                    Samarqand shahri, Farhod ko‘chasi, 31 / 42-uy
                  </h2>
                  <p className="mt-2 text-sm sm:text-base text-stone-600">
                    Mo‘ljal: {RESTAURANT_INFO.landmark}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleCopyAddress}
                  className="inline-flex items-center gap-2 px-4 min-h-[44px] text-xs sm:text-sm font-medium text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-[#115E46]" aria-hidden="true" />
                      <span>Manzil nusxalandi</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" aria-hidden="true" />
                      <span>Manzilni nusxalash</span>
                    </>
                  )}
                </button>

                <a
                  href={RESTAURANT_INFO.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 min-h-[44px] text-xs sm:text-sm font-medium text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
                >
                  <Instagram className="w-4 h-4 text-[#115E46]" aria-hidden="true" />
                  <span>{RESTAURANT_INFO.instagramHandle}</span>
                </a>

                <a
                  href={RESTAURANT_INFO.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 min-h-[44px] text-xs sm:text-sm font-medium text-white bg-[#115E46] hover:bg-[#0D4A37] rounded-lg transition-colors"
                >
                  <span>Google Maps’da ochish</span>
                  <ExternalLink className="w-4 h-4" aria-hidden="true" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-6 bg-[#f8f9f8] border border-stone-200 rounded-xl divide-y divide-stone-200">
              <div className="p-5 sm:p-6 flex items-start gap-4">
                <MapPin className="w-5 h-5 text-[#115E46] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-xs font-medium text-stone-500">Manzil</p>
                  <p className="mt-1 text-sm font-semibold text-stone-900">
                    {RESTAURANT_INFO.city}, {RESTAURANT_INFO.address}
                  </p>
                  <p className="mt-0.5 text-xs text-stone-600">
                    {RESTAURANT_INFO.landmark}
                  </p>
                </div>
              </div>

              <div className="p-5 sm:p-6 flex items-start gap-4">
                <Phone className="w-5 h-5 text-[#115E46] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-xs font-medium text-stone-500">Telefon raqamlar</p>
                  <div className="mt-1 flex flex-wrap gap-x-6 gap-y-1">
                    {RESTAURANT_INFO.phones.map((p) => (
                      <a
                        key={p.display}
                        href={p.href}
                        className="text-sm font-semibold text-stone-900 hover:text-[#115E46] transition-colors tabular-nums"
                      >
                        {p.display}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6 flex items-start gap-4">
                <Clock className="w-5 h-5 text-[#115E46] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-xs font-medium text-stone-500">Ish vaqti va xizmatlar</p>
                  <p className="mt-1 text-sm font-semibold text-stone-900 tabular-nums">
                    {RESTAURANT_INFO.hours}
                  </p>
                  <p className="mt-1 text-xs text-stone-600">
                    {RESTAURANT_INFO.amenities.join(' · ')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <GoogleMapsLocation />
        </div>
      </section>
    </>
  );
}
