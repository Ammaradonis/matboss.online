const messages = [
  'Only 3 diagnosis slots left this week for San Diego schools',
  '2 San Diego BJJ academies booked this morning',
  'New: Enrollment leakage report available for San Diego dojos',
  'San Diego martial arts schools recovered 47 no-shows last month',
  'A Kearny Mesa dojo just locked in their Enrollment Engine',
  '92% of San Diego trial no-shows never rebook — unless automated',
  'Pacific Beach karate school added 6 students last month with MatBoss',
  'Limited availability — San Diego Leakage Diagnosis filling fast',
];

export default function FOMOTicker() {
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
