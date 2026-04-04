import { DirtySecretChart, DirtySecretDiagram, DirtySecretInteractive } from '../visuals/DirtySecretVisuals';

export default function SectionDirtySecret() {
  const competitors = [
    {
      name: 'Generic CRM Retainer',
      price: '$500 – $800/mo',
      note: 'Plus $2,000+ setup fee',
      highlight: false,
    },
    {
      name: 'Marketing Agency Package',
      price: '$1,500 – $3,000/mo',
      note: '6-month contract minimum',
      highlight: false,
    },
    {
      name: 'Custom Automation Build',
      price: '$5,000 – $15,000',
      note: 'One-time build, no ongoing support',
      highlight: false,
    },
    {
      name: 'Enterprise SaaS Platform',
      price: '$300 – $600/mo',
      note: 'Built for generic gyms, not dojos',
      highlight: false,
    },
    {
      name: 'MatBoss Enrollment Engine',
      price: '$197/mo',
      note: 'Purpose-built. San Diego. Done.',
      highlight: true,
    },
  ];

  return (
    <section className="py-20 md:py-28 px-4 relative overflow-hidden">
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-dojo-gold/3 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-5xl mx-auto reveal">
        <div className="text-center mb-12">
          <span
            className="inline-block px-3 py-1 rounded-full bg-dojo-gold/10 border border-dojo-gold/20
                       text-[10px] font-mono text-dojo-gold uppercase tracking-widest mb-4"
          >
            Industry Expos&eacute;
          </span>

          <h2 className="font-heading text-3xl md:text-5xl text-white tracking-wide mb-4 leading-tight max-w-3xl mx-auto">
            Every Enrollment Vendor in California
            <span className="text-dojo-gold"> Hopes You Never See This Page.</span>
          </h2>

          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Here is what San Diego martial arts schools are actually being charged
            for enrollment automation. We pulled these numbers from real contracts,
            real invoices, and real frustration.
          </p>
        </div>

        {/* Comparison table */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="bg-dojo-dark/60 border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-white/5 bg-dojo-carbon/50">
              <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest">
                Enrollment Automation — True Cost Comparison
              </h3>
            </div>

            <div className="divide-y divide-white/5">
              {competitors.map((item, i) => (
                <div
                  key={i}
                  className={`px-5 py-4 ${
                    item.highlight ? 'bg-dojo-red/8 border-l-2 border-l-dojo-red' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-sm font-semibold ${
                        item.highlight ? 'text-white' : 'text-gray-400'
                      }`}
                    >
                      {item.name}
                    </span>
                    <span
                      className={`text-sm font-mono font-bold ${
                        item.highlight ? 'text-dojo-red text-base' : 'text-white'
                      }`}
                    >
                      {item.price}
                    </span>
                  </div>
                  <div
                    className={`text-xs ${
                      item.highlight ? 'text-dojo-gold font-semibold' : 'text-gray-600'
                    }`}
                  >
                    {item.note}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Callout */}
        <div className="max-w-xl mx-auto text-center">
          <div className="p-5 rounded-xl bg-dojo-dark/80 border border-dojo-gold/20">
            <p className="text-lg md:text-xl font-heading tracking-wider text-white mb-2">
              The question isn't "can you afford MatBoss."
            </p>
            <p className="text-sm text-gray-400">
              The question is: how much longer can you afford
              <span className="text-dojo-red font-bold"> to pay 3x–10x more for less?</span>
            </p>
          </div>
        </div>
        <DirtySecretChart />
        <DirtySecretDiagram />
        <DirtySecretInteractive />
      </div>
    </section>
  );
}
