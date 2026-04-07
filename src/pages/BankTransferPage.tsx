import { useEffect } from 'react';
import SEO from '../components/SEO';
import PricingAnnouncementBar from '../components/pricing/PricingAnnouncementBar';
import PricingTicker from '../components/pricing/PricingTicker';
import SectionClassified from '../components/pricing/SectionClassified';
import SectionAutopsy from '../components/pricing/SectionAutopsy';
import SectionDirtySecret from '../components/pricing/SectionDirtySecret';
import SectionBombshell from '../components/pricing/SectionBombshell';
import SectionDetonation from '../components/pricing/SectionDetonation';
import BankTransferCheckout from '../components/bank-transfer/BankTransferCheckout';
import Footer from '../components/Footer';

export default function BankTransferPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-dojo-black dojo-mat-bg">
      <SEO
        title="Bank Transfer Payment — MatBoss San Diego"
        description="Pay for MatBoss enrollment automation via bank transfer. Built for San Diego martial arts schools by Ammar Alkheder."
        canonical="/bank-transfer"
        noindex
      />
      <PricingAnnouncementBar />
      <PricingTicker />
      <SectionClassified />

      <div className="section-divider" />
      <SectionAutopsy />

      <div className="section-divider" />
      <SectionDirtySecret />

      <div className="section-divider" />
      <SectionBombshell />

      <div className="section-divider" />
      <SectionDetonation />

      <div className="section-divider" />
      <BankTransferCheckout />

      <div className="section-divider" />
      <Footer />
    </div>
  );
}
