export default function SectionDetonation() {
  const timeline = [
    {
      days: 'Day 1–3',
      title: 'System Mapping',
      description:
        'We audit your entire enrollment pipeline — every leak, every missed touchpoint, every dead-end follow-up. Nothing gets past the scan.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
          />
        </svg>
      ),
    },
    {
      days: 'Day 4–7',
      title: 'Engine Goes Live',
      description:
        'Automated reminders, recovery sequences, and follow-up flows activate. Your enrollment pipeline starts running on discipline instead of memory.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
    },
    {
      days: 'Day 8–14',
      title: 'First Recoveries Hit',
      description:
        'No-shows that would have vanished start responding. Trial students who ghosted get pulled back in. Revenue that was invisible starts appearing on your books.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      days: 'Day 15–30',
      title: 'Pipeline at Full Capacity',
      description:
        "Every trial booking is tracked. Every no-show is pursued. Every warm lead gets followed up. Your San Diego academy is running a system that most competitors don't even know exists.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-20 md:py-28 px-4 relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-dojo-gold/3 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-5xl mx-auto reveal">
        <div className="text-center mb-12">
          <span
            className="inline-block px-3 py-1 rounded-full bg-dojo-gold/10 border border-dojo-gold/20
                       text-[10px] font-mono text-dojo-gold uppercase tracking-widest mb-4"
          >
            Deployment Timeline
          </span>

          <h2 className="font-heading text-3xl md:text-5xl text-white tracking-wide mb-4 leading-tight max-w-3xl mx-auto">
            What Happens in the First 30 Days
            <span className="text-dojo-gold"> After You Pull the Trigger.</span>
          </h2>

          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            This isn't a 90-day onboarding nightmare. From the moment you deploy,
            the Enrollment Engine starts working. Here's the operational timeline.
          </p>
        </div>

        {/* Timeline */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-dojo-red/40 via-dojo-gold/20 to-transparent" />

            <div className="space-y-8">
              {timeline.map((step, i) => (
                <div key={i} className="relative pl-16">
                  {/* Icon circle */}
                  <div
                    className={`absolute left-0 w-12 h-12 rounded-full flex items-center justify-center ${
                      i === timeline.length - 1
                        ? 'bg-dojo-gold/20 text-dojo-gold border border-dojo-gold/30'
                        : 'bg-dojo-red/10 text-dojo-red border border-dojo-red/20'
                    }`}
                  >
                    {step.icon}
                  </div>

                  <div className="bg-dojo-dark/60 border border-white/5 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-mono text-dojo-red font-bold uppercase tracking-widest">
                        {step.days}
                      </span>
                      <div className="h-px flex-1 bg-white/5" />
                    </div>
                    <h3 className="font-heading text-lg tracking-wider text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
