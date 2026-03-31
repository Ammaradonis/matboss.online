import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PricingAnnouncementBar from '../components/pricing/PricingAnnouncementBar';
import PricingTicker from '../components/pricing/PricingTicker';
import SectionClassified from '../components/pricing/SectionClassified';
import SectionAutopsy from '../components/pricing/SectionAutopsy';
import SectionDirtySecret from '../components/pricing/SectionDirtySecret';
import SectionBombshell from '../components/pricing/SectionBombshell';
import SectionDetonation from '../components/pricing/SectionDetonation';
import SectionCheckout from '../components/pricing/SectionCheckout';
import Footer from '../components/Footer';

export default function PricingPage() {
  const [searchParams] = useSearchParams();
  const [redirectSuccess] = useState(
    () => searchParams.get('payment_status') === 'success',
  );

  useEffect(() => {
    if (redirectSuccess) {
      // Landed here after Stripe redirect — scroll to checkout section
      setTimeout(() => {
        document.getElementById('checkout')?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } else {
      window.scrollTo(0, 0);
    }
  }, [redirectSuccess]);

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
      <SectionCheckout redirectSuccess={redirectSuccess} />

      <div className="section-divider" />
      <Footer />
    </div>
  );
}
