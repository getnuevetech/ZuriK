import React from 'react';

interface ActivityEvent {
  id: string;
  label: string;
  timestamp: string;
  icon?: string;
}

interface ActivityFeedProps {
  events: ActivityEvent[];
  emptyMessage?: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function ActivityFeed({ events, emptyMessage = 'No recent activity.' }: ActivityFeedProps) {
  if (!events.length) {
    return <p className="text-sm text-neutral-500 py-4">{emptyMessage}</p>;
  }

  return (
    <ul className="space-y-3">
      {events.map((event) => (
        <li key={event.id} className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-sm">
            {event.icon || '•'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-neutral-700">{event.label}</p>
            <p className="text-xs text-neutral-400 mt-0.5">{timeAgo(event.timestamp)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
