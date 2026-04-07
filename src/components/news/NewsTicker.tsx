const headlines = [
  'BREAKING: 23% of San Diego martial arts schools closed since 2019',
  'ANALYSIS: Cost per enrollment reaches $500 for manual-process schools',
  'DATA: 4-hour follow-up window determines 67% of trial conversions',
  'REPORT: Automated schools growing 15% while industry shrinks 22%',
  'INSIGHT: $2.3B spent on martial arts marketing — 96% wasted on leakage',
  'ALERT: No-show recovery gap widening between automated and manual schools',
  'UPDATE: Average student lifetime value in San Diego now $2,400',
  'TREND: Top-quartile schools share one trait — automated enrollment systems',
];

export default function NewsTicker() {
  const doubled = [...headlines, ...headlines];

  return (
    <div className="bg-dojo-dark/80 border-b border-dojo-red/10 py-2 overflow-hidden whitespace-nowrap">
      <div className="inline-block animate-ticker">
        {doubled.map((headline, i) => (
          <span
            key={i}
            className="mx-6 sm:mx-10 inline-flex items-center text-[10px] sm:text-[11px] font-mono tracking-wide"
          >
            <span className="text-dojo-red font-bold mr-2">{headline.split(':')[0]}:</span>
            <span className="text-gray-500">{headline.split(':').slice(1).join(':')}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
