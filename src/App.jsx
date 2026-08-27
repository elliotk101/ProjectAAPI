import { Routes, Route, useLocation } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BillBanner from './components/BillBanner';
import ScrollToTop from './components/ScrollToTop';
import AccessibilityTools from './components/AccessibilityTools';
import LandingPage from './pages/LandingPage';
import { useI18n } from './i18n/i18nProvider';

const RiskScreener = lazy(() => import('./pages/RiskScreener'));
const HealthMap = lazy(() => import('./pages/HealthMap'));
const ResourceDirectory = lazy(() => import('./pages/ResourceDirectory'));
const HospitalCompliance = lazy(() => import('./pages/HospitalCompliance'));
const ProcessTaskTracker = lazy(() => import('./pages/ProcessTaskTracker'));
const BillS634B = lazy(() => import('./pages/BillS634B'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const Accessibility = lazy(() => import('./pages/Accessibility'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  const location = useLocation();
  const { dir } = useI18n();

  // Hide the footer on the map page (full-screen map)
  const isMapPage = location.pathname === '/map';

  return (
    <div dir={dir}>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <ScrollToTop />
      <Navbar />
      <BillBanner />
      <AccessibilityTools />
      <main id="main-content" tabIndex="-1">
        <Suspense fallback={<div className="page-loader" role="status">Loading…</div>}><Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/screener" element={<RiskScreener />} />
          <Route path="/map" element={<HealthMap />} />
          <Route path="/resources" element={<ResourceDirectory />} />
          <Route path="/compliance" element={<HospitalCompliance />} />
          <Route path="/tracker" element={<ProcessTaskTracker />} />
          <Route path="/bill-s634b" element={<BillS634B />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/accessibility" element={<Accessibility />} />
          <Route path="*" element={<NotFound />} />
        </Routes></Suspense>
      </main>
      {!isMapPage && <Footer />}
    </div>
  );
}

export default App;
