export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="py-12 px-4 bg-dojo-dark/50 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
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
          <div>
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
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Get in Touch
            </h4>
            <ul className="space-y-2 text-xs text-gray-500">
              <li>
                <a href="mailto:alkhederammar147@gmail.com" className="hover:text-white transition-colors">
                  alkhederammar147@gmail.com
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
            <a href="mailto:alkhederammar147@gmail.com" className="text-dojo-red hover:underline">
              alkhederammar147@gmail.com
            </a>{' '}
            with your Booking ID for any changes.
          </p>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5">
          <p className="text-[10px] text-gray-600">
            &copy; {year} MatBoss. All rights reserved. San Diego, CA.
          </p>
          <p className="text-[10px] text-gray-700">
            Built for San Diego martial arts school owners who refuse to leave money on the mat.
          </p>
        </div>
      </div>
    </footer>
  );
}
