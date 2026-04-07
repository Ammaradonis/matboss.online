export default function EnrollmentFlowSVG({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 800 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background */}
      <rect width="800" height="320" rx="8" fill="#111111" stroke="rgba(220,38,38,0.2)" strokeWidth="1" />

      {/* Title */}
      <text x="400" y="30" textAnchor="middle" fill="rgba(220,38,38,0.8)" fontSize="11" fontFamily="monospace" letterSpacing="3">
        ENROLLMENT FLOW — SYSTEM ARCHITECTURE
      </text>
      <line x1="100" y1="40" x2="700" y2="40" stroke="rgba(220,38,38,0.15)" strokeWidth="0.5" />

      {/* Stage 1: Lead */}
      <rect x="30" y="70" width="120" height="60" rx="4" fill="none" stroke="rgba(220,38,38,0.5)" strokeWidth="1.5" />
      <text x="90" y="95" textAnchor="middle" fill="white" fontSize="11" fontFamily="monospace" fontWeight="bold">LEAD IN</text>
      <text x="90" y="115" textAnchor="middle" fill="rgba(220,38,38,0.7)" fontSize="10" fontFamily="monospace">100/mo</text>

      {/* Arrow 1 */}
      <line x1="150" y1="100" x2="200" y2="100" stroke="rgba(220,38,38,0.4)" strokeWidth="1" markerEnd="url(#arrowRed)" />
      <text x="175" y="90" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="monospace">57%</text>

      {/* Stage 2: Trial Scheduled */}
      <rect x="200" y="70" width="120" height="60" rx="4" fill="none" stroke="rgba(220,38,38,0.4)" strokeWidth="1" />
      <text x="260" y="95" textAnchor="middle" fill="white" fontSize="10" fontFamily="monospace">TRIAL SCHED</text>
      <text x="260" y="115" textAnchor="middle" fill="rgba(220,38,38,0.6)" fontSize="10" fontFamily="monospace">57/mo</text>

      {/* Arrow 2 */}
      <line x1="320" y1="100" x2="370" y2="100" stroke="rgba(220,38,38,0.4)" strokeWidth="1" markerEnd="url(#arrowRed)" />
      <text x="345" y="90" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="monospace">60%</text>

      {/* Stage 3: Showed Up */}
      <rect x="370" y="70" width="120" height="60" rx="4" fill="none" stroke="rgba(212,160,23,0.4)" strokeWidth="1" />
      <text x="430" y="95" textAnchor="middle" fill="white" fontSize="10" fontFamily="monospace">SHOWED UP</text>
      <text x="430" y="115" textAnchor="middle" fill="rgba(212,160,23,0.6)" fontSize="10" fontFamily="monospace">34/mo</text>

      {/* Arrow 3 */}
      <line x1="490" y1="100" x2="540" y2="100" stroke="rgba(212,160,23,0.4)" strokeWidth="1" markerEnd="url(#arrowGold)" />
      <text x="515" y="90" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="monospace">35%</text>

      {/* Stage 4: Interested */}
      <rect x="540" y="70" width="120" height="60" rx="4" fill="none" stroke="rgba(212,160,23,0.3)" strokeWidth="1" />
      <text x="600" y="95" textAnchor="middle" fill="white" fontSize="10" fontFamily="monospace">INTERESTED</text>
      <text x="600" y="115" textAnchor="middle" fill="rgba(212,160,23,0.5)" fontSize="10" fontFamily="monospace">12/mo</text>

      {/* Arrow 4 */}
      <line x1="660" y1="100" x2="680" y2="100" stroke="rgba(212,160,23,0.3)" strokeWidth="1" />
      <line x1="680" y1="100" x2="680" y2="160" stroke="rgba(212,160,23,0.3)" strokeWidth="1" />
      <line x1="680" y1="160" x2="710" y2="160" stroke="rgba(212,160,23,0.3)" strokeWidth="1" markerEnd="url(#arrowGold)" />
      <text x="695" y="135" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="monospace">33%</text>

      {/* Stage 5: Enrolled */}
      <rect x="710" y="140" width="70" height="45" rx="4" fill="rgba(220,38,38,0.15)" stroke="rgba(220,38,38,0.6)" strokeWidth="1.5" />
      <text x="745" y="160" textAnchor="middle" fill="white" fontSize="10" fontFamily="monospace" fontWeight="bold">ENROLLED</text>
      <text x="745" y="175" textAnchor="middle" fill="rgba(220,38,38,0.8)" fontSize="11" fontFamily="monospace" fontWeight="bold">4/mo</text>

      {/* Leakage indicators */}
      <line x1="260" y1="130" x2="260" y2="200" stroke="rgba(220,38,38,0.2)" strokeWidth="0.5" strokeDasharray="3 3" />
      <text x="260" y="215" textAnchor="middle" fill="rgba(220,38,38,0.4)" fontSize="9" fontFamily="monospace">-43 LOST</text>
      <text x="260" y="228" textAnchor="middle" fill="rgba(220,38,38,0.25)" fontSize="8" fontFamily="monospace">no follow-up</text>

      <line x1="430" y1="130" x2="430" y2="200" stroke="rgba(220,38,38,0.2)" strokeWidth="0.5" strokeDasharray="3 3" />
      <text x="430" y="215" textAnchor="middle" fill="rgba(220,38,38,0.4)" fontSize="9" fontFamily="monospace">-23 NO-SHOW</text>
      <text x="430" y="228" textAnchor="middle" fill="rgba(220,38,38,0.25)" fontSize="8" fontFamily="monospace">no recovery</text>

      <line x1="600" y1="130" x2="600" y2="200" stroke="rgba(220,38,38,0.2)" strokeWidth="0.5" strokeDasharray="3 3" />
      <text x="600" y="215" textAnchor="middle" fill="rgba(220,38,38,0.4)" fontSize="9" fontFamily="monospace">-22 DROPPED</text>
      <text x="600" y="228" textAnchor="middle" fill="rgba(220,38,38,0.25)" fontSize="8" fontFamily="monospace">no engagement</text>

      {/* Bottom annotation */}
      <line x1="100" y1="270" x2="700" y2="270" stroke="rgba(220,38,38,0.1)" strokeWidth="0.5" />
      <text x="400" y="290" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="9" fontFamily="monospace">
        96% LEAKAGE RATE — $115,200/yr LOST REVENUE (AVG SAN DIEGO SCHOOL)
      </text>

      {/* Arrow markers */}
      <defs>
        <marker id="arrowRed" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(220,38,38,0.5)" />
        </marker>
        <marker id="arrowGold" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(212,160,23,0.5)" />
        </marker>
      </defs>
    </svg>
  );
}
