import TypewriterHeadline from './TypewriterHeadline';
import BookingCalendar from './BookingCalendar';
import DojoBackground from './DojoBackground';
import { HeroChart, HeroDiagram, HeroInteractive } from './visuals/HeroVisuals';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden gi-texture">
      {/* Background Effects */}
      <DojoBackground />

      {/* Radial gradient overlays */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-dojo-red/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-dojo-gold/3 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-8 pb-16 md:pt-12 md:pb-24">
        {/* Badge */}
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                           bg-dojo-red/10 border border-dojo-red/20 text-xs font-mono text-dojo-red font-bold tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-dojo-red animate-pulse" />
            ENROLLMENT AUTOMATION — SAN DIEGO EXCLUSIVE
          </span>
        </div>

        {/* Headline */}
        <div className="text-center mb-4">
          <TypewriterHeadline
            text="San Diego Martial Arts Schools — Stop Losing Students to No-Shows."
            as="h1"
            className="text-4xl md:text-6xl lg:text-7xl text-white leading-tight"
            speed={35}
            delay={400}
          />
        </div>

        {/* Subheadline */}
        <p className="text-center text-gray-400 text-base md:text-lg max-w-2xl mx-auto mb-4 leading-relaxed">
          Your San Diego dojo runs on discipline. Your enrollment system should too.
          We automate trial booking, reminders, no-show recovery, and enrollment follow-up
          — so you stop bleeding students and start stacking revenue.
        </p>

        {/* Value Prop Chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 md:mb-12">
          {[
            'No-Show Recovery',
            'Automated Reminders',
            'Trial-to-Enrollment Engine',
            'Works With Your Existing Software',
            'San Diego Dojos Only',
          ].map((chip) => (
            <span
              key={chip}
              className="px-3 py-1 rounded-full text-xs font-medium
                         bg-white/5 border border-white/10 text-gray-300"
            >
              {chip}
            </span>
          ))}
        </div>

        {/* Calendar Section */}
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-5">
            <h2 className="font-heading text-xl md:text-2xl tracking-wider text-dojo-gold mb-1">
              Book Your Free Leakage Diagnosis Call
            </h2>
            <p className="text-xs text-gray-500">
              30 minutes with Ammar Alkheder, Founder — we'll map every student you're losing and why.
            </p>
          </div>

          <BookingCalendar />
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 flex flex-wrap justify-center gap-6 md:gap-10 text-center">
          <div>
            <div className="text-2xl md:text-3xl font-heading text-dojo-red">92%</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">Trial No-Shows Never Return</div>
          </div>
          <div className="w-px h-12 bg-white/5 hidden md:block" />
          <div>
            <div className="text-2xl md:text-3xl font-heading text-dojo-gold">3–5</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">Students Lost Monthly per Dojo</div>
          </div>
          <div className="w-px h-12 bg-white/5 hidden md:block" />
          <div>
            <div className="text-2xl md:text-3xl font-heading text-white">$0</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">Extra Ad Spend Required</div>
          </div>
        </div>
        <HeroChart />
        <HeroDiagram />
        <HeroInteractive />
      </div>
    </section>
  );
}
