/// <reference types="google.maps" />
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  APIProvider,
  APILoadingStatus,
  useApiLoadingStatus,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { LOCAL_RESTAURANT_PHOTOS } from '../data/restaurantData';

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// Coordinates resolved from https://maps.app.goo.gl/UHowx8ixeJ3svLaL8
// Used as search bias to locate the exact Tinchlik (oilaviy restorani) listing
export const TARGET_PLACE_BIAS = { lat: 39.6674874, lng: 66.9357333 };

export interface GooglePlacePhoto {
  uri: string;
  thumbUri: string;
  authorName: string;
  authorUri?: string;
}

export interface GooglePlaceDetails {
  id: string;
  displayName: string;
  formattedAddress: string;
  location: google.maps.LatLngLiteral;
  rating?: number | null;
  userRatingCount?: number | null;
  googleMapsURI?: string | null;
  nationalPhoneNumber?: string | null;
  photos: GooglePlacePhoto[];
}

interface GooglePlaceContextValue {
  hasApiKey: boolean;
  isLoading: boolean;
  error: string | null;
  place: GooglePlaceDetails | null;
  allPhotos: GooglePlacePhoto[];
  refreshPlace: () => Promise<void>;
}

const GooglePlaceContext = createContext<GooglePlaceContextValue>({
  hasApiKey: Boolean(MAPS_API_KEY),
  isLoading: false,
  error: null,
  place: null,
  allPhotos: LOCAL_RESTAURANT_PHOTOS,
  refreshPlace: async () => {},
});

function isQuotaError(err: unknown): boolean {
  const text = err instanceof Error ? err.message : String(err);
  return (
    text.includes('RESOURCE_EXHAUSTED') ||
    text.includes('OVER_QUERY_LIMIT') ||
    text.includes('Quota') ||
    text.includes('429')
  );
}

function GooglePlaceLoader({ children }: { children: ReactNode }) {
  const placesLib = useMapsLibrary('places');
  const loadingStatus = useApiLoadingStatus();

  const [place, setPlace] = useState<GooglePlaceDetails | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(MAPS_API_KEY));
  const [error, setError] = useState<string | null>(null);

  const fetchPlace = useCallback(async () => {
    if (!placesLib) return;

    setIsLoading(true);
    setError(null);

    const queries = [
      'Tinchlik (oilaviy restorani) Samarqand',
      'Tinchlik restaurant Samarkand Farhod',
    ];

    try {
      let matchedPlace: google.maps.places.Place | null = null;

      for (const textQuery of queries) {
        const { places } = await placesLib.Place.searchByText({
          textQuery,
          fields: [
            'id',
            'displayName',
            'formattedAddress',
            'location',
            'rating',
            'userRatingCount',
            'googleMapsURI',
            'photos',
          ],
          locationBias: TARGET_PLACE_BIAS,
          maxResultCount: 5,
        });

        if (places && places.length > 0) {
          const sorted = [...places].sort((a, b) => {
            const aLoc = a.location;
            const bLoc = b.location;
            if (!aLoc) return 1;
            if (!bLoc) return -1;
            const dA = Math.hypot(
              aLoc.lat() - TARGET_PLACE_BIAS.lat,
              aLoc.lng() - TARGET_PLACE_BIAS.lng
            );
            const dB = Math.hypot(
              bLoc.lat() - TARGET_PLACE_BIAS.lat,
              bLoc.lng() - TARGET_PLACE_BIAS.lng
            );
            return dA - dB;
          });
          matchedPlace = sorted[0];
          break;
        }
      }

      if (!matchedPlace) {
        setError('Google Maps’da joy ma’lumoti topilmadi.');
        setPlace(null);
        return;
      }

      await matchedPlace.fetchFields({
        fields: [
          'id',
          'displayName',
          'formattedAddress',
          'location',
          'rating',
          'userRatingCount',
          'googleMapsURI',
          'nationalPhoneNumber',
          'photos',
        ],
      });

      if (!matchedPlace.location) {
        setError('Joylashuv koordinatalari topilmadi.');
        setPlace(null);
        return;
      }

      const rawPhotos: google.maps.places.Photo[] = matchedPlace.photos ?? [];
      const photos: GooglePlacePhoto[] = rawPhotos
        .map((photo: google.maps.places.Photo): GooglePlacePhoto => {
          const attribution = photo.authorAttributions?.[0];
          return {
            uri: photo.getURI({ maxWidth: 1400, maxHeight: 1050 }),
            thumbUri: photo.getURI({ maxWidth: 800, maxHeight: 600 }),
            authorName: attribution?.displayName || 'Google Maps foydalanuvchisi',
            authorUri: attribution?.uri || undefined,
          };
        })
        .filter((item: GooglePlacePhoto) => Boolean(item.uri));

      setPlace({
        id: matchedPlace.id,
        displayName: matchedPlace.displayName || 'Tinchlik (oilaviy restorani)',
        formattedAddress: matchedPlace.formattedAddress || '',
        location: {
          lat: matchedPlace.location.lat(),
          lng: matchedPlace.location.lng(),
        },
        rating: matchedPlace.rating,
        userRatingCount: matchedPlace.userRatingCount,
        googleMapsURI: matchedPlace.googleMapsURI,
        nationalPhoneNumber: matchedPlace.nationalPhoneNumber,
        photos,
      });
    } catch (err) {
      if (isQuotaError(err)) {
        window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
      }
      setError('Google Maps ma’lumotlarini yuklashda xatolik yuz berdi.');
    } finally {
      setIsLoading(false);
    }
  }, [placesLib]);

  useEffect(() => {
    if (placesLib) {
      void fetchPlace();
    }
  }, [placesLib, fetchPlace]);

  useEffect(() => {
    if (
      loadingStatus === APILoadingStatus.FAILED ||
      loadingStatus === APILoadingStatus.AUTH_FAILURE
    ) {
      setIsLoading(false);
      setError('Google Maps API ulanmadi.');
    }
  }, [loadingStatus]);

  const allPhotos = useMemo(() => {
    return [...LOCAL_RESTAURANT_PHOTOS, ...(place?.photos ?? [])];
  }, [place?.photos]);

  return (
    <GooglePlaceContext.Provider
      value={{
        hasApiKey: true,
        isLoading,
        error,
        place,
        allPhotos,
        refreshPlace: fetchPlace,
      }}
    >
      {children}
    </GooglePlaceContext.Provider>
  );
}

export function GooglePlaceProvider({ children }: { children: ReactNode }) {
  if (!MAPS_API_KEY) {
    return (
      <GooglePlaceContext.Provider
        value={{
          hasApiKey: false,
          isLoading: false,
          error: 'Google Maps API kaliti sozlanmagan.',
          place: null,
          allPhotos: LOCAL_RESTAURANT_PHOTOS,
          refreshPlace: async () => {},
        }}
      >
        {children}
      </GooglePlaceContext.Provider>
    );
  }

  return (
    <APIProvider
      apiKey={MAPS_API_KEY}
      libraries={['places', 'marker']}
      language="uz"
      region="UZ"
    >
      <GooglePlaceLoader>{children}</GooglePlaceLoader>
    </APIProvider>
  );
}

export function useGooglePlace() {
  return useContext(GooglePlaceContext);
}
