import { useState, useEffect } from 'react';

const messages = [
  'San Diego dojos losing 30% of trial students weekly — enrollment systems outperform ads 3:1',
  'New data: 92% of trial no-shows never rebook without automated follow-up',
  'Average San Diego school loses $48,000/year to enrollment leakage',
  'Schools with automated recovery convert 340% more trials into members',
  'Enrollment collapse accelerating — Q3 2024 data now available',
];

export default function NewsAnnouncementBar() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % messages.length);
        setFade(true);
      }, 400);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-dojo-blood border-b border-dojo-red/30 px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
        <span className="flex-shrink-0 w-2 h-2 rounded-full bg-dojo-red animate-pulse" />
        <p
          className={`text-[11px] sm:text-xs font-mono text-white/90 text-center tracking-wide transition-opacity duration-300 ${
            fade ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {messages[index]}
        </p>
        <span className="flex-shrink-0 w-2 h-2 rounded-full bg-dojo-red animate-pulse" />
      </div>
    </div>
  );
}
