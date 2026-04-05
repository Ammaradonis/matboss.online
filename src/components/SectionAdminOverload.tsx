import { AdminChart, AdminDiagram, AdminInteractive } from './visuals/AdminOverloadVisuals';

export default function SectionAdminOverload() {
  const tasks = [
    { label: 'Check voicemail for new inquiries', time: '15 min', wasted: true },
    { label: 'Manually text trial reminders', time: '20 min', wasted: true },
    { label: 'Chase no-shows via phone', time: '25 min', wasted: true },
    { label: 'Update spreadsheet with new leads', time: '10 min', wasted: true },
    { label: 'Follow up with trial attendees', time: '20 min', wasted: true },
    { label: 'Teach actual classes', time: '—', wasted: false },
  ];

  return (
    <section className="py-20 md:py-28 px-4 relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-dojo-gold/3 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto reveal">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Task List Visual */}
          <div className="order-2 md:order-1">
            <div className="bg-dojo-dark/60 border border-white/5 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
                <div className="w-2.5 h-2.5 rounded-full bg-dojo-red" />
                <div className="w-2.5 h-2.5 rounded-full bg-dojo-gold" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="ml-2 text-xs text-gray-600 font-mono">daily-admin-tasks.txt</span>
              </div>

              <div className="space-y-2">
                {tasks.map((task, i) => (
                  <div
                    key={i}
                    className={`flex flex-col gap-2 p-3 rounded-lg transition-all duration-500 sm:flex-row sm:items-center sm:justify-between ${
                      task.wasted
                        ? 'bg-dojo-red/5 border border-dojo-red/10'
                        : 'bg-green-500/5 border border-green-500/10'
                    }`}
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      {task.wasted ? (
                        <svg className="w-4 h-4 text-dojo-red flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      <span className={`text-sm ${task.wasted ? 'text-gray-400' : 'text-white font-medium'}`}>
                        {task.label}
                      </span>
                    </div>
                    <span className={`pl-7 text-xs font-mono sm:pl-0 ${task.wasted ? 'text-dojo-red' : 'text-green-500'}`}>
                      {task.time}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-col gap-1 border-t border-white/5 pt-3 text-left sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs text-gray-500">Daily admin time wasted</span>
                <span className="text-sm font-mono text-dojo-red font-bold">1 hr 30 min</span>
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div className="order-1 md:order-2">
            <span className="inline-block px-3 py-1 rounded-full bg-dojo-gold/10 border border-dojo-gold/20
                             text-[10px] font-mono text-dojo-gold uppercase tracking-widest mb-4">
              Problem #2
            </span>

            <h2 className="font-heading text-3xl md:text-5xl text-white tracking-wide mb-4 leading-tight">
              Black Belt Discipline.
              <span className="text-dojo-gold"> White Belt Systems.</span>
            </h2>

            <p className="text-gray-400 leading-relaxed mb-6">
              You spent years mastering your craft. You built a respected San Diego martial arts
              school from nothing. But your enrollment process? It's held together with sticky
              notes, memory, and hope.
            </p>

            <p className="text-gray-400 leading-relaxed mb-6">
              Every San Diego dojo owner I talk to is doing the same thing: manually texting
              reminders, calling no-shows between classes, and praying their front desk remembers
              to follow up. That's not a system. That's survival.
            </p>

            <div className="p-4 rounded-xl bg-dojo-gold/5 border border-dojo-gold/15">
              <p className="text-sm text-gray-300 italic">
                "I was spending 90 minutes a day on admin work that should have been automated.
                My San Diego BJJ academy was growing, but I was drowning."
              </p>
              <p className="text-xs text-gray-500 mt-2">
                — San Diego Academy Owner, 140 students
              </p>
            </div>
          </div>
        </div>
        <AdminChart />
        <AdminDiagram />
        <AdminInteractive />
      </div>
    </section>
  );
}
