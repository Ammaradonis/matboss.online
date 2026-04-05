import TypewriterHeadline from './TypewriterHeadline';
import BookingCalendar from './BookingCalendar';
import DojoBackground from './DojoBackground';
import { HeroChart, HeroDiagram, HeroInteractive } from './visuals/HeroVisuals';

export default function HeroSection() {
  const proofStats = [
    {
      value: '92%',
      label: 'Trial No-Shows Never Return',
      accent: 'text-dojo-red',
    },
    {
      value: '3–5',
      label: 'Students Lost Monthly per Dojo',
      accent: 'text-dojo-gold',
    },
    {
      value: '$0',
      label: 'Extra Ad Spend Required',
      accent: 'text-white',
    },
  ];

  return (
    <section className="relative min-h-[calc(100svh-3.75rem)] overflow-hidden gi-texture md:min-h-screen">
      {/* Background Effects */}
      <DojoBackground />

      {/* Radial gradient overlays */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-dojo-red/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-dojo-gold/3 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-10 pb-16 sm:px-6 md:pt-12 md:pb-24">
        {/* Badge */}
        <div className="text-center mb-5 sm:mb-6">
          <span className="inline-flex items-center justify-center gap-2 rounded-full border border-dojo-red/20 bg-dojo-red/10 px-3 py-2 text-center text-[10px] font-mono font-bold leading-relaxed tracking-wider text-dojo-red sm:px-4 sm:py-1.5 sm:text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-dojo-red animate-pulse" />
            ENROLLMENT AUTOMATION — SAN DIEGO EXCLUSIVE
          </span>
        </div>

        {/* Headline */}
        <div className="text-center mb-5">
          <TypewriterHeadline
            text="San Diego Martial Arts Schools — Stop Losing Students to No-Shows."
            as="h1"
            className="text-[2.85rem] leading-[0.95] text-white sm:text-5xl md:text-6xl lg:text-7xl"
            speed={35}
            delay={400}
          />
        </div>

        {/* Subheadline */}
        <p className="text-center text-[15px] text-gray-400 sm:text-base md:text-lg max-w-2xl mx-auto mb-6 leading-relaxed">
          Your San Diego dojo runs on discipline. Your enrollment system should too.
          We automate trial booking, reminders, no-show recovery, and enrollment follow-up
          — so you stop bleeding students and start stacking revenue.
        </p>

        {/* Value Prop Chips */}
        <div className="mb-10 flex flex-wrap justify-center gap-2.5 md:mb-12">
          {[
            'No-Show Recovery',
            'Automated Reminders',
            'Trial-to-Enrollment Engine',
            'Works With Your Existing Software',
            'San Diego Dojos Only',
          ].map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-gray-300 sm:text-xs"
            >
              {chip}
            </span>
          ))}
        </div>

        {/* Calendar Section */}
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-5">
            <h2 className="font-heading text-lg tracking-wider text-dojo-gold mb-1 sm:text-xl md:text-2xl">
              Book Your Free Leakage Diagnosis Call
            </h2>
            <p className="text-[11px] text-gray-500 sm:text-xs leading-relaxed">
              30 minutes with Ammar Alkheder, Founder — we'll map every student you're losing and why.
            </p>
          </div>

          <BookingCalendar />
        </div>

        {/* Trust Indicators */}
        <div className="mt-10 grid gap-3 text-center sm:mt-12 sm:grid-cols-3 sm:gap-4">
          {proofStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/5 bg-dojo-dark/55 px-4 py-4 backdrop-blur-sm"
            >
              <div className={`text-2xl font-heading sm:text-3xl ${stat.accent}`}>{stat.value}</div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-gray-500">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
        <HeroChart />
        <HeroDiagram />
        <HeroInteractive />
      </div>
    </section>
  );
}
