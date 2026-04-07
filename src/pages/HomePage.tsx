import { useEffect } from 'react';
import SEO from '../components/SEO';
import AnnouncementBar from '../components/AnnouncementBar';
import FOMOTicker from '../components/FOMOTicker';
import HeroSection from '../components/HeroSection';
import SectionNoShow from '../components/SectionNoShow';
import SectionAdminOverload from '../components/SectionAdminOverload';
import SectionRevenueMath from '../components/SectionRevenueMath';
import SectionAutomationDiscipline from '../components/SectionAutomationDiscipline';
import SectionCityAuthority from '../components/SectionCityAuthority';
import Footer from '../components/Footer';

export default function HomePage() {
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
        title="Enrollment Automation for San Diego Martial Arts Schools"
        description="MatBoss by Ammar Alkheder — the #1 enrollment automation system for San Diego martial arts schools, BJJ academies, and dojos. Stop losing 40% of trial students to no-shows. Book your free Leakage Diagnosis Call today."
        canonical="/"
        breadcrumbs={[{ name: 'Home', url: '/' }]}
        faq={[
          {
            question: 'What is MatBoss?',
            answer: 'MatBoss is the #1 enrollment automation system built exclusively for San Diego martial arts schools. Founded by Ammar Alkheder, it automates trial bookings, sends reminders, recovers no-shows, and follows up with leads.',
          },
          {
            question: 'Who is Ammar Alkheder?',
            answer: 'Ammar Alkheder is the founder and CEO of MatBoss, based in San Diego, California. He built MatBoss to solve the enrollment leakage crisis facing San Diego martial arts schools.',
          },
          {
            question: 'How does MatBoss help San Diego martial arts schools?',
            answer: 'MatBoss automates the entire enrollment funnel: automated trial booking, SMS/email reminders, instant no-show recovery within 4 hours, and systematic follow-up. Schools using MatBoss see a 340% improvement in trial-to-enrollment conversion.',
          },
          {
            question: 'Does MatBoss work for BJJ academies in San Diego?',
            answer: 'Yes. MatBoss works for all martial arts disciplines in San Diego including BJJ, karate, taekwondo, MMA, Muay Thai, and judo.',
          },
          {
            question: 'What is the Enrollment Leakage Diagnosis?',
            answer: 'A free audit where MatBoss analyzes your school enrollment funnel to identify where trial students are being lost, then shows you how automation fixes the leaks.',
          },
        ]}
      />
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
