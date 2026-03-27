import { useEffect } from 'react';
import AnnouncementBar from './components/AnnouncementBar';
import FOMOTicker from './components/FOMOTicker';
import HeroSection from './components/HeroSection';
import SectionNoShow from './components/SectionNoShow';
import SectionAdminOverload from './components/SectionAdminOverload';
import SectionRevenueMath from './components/SectionRevenueMath';
import SectionAutomationDiscipline from './components/SectionAutomationDiscipline';
import SectionCityAuthority from './components/SectionCityAuthority';
import Footer from './components/Footer';

export default function App() {
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
      <AnnouncementBar />
      <FOMOTicker />
      <HeroSection />

      <div className="section-divider" />
      <SectionNoShow />

      <div className="section-divider" />
      <SectionAdminOverload />

      <div className="section-divider" />
      <SectionRevenueMath />

      <div className="section-divider" />
      <SectionAutomationDiscipline />

      <div className="section-divider" />
      <SectionCityAuthority />

      <div className="section-divider" />
      <Footer />
    </div>
  );
}
