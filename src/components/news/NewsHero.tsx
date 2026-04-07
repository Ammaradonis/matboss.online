import { Link } from 'react-router-dom';
import HeroBackgroundSVG from './HeroBackgroundSVG';
import EnrollmentFlowSVG from './EnrollmentFlowSVG';

export default function NewsHero() {
  return (
    <section className="relative overflow-hidden min-h-[520px] flex items-center">
      <HeroBackgroundSVG />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-8 bg-dojo-red/60" />
              <span className="text-[10px] font-mono text-dojo-red tracking-[0.3em] uppercase">
                Intelligence Feed
              </span>
            </div>

            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl text-white leading-[0.9] mb-6 tracking-tight">
              MATBOSS
              <br />
              <span className="text-dojo-red">NEWS</span>
            </h1>

            <p className="text-gray-400 text-sm sm:text-base max-w-lg leading-relaxed mb-8 font-body">
              Enrollment data. System intelligence. Revenue analysis.
              <br />
              The operational feed for San Diego martial arts schools
              that refuse to lose students to broken processes.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-dojo-red/10 border border-dojo-red/30 rounded text-xs font-mono text-dojo-red hover:bg-dojo-red/20 transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-dojo-red animate-pulse" />
                Book Diagnosis Call
              </Link>
              <a
                href="#posts"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/10 rounded text-xs font-mono text-gray-400 hover:text-white hover:border-white/20 transition-colors"
              >
                Browse All Posts
                <span className="text-[10px]">↓</span>
              </a>
            </div>
          </div>

          {/* Right: System Diagram */}
          <div className="hidden lg:block">
            <EnrollmentFlowSVG className="w-full opacity-80" />
          </div>
        </div>
      </div>
    </section>
  );
}
