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

export default function App() {
  const [selectedHallId, setSelectedHallId] = useState('oilaviy-zal');
  const [gmpQuotaExceeded, setGmpQuotaExceeded] = useState(false);
  const [isAdminView, setIsAdminView] = useState(
    () => typeof window !== 'undefined' && window.location.hash === '#admin'
  );

  useEffect(() => {
    const handleQuotaExceeded = () => setGmpQuotaExceeded(true);
    const handleHashChange = () => {
      setIsAdminView(window.location.hash === '#admin');
    };
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const openAdminPanel = () => {
    window.location.hash = 'admin';
    setIsAdminView(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const backToSite = () => {
    if (window.location.hash === '#admin') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
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

              <Header
                onReserveClick={scrollToReservation}
                onOpenAdmin={openAdminPanel}
              />

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

              <Footer onOpenAdmin={openAdminPanel} />
            </div>
          </GooglePlaceProvider>
        )}
      </FirebaseProvider>
    </ErrorBoundary>
  );
}
