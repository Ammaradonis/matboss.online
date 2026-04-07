import { useState, useEffect } from 'react';

interface Notification {
  type: 'new-post' | 'system' | 'insight';
  text: string;
}

const notifications: Notification[] = [
  { type: 'new-post', text: 'New: 2024 Enrollment Collapse Data' },
  { type: 'insight', text: 'No-show rate up 8% in Q3' },
  { type: 'system', text: 'System: 5 posts published' },
  { type: 'insight', text: '4hr window = 340% more conversions' },
  { type: 'new-post', text: 'Latest: Revenue Math Analysis' },
];

const typeConfig = {
  'new-post': { label: 'NEW POST', color: 'bg-dojo-red', textColor: 'text-dojo-red' },
  system: { label: 'SYSTEM', color: 'bg-blue-600', textColor: 'text-blue-400' },
  insight: { label: 'INSIGHT', color: 'bg-dojo-gold', textColor: 'text-dojo-gold' },
};

export default function NotificationRail() {
  const [visible, setVisible] = useState<number[]>([0, 1, 2]);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible((prev) => prev.map((i) => (i + 1) % notifications.length));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hidden xl:flex fixed right-0 top-1/3 z-40 flex-col gap-3 pr-3">
      {visible.map((notifIndex, i) => {
        const notif = notifications[notifIndex];
        const config = typeConfig[notif.type];
        return (
          <div
            key={`${notifIndex}-${i}`}
            className="flex items-start gap-2 bg-dojo-dark/95 border border-white/5 rounded-lg px-3 py-2.5 max-w-[200px] backdrop-blur-sm animate-fade-in"
          >
            <div className="flex-shrink-0 mt-0.5">
              <span className={`block w-1.5 h-1.5 rounded-full ${config.color} animate-pulse`} />
            </div>
            <div>
              <span className={`block text-[9px] font-mono font-bold ${config.textColor} tracking-wider mb-0.5`}>
                {config.label}
              </span>
              <span className="block text-[10px] text-gray-400 leading-tight">{notif.text}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
