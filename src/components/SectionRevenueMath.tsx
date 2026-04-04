import { RevenueChart, RevenueDiagram, RevenueInteractive } from './visuals/RevenueMathVisuals';

export default function SectionRevenueMath() {
  const rows = [
    { metric: 'Average Monthly Membership', value: '$150', highlight: false },
    { metric: 'Average Student Lifetime', value: '14 months', highlight: false },
    { metric: 'Lifetime Value per Student', value: '$2,100', highlight: true },
    { metric: 'No-Shows Recovered per Month', value: '3 students', highlight: false },
    { metric: 'Monthly Revenue Recovered', value: '$450/mo', highlight: false },
    { metric: 'Annual Revenue Recovered', value: '$5,400 – $9,000+', highlight: true },
  ];

  return (
    <section className="py-20 md:py-28 px-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-dojo-red/3 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-5xl mx-auto reveal">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-dojo-red/10 border border-dojo-red/20
                           text-[10px] font-mono text-dojo-red uppercase tracking-widest mb-4">
            Problem #3
          </span>

          <h2 className="font-heading text-3xl md:text-5xl text-white tracking-wide mb-4 leading-tight max-w-3xl mx-auto">
            The Revenue Your San Diego Dojo Is
            <span className="text-dojo-red"> Already Earning</span> — But Not Collecting.
          </h2>

          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            This isn't about getting more leads. It's about converting the leads you already
            have. Every San Diego martial arts school sitting on 15+ trials per month is leaving
            thousands on the table.
          </p>
        </div>

        {/* Revenue Table */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-dojo-dark/60 border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-white/5 bg-dojo-carbon/50">
              <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest">
                San Diego Dojo Revenue Recovery Breakdown
              </h3>
            </div>

            <div className="divide-y divide-white/5">
              {rows.map((row, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between px-5 py-4 ${
                    row.highlight ? 'bg-dojo-red/5' : ''
                  }`}
                >
                  <span className={`text-sm ${row.highlight ? 'text-white font-semibold' : 'text-gray-400'}`}>
                    {row.metric}
                  </span>
                  <span
                    className={`text-sm font-mono font-bold ${
                      row.highlight ? 'text-dojo-red text-base' : 'text-white'
                    }`}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-8 text-center">
            <div className="inline-block p-5 rounded-xl bg-dojo-dark/80 border border-dojo-gold/20">
              <p className="text-lg md:text-xl font-heading tracking-wider text-white mb-2">
                1 extra student per month pays for the entire system.
              </p>
              <p className="text-sm text-gray-400">
                3 extra students per month = <span className="text-dojo-gold font-bold">$5,400–$9,000</span> in
                annual revenue your San Diego school is currently losing.
              </p>
            </div>
          </div>
        </div>
        <RevenueChart />
        <RevenueDiagram />
        <RevenueInteractive />
      </div>
    </section>
  );
}
