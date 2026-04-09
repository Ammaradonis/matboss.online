import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PricingPage from './pages/PricingPage';
import BankTransferPage from './pages/BankTransferPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import DmarcPolicyPage from './pages/DmarcPolicyPage';
import NewsPage from './pages/NewsPage';
import BlogPostPage from './pages/BlogPostPage';
import DemoPage from './pages/DemoPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/demo" element={<DemoPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/bank-transfer" element={<BankTransferPage />} />
      <Route path="/terms" element={<TermsOfServicePage />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/dmarc" element={<DmarcPolicyPage />} />
      <Route path="/news" element={<NewsPage />} />
      <Route path="/news/:category/:slug" element={<BlogPostPage />} />
    </Routes>
  );
}
