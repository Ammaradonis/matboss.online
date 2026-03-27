export default function SectionAutomationDiscipline() {
  const steps = [
    {
      num: '01',
      title: 'Trial Booked',
      desc: 'Lead books a trial class through your website or walk-in. MatBoss captures the data instantly.',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      ),
    },
    {
      num: '02',
      title: 'Smart Reminders',
      desc: 'Automated SMS + email reminders fire at optimal intervals: 24 hours, 2 hours, and 30 minutes before the trial.',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      ),
    },
    {
      num: '03',
      title: 'No-Show Recovery',
      desc: 'Missed the trial? The Enrollment Engine fires a recovery sequence within 15 minutes — new time options, zero guilt.',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      ),
    },
    {
      num: '04',
      title: 'Enrollment Follow-Up',
      desc: 'Trial attended? A structured follow-up sequence nurtures the lead to a paid enrollment — no manual work.',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      ),
    },
  ];

  return (
    <section className="py-20 md:py-28 px-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-dojo-gold/3 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-5xl mx-auto reveal">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-dojo-gold/10 border border-dojo-gold/20
                           text-[10px] font-mono text-dojo-gold uppercase tracking-widest mb-4">
            Problem #4
          </span>

          <h2 className="font-heading text-3xl md:text-5xl text-white tracking-wide mb-4 leading-tight max-w-3xl mx-auto">
            Automation Is Discipline.
            <span className="text-dojo-gold"> This Is Your Enrollment Engine.</span>
          </h2>

          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            In martial arts, you don't wing it. You drill. You repeat. You systematize.
            Your San Diego dojo's enrollment process deserves the same rigor.
            MatBoss is not a chatbot. It's a structured Enrollment Engine that sits on
            top of your existing booking software.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 gap-6">
          {steps.map((step) => (
            <div
              key={step.num}
              className="group relative p-6 rounded-xl bg-dojo-dark/60 border border-white/5
                         hover:border-dojo-gold/20 transition-all duration-300"
            >
              {/* Step Number */}
              <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-dojo-dark border-2 border-dojo-gold/30
                              flex items-center justify-center">
                <span className="text-xs font-mono text-dojo-gold font-bold">{step.num}</span>
              </div>

              <div className="flex items-start gap-4 ml-4">
                <div className="w-10 h-10 rounded-lg bg-dojo-gold/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-dojo-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {step.icon}
                  </svg>
                </div>
                <div>
                  <h3 className="font-heading text-lg tracking-wider text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Connector Line */}
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-dojo-dark/80 border border-dojo-gold/20">
            <svg className="w-5 h-5 text-dojo-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-sm text-gray-300">
              Works with <strong className="text-white">MindBody</strong>,{' '}
              <strong className="text-white">Zen Planner</strong>,{' '}
              <strong className="text-white">Kicksite</strong>,{' '}
              <strong className="text-white">PushPress</strong>, and more — no migration required.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
