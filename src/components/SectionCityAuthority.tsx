import { CityChart, CityDiagram, CityInteractive } from './visuals/CityAuthorityVisuals';

export default function SectionCityAuthority() {
  const insights = [
    {
      stat: '120',
      label: 'The Plateau Number',
      detail:
        'Most San Diego martial arts schools plateau around 120 active students. Not because of marketing — because their enrollment pipeline leaks faster than it fills.',
    },
    {
      stat: '72%',
      label: 'Trial-to-Enrollment Rate (with automation)',
      detail:
        'San Diego dojos using structured follow-up sequences convert trials to paid memberships at nearly double the rate of those relying on manual effort alone.',
    },
    {
      stat: '23',
      label: 'Minutes to Lose a Lead',
      detail:
        'Research shows that if you don\'t follow up within 23 minutes of a trial inquiry, your close rate drops by over 60%. Most San Diego schools respond in 4–6 hours.',
    },
  ];

  return (
    <section className="py-20 md:py-28 px-4 relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-dojo-red/3 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto reveal">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-dojo-red/10 border border-dojo-red/20
                           text-[10px] font-mono text-dojo-red uppercase tracking-widest mb-4">
            Problem #5
          </span>

          <h2 className="font-heading text-3xl md:text-5xl text-white tracking-wide mb-4 leading-tight max-w-3xl mx-auto">
            What I'm Seeing Across
            <span className="text-dojo-red"> San Diego Dojos</span> Right Now.
          </h2>

          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            After working with San Diego martial arts schools across every discipline — BJJ,
            Muay Thai, Karate, Judo, MMA — a pattern has emerged. Here's what separates the
            schools that grow from the ones that stall.
          </p>
        </div>

        {/* Insight Cards */}
        <div className="grid gap-4 md:grid-cols-3 md:gap-6 mb-12">
          {insights.map((insight, i) => (
            <div
              key={i}
              className="p-6 rounded-xl bg-dojo-dark/60 border border-white/5
                         hover:border-dojo-red/20 transition-all duration-300 group"
            >
                <div className="text-4xl md:text-5xl font-heading text-dojo-red mb-1
                              group-hover:text-dojo-gold transition-colors duration-300">
                {insight.stat}
              </div>
              <div className="text-sm font-semibold text-white mb-3">{insight.label}</div>
              <p className="text-xs text-gray-500 leading-relaxed">{insight.detail}</p>
            </div>
          ))}
        </div>

        {/* Authority Block */}
        <div className="bg-dojo-dark/80 border border-dojo-red/15 rounded-2xl p-6 md:p-8">
          <div className="grid md:grid-cols-5 gap-6 items-center">
            <div className="md:col-span-3">
              <h3 className="font-heading text-xl md:text-2xl tracking-wider text-white mb-3">
                Why San Diego Schools Plateau at 120 Students
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-4">
                It's not about ad spend. San Diego martial arts schools that break past 120 students
                share one thing in common: they stopped treating enrollment like a manual process
                and started treating it like a system.
              </p>
              <p className="text-sm text-gray-400 leading-relaxed mb-4">
                The schools that run automated trial confirmations, timed reminders, no-show
                recovery, and structured enrollment follow-up don't just grow — they grow
                predictably. Month over month. Without burning out the owner.
              </p>
              <p className="text-sm text-gray-300 font-medium">
                That's what MatBoss builds for your San Diego dojo. Not more leads.
                A system to convert the ones you already have.
              </p>
            </div>

            <div className="md:col-span-2 flex flex-col items-center">
              <div className="w-full max-w-[200px] aspect-square rounded-full border-2 border-dojo-red/20
                              flex flex-col items-center justify-center text-center p-6
                              bg-gradient-to-br from-dojo-red/5 to-transparent">
                <div className="text-5xl font-heading text-dojo-red">SD</div>
                <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">San Diego</div>
                <div className="text-[10px] text-gray-600 mt-1">Exclusive Market</div>
              </div>

              <a
                href="#booking"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-dojo-red px-6 py-3 text-sm font-heading tracking-wider text-white transition-all duration-200 hover:bg-dojo-crimson red-glow-hover sm:w-auto"
              >
                <span>Book Your Diagnosis Call</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-7-7l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        <CityChart />
        <CityDiagram />
        <CityInteractive />
      </div>
    </section>
  );
}
