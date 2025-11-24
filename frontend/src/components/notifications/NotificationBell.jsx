import React from 'react';

export default function NotificationBell({ count = 0 }) {
  return (
    <div className="notification-bell">
      🔔{count > 0 && <span className="count">{count}</span>}
    </div>
  );
}
