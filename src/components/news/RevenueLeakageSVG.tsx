export default function RevenueLeakageSVG({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 800 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background */}
      <rect width="800" height="300" rx="8" fill="#111111" stroke="rgba(220,38,38,0.2)" strokeWidth="1" />

      {/* Title */}
      <text x="400" y="28" textAnchor="middle" fill="rgba(220,38,38,0.8)" fontSize="11" fontFamily="monospace" letterSpacing="3">
        REVENUE LEAKAGE — MONTHLY LOSS ANALYSIS
      </text>
      <line x1="100" y1="38" x2="700" y2="38" stroke="rgba(220,38,38,0.15)" strokeWidth="0.5" />

      {/* Bar chart — revenue stages */}
      {/* Full potential */}
      <rect x="80" y="60" width="640" height="28" rx="2" fill="rgba(220,38,38,0.08)" stroke="rgba(220,38,38,0.2)" strokeWidth="0.5" />
      <text x="90" y="78" fill="white" fontSize="10" fontFamily="monospace">POTENTIAL REVENUE</text>
      <text x="700" y="78" textAnchor="end" fill="rgba(220,38,38,0.6)" fontSize="10" fontFamily="monospace" fontWeight="bold">$240,000/yr</text>

      {/* After no-shows */}
      <rect x="80" y="98" width="410" height="28" rx="2" fill="rgba(220,38,38,0.12)" stroke="rgba(220,38,38,0.25)" strokeWidth="0.5" />
      <text x="90" y="116" fill="white" fontSize="10" fontFamily="monospace">AFTER NO-SHOW LOSS</text>
      <text x="474" y="116" textAnchor="end" fill="rgba(220,38,38,0.5)" fontSize="10" fontFamily="monospace">$153,600</text>
      {/* Loss indicator */}
      <rect x="490" y="98" width="230" height="28" rx="2" fill="none" stroke="rgba(220,38,38,0.15)" strokeWidth="0.5" strokeDasharray="3 3" />
      <text x="605" y="116" textAnchor="middle" fill="rgba(220,38,38,0.3)" fontSize="9" fontFamily="monospace">-$86,400 LEAKED</text>

      {/* After follow-up failure */}
      <rect x="80" y="136" width="260" height="28" rx="2" fill="rgba(220,38,38,0.18)" stroke="rgba(220,38,38,0.3)" strokeWidth="0.5" />
      <text x="90" y="154" fill="white" fontSize="10" fontFamily="monospace">AFTER FOLLOW-UP LOSS</text>
      <text x="326" y="154" textAnchor="end" fill="rgba(220,38,38,0.5)" fontSize="10" fontFamily="monospace">$96,000</text>
      <rect x="340" y="136" width="150" height="28" rx="2" fill="none" stroke="rgba(220,38,38,0.15)" strokeWidth="0.5" strokeDasharray="3 3" />
      <text x="415" y="154" textAnchor="middle" fill="rgba(220,38,38,0.3)" fontSize="9" fontFamily="monospace">-$57,600</text>

      {/* Actual captured */}
      <rect x="80" y="174" width="130" height="28" rx="2" fill="rgba(220,38,38,0.25)" stroke="rgba(220,38,38,0.5)" strokeWidth="1" />
      <text x="90" y="192" fill="white" fontSize="10" fontFamily="monospace" fontWeight="bold">CAPTURED</text>
      <text x="196" y="192" textAnchor="end" fill="rgba(220,38,38,0.8)" fontSize="10" fontFamily="monospace" fontWeight="bold">$48,000</text>
      <rect x="210" y="174" width="130" height="28" rx="2" fill="none" stroke="rgba(220,38,38,0.15)" strokeWidth="0.5" strokeDasharray="3 3" />
      <text x="275" y="192" textAnchor="middle" fill="rgba(220,38,38,0.3)" fontSize="9" fontFamily="monospace">-$48,000</text>

      {/* Efficiency label */}
      <line x1="80" y1="220" x2="720" y2="220" stroke="rgba(220,38,38,0.1)" strokeWidth="0.5" />

      {/* Recovery potential */}
      <text x="80" y="245" fill="rgba(212,160,23,0.7)" fontSize="10" fontFamily="monospace" letterSpacing="1">WITH AUTOMATED RECOVERY:</text>

      <rect x="80" y="255" width="400" height="28" rx="2" fill="rgba(212,160,23,0.08)" stroke="rgba(212,160,23,0.3)" strokeWidth="1" />
      <text x="90" y="273" fill="white" fontSize="10" fontFamily="monospace" fontWeight="bold">PROJECTED CAPTURE</text>
      <text x="462" y="273" textAnchor="end" fill="rgba(212,160,23,0.8)" fontSize="10" fontFamily="monospace" fontWeight="bold">$148,800/yr</text>
      <text x="490" y="273" fill="rgba(212,160,23,0.5)" fontSize="10" fontFamily="monospace">+210% vs manual</text>
    </svg>
  );
}
