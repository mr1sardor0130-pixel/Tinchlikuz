import { useEffect, useState } from 'react';
import { GooglePlaceProvider } from './context/GooglePlaceContext';
import { FirebaseProvider } from './context/FirebaseContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { MenuSection } from './components/MenuSection';
import { HallsSection } from './components/HallsSection';
import { ReservationSection } from './components/ReservationSection';
import { LocationReviewsSection } from './components/LocationReviewsSection';
import { Footer } from './components/Footer';
import { AdminPanel } from './components/AdminPanel';

export const SECRET_ADMIN_SLUG = 'tinchlik-boshqaruv-x94k2m';

function isSecretAdminRoute(): boolean {
  if (typeof window === 'undefined') return false;
  const cleanPath = window.location.pathname.replace(/\/+$/, '');
  const cleanHash = window.location.hash.replace(/^#\/?/, '');
  return (
    cleanPath === `/${SECRET_ADMIN_SLUG}` || cleanHash === SECRET_ADMIN_SLUG
  );
}

export default function App() {
  const [selectedHallId, setSelectedHallId] = useState('oilaviy-zal');
  const [gmpQuotaExceeded, setGmpQuotaExceeded] = useState(false);
  const [isAdminView, setIsAdminView] = useState<boolean>(() => isSecretAdminRoute());

  useEffect(() => {
    const handleQuotaExceeded = () => setGmpQuotaExceeded(true);
    const syncRoute = () => {
      setIsAdminView(isSecretAdminRoute());
    };
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    window.addEventListener('hashchange', syncRoute);
    window.addEventListener('popstate', syncRoute);
    return () => {
      window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
      window.removeEventListener('hashchange', syncRoute);
      window.removeEventListener('popstate', syncRoute);
    };
  }, []);

  const backToSite = () => {
    window.history.replaceState(null, '', '/');
    setIsAdminView(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToReservation = () => {
    const el = document.getElementById('bron');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectHall = (hallId: string) => {
    setSelectedHallId(hallId);
    scrollToReservation();
  };

  return (
    <ErrorBoundary>
      <FirebaseProvider>
        {isAdminView ? (
          <AdminPanel onBackToSite={backToSite} />
        ) : (
          <GooglePlaceProvider>
            <div className="min-h-screen flex flex-col bg-[#f8f9f8] text-stone-900">
              {gmpQuotaExceeded && (
                <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
                  <span>
                    Google Maps Platform quota reached. If you are the app owner, visit{' '}
                    <a
                      href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-semibold text-amber-950 hover:text-amber-800"
                    >
                      maps developer site
                    </a>{' '}
                    for instructions to update your account.
                  </span>
                </div>
              )}

              <Header onReserveClick={scrollToReservation} />

              <main className="flex-1">
                <Hero onReserveClick={scrollToReservation} />

                <MenuSection onReserveClick={scrollToReservation} />

                <HallsSection onSelectHall={handleSelectHall} />

                <LocationReviewsSection />

                <ReservationSection
                  selectedHallId={selectedHallId}
                  onHallChange={setSelectedHallId}
                />
              </main>

              <Footer />
            </div>
          </GooglePlaceProvider>
        )}
      </FirebaseProvider>
    </ErrorBoundary>
  );
}
