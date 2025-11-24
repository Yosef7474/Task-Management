import React from 'react';
import NotificationBell from '../components/notifications/NotificationBell';

export default function Notifications() {
  return (
    <div>
      <h1>Notifications</h1>
      <NotificationBell count={3} />
    </div>
  );
}
