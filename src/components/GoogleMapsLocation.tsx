/// <reference types="google.maps" />
import { useEffect, useState } from 'react';
import {
  AdvancedMarker,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useAdvancedMarkerRef,
  useApiLoadingStatus,
  APILoadingStatus,
  useMap,
} from '@vis.gl/react-google-maps';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MapPin,
  RefreshCw,
  Star,
  X,
} from 'lucide-react';
import { RESTAURANT_INFO } from '../data/restaurantData';
import { TARGET_PLACE_BIAS, useGooglePlace } from '../context/GooglePlaceContext';
import { useLanguage } from '../context/LanguageContext';
import { TRANSLATIONS } from '../data/translations';
import { ResilientImage } from './ResilientImage';

export function GoogleMapsLocation() {
  const map = useMap();
  const loadingStatus = useApiLoadingStatus();
  const [markerRef, marker] = useAdvancedMarkerRef();
  const { hasApiKey, isLoading, error, place, allPhotos, refreshPlace } =
    useGooglePlace();
  const { lang } = useLanguage();
  const t = TRANSLATIONS[lang];

  const [infoOpen, setInfoOpen] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (map && place?.location) {
      map.panTo(place.location);
      map.setZoom(16);
    }
  }, [map, place]);

  const mapFailed =
    !hasApiKey ||
    loadingStatus === APILoadingStatus.FAILED ||
    loadingStatus === APILoadingStatus.AUTH_FAILURE;

  const photos = allPhotos;

  const getCaption = (index: number) =>
    t.photoCaptions[index] || photos[index]?.authorName || t.restaurant.fullName;

  const handlePrevPhoto = () => {
    if (lightboxIndex === null || photos.length === 0) return;
    setLightboxIndex((lightboxIndex - 1 + photos.length) % photos.length);
  };

  const handleNextPhoto = () => {
    if (lightboxIndex === null || photos.length === 0) return;
    setLightboxIndex((lightboxIndex + 1) % photos.length);
  };

  return (
    <div className="space-y-10">
      <div className="border border-stone-200 rounded-xl overflow-hidden bg-white">
        <div className="px-4 sm:px-5 py-4 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#f8f9f8]">
          <div className="flex items-center gap-2.5 min-w-0">
            <MapPin className="w-4 h-4 text-[#115E46] shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-stone-900 truncate">
                {place?.displayName || t.restaurant.fullName}
              </p>
              <p className="text-xs text-stone-500 truncate">
                {place?.formattedAddress ||
                  `${t.restaurant.city}, ${t.restaurant.address}`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {place?.rating && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-stone-900 tabular-nums mr-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" aria-hidden="true" />
                <span>{place.rating.toFixed(1)}</span>
                {place.userRatingCount ? (
                  <span className="text-stone-500 font-normal">
                    ({place.userRatingCount})
                  </span>
                ) : null}
              </span>
            )}

            {hasApiKey && (
              <button
                type="button"
                onClick={() => void refreshPlace()}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-3 min-h-[44px] text-xs font-medium text-stone-700 bg-white border border-stone-200 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer disabled:opacity-60"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`}
                  aria-hidden="true"
                />
                <span>{t.location.refreshBtn}</span>
              </button>
            )}

            <a
              href={place?.googleMapsURI || RESTAURANT_INFO.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 min-h-[44px] text-xs font-medium text-white bg-[#115E46] hover:bg-[#0D4A37] rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <span>{t.location.openInMaps}</span>
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="relative w-full h-[320px] sm:h-[400px] lg:h-[440px] bg-stone-100">
          {mapFailed ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3">
              <p className="text-sm font-medium text-stone-800">
                {t.location.mapFailedTitle}
              </p>
              <p className="text-xs text-stone-500 max-w-md">
                {t.location.mapFailedDesc}
              </p>
              <a
                href={RESTAURANT_INFO.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 min-h-[44px] text-xs font-medium text-white bg-[#115E46] rounded-lg"
              >
                <span>{t.location.openInMaps}</span>
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>
          ) : (
            <GoogleMap
              mapId="DEMO_MAP_ID"
              defaultCenter={TARGET_PLACE_BIAS}
              defaultZoom={15}
              gestureHandling="cooperative"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              style={{ width: '100%', height: '100%' }}
            >
              {place && (
                <>
                  <AdvancedMarker
                    ref={markerRef}
                    position={place.location}
                    title={place.displayName}
                    onClick={() => setInfoOpen((prev) => !prev)}
                  >
                    <Pin
                      background="#115E46"
                      borderColor="#093829"
                      glyphColor="#FFFFFF"
                    />
                  </AdvancedMarker>

                  {infoOpen && marker && (
                    <InfoWindow
                      anchor={marker}
                      onCloseClick={() => setInfoOpen(false)}
                      maxWidth={260}
                    >
                      <div className="p-1 space-y-1.5 text-stone-900">
                        <p className="text-sm font-semibold">{place.displayName}</p>
                        {place.formattedAddress && (
                          <p className="text-xs text-stone-600 leading-snug">
                            {place.formattedAddress}
                          </p>
                        )}
                        {place.rating && (
                          <p className="text-xs font-medium text-stone-800 tabular-nums">
                            {t.location.ratingPrefix}: {place.rating.toFixed(1)} / 5
                            {place.userRatingCount
                              ? ` (${place.userRatingCount} ${t.location.reviewsUnit})`
                              : ''}
                          </p>
                        )}
                        <a
                          href={place.googleMapsURI || RESTAURANT_INFO.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#115E46] underline underline-offset-2 pt-1"
                        >
                          <span>{t.location.getDirections}</span>
                          <ExternalLink className="w-3 h-3" aria-hidden="true" />
                        </a>
                      </div>
                    </InfoWindow>
                  )}
                </>
              )}
            </GoogleMap>
          )}
        </div>

        {error && (
          <div className="px-5 py-3 bg-stone-50 border-t border-stone-200 text-xs text-stone-600">
            {error}
          </div>
        )}
      </div>

      <div id="galereya" className="scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-5">
          <div>
            <h3 className="font-display text-2xl sm:text-3xl font-semibold text-stone-900">
              {t.location.galleryTitle}
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              {photos.length > 0
                ? t.location.galleryCount(photos.length)
                : t.location.galleryFallbackSubtitle}
            </p>
          </div>
          <a
            href={RESTAURANT_INFO.mapsAlbumUrl || place?.googleMapsURI || RESTAURANT_INFO.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 min-h-[44px] text-xs sm:text-sm font-medium text-[#115E46] hover:underline underline-offset-4 whitespace-nowrap"
          >
            <span>{t.location.allPhotosLink}</span>
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
        </div>

        {isLoading && photos.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((slot) => (
              <div
                key={slot}
                className="aspect-[4/3] rounded-xl bg-stone-200/70 animate-pulse border border-stone-200"
              />
            ))}
          </div>
        ) : photos.length > 0 ? (
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-5 no-scrollbar">
            {photos.map((photo, index) => (
              <figure
                key={`${place?.id || 'gallery'}-photo-${index}`}
                className="snap-start shrink-0 w-[82vw] sm:w-auto bg-white border border-stone-200 rounded-xl overflow-hidden flex flex-col"
              >
                <button
                  type="button"
                  onClick={() => setLightboxIndex(index)}
                  className="aspect-[4/3] w-full bg-stone-100 overflow-hidden cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-800"
                  aria-label={t.location.enlargePhotoAria(index + 1)}
                >
                  <ResilientImage
                    src={photo.thumbUri}
                    alt={getCaption(index)}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                  />
                </button>
                <figcaption className="px-4 py-2.5 text-[11px] text-stone-500 border-t border-stone-100 truncate">
                  {t.location.sourcePrefix}:{' '}
                  {photo.authorUri ? (
                    <a
                      href={photo.authorUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-stone-800"
                    >
                      {getCaption(index)}
                    </a>
                  ) : (
                    <span>{getCaption(index)}</span>
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <div className="border border-stone-200 rounded-xl p-6 bg-[#f8f9f8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-sm text-stone-600">
              {t.location.emptyGalleryMsg}
            </p>
            <a
              href={RESTAURANT_INFO.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 min-h-[44px] text-xs font-medium text-white bg-[#115E46] rounded-lg whitespace-nowrap shrink-0"
            >
              <span>{t.location.openGalleryPhotos}</span>
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          </div>
        )}
      </div>

      {lightboxIndex !== null && photos[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={t.location.galleryTitle}
        >
          <div className="w-full max-w-4xl flex items-center justify-between text-white/90 pb-3">
            <span className="text-xs sm:text-sm tabular-nums">
              {lightboxIndex + 1} / {photos.length} · {getCaption(lightboxIndex)}
            </span>
            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              aria-label={t.location.closeAria}
              className="w-11 h-11 inline-flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative w-full max-w-4xl aspect-[4/3] sm:aspect-[16/10] bg-black rounded-xl overflow-hidden flex items-center justify-center">
            <img
              src={photos[lightboxIndex].uri}
              alt={getCaption(lightboxIndex)}
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain"
            />

            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevPhoto}
                  aria-label={t.location.prevAria}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 text-white inline-flex items-center justify-center cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextPhoto}
                  aria-label={t.location.nextAria}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 text-white inline-flex items-center justify-center cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
