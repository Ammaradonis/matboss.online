import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SEO from '../components/SEO';
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
  const [returnedFromStripe] = useState(
    () => Boolean(
      searchParams.get('payment_return')
      || searchParams.get('payment_intent_client_secret')
      || searchParams.get('payment_status') === 'success',
    ),
  );

  useEffect(() => {
    if (returnedFromStripe) {
      // Landed here after Stripe redirect — scroll to checkout section
      setTimeout(() => {
        document.getElementById('checkout')?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } else {
      window.scrollTo(0, 0);
    }
  }, [returnedFromStripe]);

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
        title="Pricing — Enrollment Automation for San Diego Martial Arts Schools"
        description="MatBoss pricing for San Diego martial arts schools. One extra student per month pays for the entire system. Three extra students equals $5,000-$9,000 in annual revenue increase. Founded by Ammar Alkheder."
        canonical="/pricing"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Pricing', url: '/pricing' },
        ]}
        faq={[
          {
            question: 'How much does MatBoss cost for San Diego martial arts schools?',
            answer: 'MatBoss pricing is designed so that one extra enrolled student per month covers the entire cost of the system. Visit the pricing page for current plans and enrollment automation packages.',
          },
          {
            question: 'Is there a free trial or diagnosis available?',
            answer: 'Yes. MatBoss offers a free Enrollment Leakage Diagnosis where we audit your martial arts school enrollment funnel and show you exactly where you are losing trial students.',
          },
        ]}
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
      <SectionCheckout />

      <div className="section-divider" />
      <Footer />
    </div>
  );
}
