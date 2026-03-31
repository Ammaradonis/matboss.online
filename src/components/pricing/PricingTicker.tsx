const messages = [
  'ALERT: Founding rate locked for first 10 San Diego schools only',
  '3 San Diego academies deployed their Enrollment Engine this week',
  'WARNING: Setup fee waiver expires when founding slots fill',
  'Chula Vista MMA gym recovered 11 students in first 30 days',
  'INTEL: Average San Diego dojo recoups MatBoss cost in 6 days',
  'BREAKING: 4 founding slots remaining at $197/mo rate',
  'La Jolla Jiu-Jitsu academy locked in — deployment begins Monday',
  'DATA: 94% of deployed schools see ROI within first billing cycle',
];

export default function PricingTicker() {
  const doubled = [...messages, ...messages];

  return (
    <div className="bg-dojo-dark border-b border-dojo-red/20 py-1.5 fomo-ticker">
      <div className="fomo-ticker-content">
        {doubled.map((msg, i) => (
          <span key={i} className="inline-flex items-center mx-8 text-xs text-gray-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-dojo-red mr-2 animate-pulse" />
            {msg}
          </span>
        ))}
      </div>
    </div>
  );
}
