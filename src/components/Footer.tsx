import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 bg-dojo-dark/50 px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div className="text-center md:text-left">
            <div className="mb-3 flex items-center justify-center gap-2 md:justify-start">
              <div className="w-8 h-8 rounded-lg bg-dojo-red flex items-center justify-center">
                <span className="font-heading text-white text-sm">M</span>
              </div>
              <span className="font-heading text-lg tracking-wider text-white">MatBoss</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Enrollment Automation for San Diego Martial Arts Schools.
              We increase paid enrollments without increasing your ad spend.
            </p>
          </div>

          {/* Quick Reference */}
          <div className="text-center md:text-left">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              For San Diego Dojos
            </h4>
            <ul className="space-y-2 text-xs text-gray-500">
              <li>Trial Booking Automation</li>
              <li>No-Show Recovery System</li>
              <li>Enrollment Follow-Up Engine</li>
              <li>Works With Your Existing Software</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="text-center md:text-left">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Get in Touch
            </h4>
            <ul className="space-y-2 text-xs text-gray-500">
              <li>
                <a href="mailto:info@matboss.online" className="hover:text-white transition-colors">
                  info@matboss.online
                </a>
              </li>
              <li>
                <a href="tel:+16197529618" className="hover:text-white transition-colors">
                  (619) 752-9618
                </a>
              </li>
              <li>San Diego, California</li>
              <li>
                <a href="#booking" className="text-dojo-red hover:text-white transition-colors font-medium">
                  Book a Leakage Diagnosis Call
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Booking ID Reference */}
        <div className="py-4 px-5 rounded-xl bg-dojo-carbon/50 border border-white/5 mb-6">
          <p className="text-xs text-gray-500">
            <strong className="text-gray-400">Have a Booking ID?</strong> Your booking reference
            follows the format <span className="font-mono text-dojo-gold">MAT-YYYYMMDD-XXXX</span>.
            Keep this ID for rescheduling or reference. Contact us at{' '}
            <a href="mailto:info@matboss.online" className="text-dojo-red hover:underline">
              info@matboss.online
            </a>{' '}
            with your Booking ID for any changes.
          </p>
        </div>

        {/* Bottom */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-4 text-center md:flex-row md:text-left">
          <div className="text-[10px] text-gray-600">
            <p>&copy; {year} Ammar Alkheder. All rights reserved. San Diego, CA.</p>
            <p>Austrian Sole Proprietor Operating under MatBoss Brand. Austrian Business Register: Gewerbeinformationssystem Austria - GISA. Registration Number: 39216625</p>
            <a
              href="https://www.gisa.gv.at/fshost-gisa-p/user/formular.aspx?pid=3e8b81d122df415db65b1ec312d5a452&pn=Be2102a48c44b427fa29b85296c7f6b3f#scrollid1"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block rounded border border-gray-600 px-3 py-1 text-[10px] text-gray-400 transition-colors hover:border-white hover:text-white"
            >
              Verify Legal Status NOW
            </a>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/terms" className="text-[10px] text-gray-600 hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link to="/privacy" className="text-[10px] text-gray-600 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/dmarc" className="text-[10px] text-gray-600 hover:text-white transition-colors">
              DMARC Policy
            </Link>
          </div>
          <p className="max-w-xs text-[10px] text-gray-700 md:text-right">
            Built for San Diego martial arts school owners who refuse to leave money on the mat.
          </p>
        </div>
      </div>
    </footer>
  );
}
