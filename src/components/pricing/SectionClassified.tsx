import { ClassifiedChart, ClassifiedDiagram, ClassifiedInteractive } from '../visuals/ClassifiedVisuals';

export default function SectionClassified() {
  return (
    <section className="relative min-h-[80vh] overflow-hidden gi-texture flex items-center">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-dojo-red/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-dojo-gold/3 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-16 md:py-24">
        {/* Classified badge */}
        <div className="text-center mb-6">
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                       bg-dojo-red/10 border border-dojo-red/30 text-xs font-mono text-dojo-red font-bold tracking-wider animate-glow"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-dojo-red animate-pulse" />
            CLASSIFIED — NOW DECLASSIFIED
          </span>
        </div>

        {/* Main headline */}
        <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl text-white tracking-wide text-center mb-6 leading-tight">
          We Just Published the One Number
          <br />
          <span className="text-dojo-red">Every San Diego Dojo Owner</span>
          <br />
          Will Be Talking About This Month.
        </h1>

        <p className="text-center text-gray-400 text-base md:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
          For weeks, San Diego academy owners have been asking us the same question.
          Today, we're answering it — and the number might break your brain.
          Scroll down. But don't say we didn't warn you.
        </p>

        {/* Warning box */}
        <div className="max-w-xl mx-auto p-5 rounded-xl bg-dojo-dark/80 border border-dojo-red/20 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <svg
              className="w-5 h-5 text-dojo-red animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <span className="text-xs font-mono text-dojo-red uppercase tracking-widest font-bold">
              Content Warning
            </span>
          </div>
          <p className="text-sm text-gray-400">
            The pricing below has caused visible frustration among enrollment automation vendors
            across California. If you sell overpriced CRM retainers to martial arts schools,
            <strong className="text-white"> close this tab now.</strong>
          </p>
        </div>

        {/* Scroll indicator */}
        <div className="text-center mt-10">
          <div className="inline-flex flex-col items-center gap-2 text-gray-600">
            <span className="text-[10px] font-mono uppercase tracking-widest">
              Scroll to Declassify
            </span>
            <svg
              className="w-5 h-5 animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>
        <ClassifiedChart />
        <ClassifiedDiagram />
        <ClassifiedInteractive />
      </div>
    </section>
  );
}
