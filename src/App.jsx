import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BillBanner from './components/BillBanner';
import BillModal from './components/BillModal';
import LandingPage from './pages/LandingPage';
import RiskScreener from './pages/RiskScreener';
import HealthMap from './pages/HealthMap';
import ResourceDirectory from './pages/ResourceDirectory';
import HospitalCompliance from './pages/HospitalCompliance';
import ProcessTaskTracker from './pages/ProcessTaskTracker';
import BillS634B from './pages/BillS634B';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Accessibility from './pages/Accessibility';
import { useI18n } from './i18n/i18nProvider';

function App() {
  const location = useLocation();
  const { dir } = useI18n();

  // Hide the footer on the map page (full-screen map)
  const isMapPage = location.pathname === '/map';

  return (
    <div dir={dir}>
      <Navbar />
      <BillBanner />
      <BillModal />
      <main>
        <Routes>
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
        </Routes>
      </main>
      {!isMapPage && <Footer />}
    </div>
  );
}

export default App;
