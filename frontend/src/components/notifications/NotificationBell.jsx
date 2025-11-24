import React from 'react'
import { useNavigate } from 'react-router-dom'
import useNotifications from '../../hooks/useNotifications'

export default function NotificationBell() {
  const navigate = useNavigate()
  const { unreadCount } = useNotifications()

  return (
    <button
      type="button"
      onClick={() => navigate('/notifications')}
      className="relative flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition"
      aria-label={`You have ${unreadCount} unread notifications`}
    >
      <span className="text-xl">🔔</span>
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white">
          {unreadCount}
        </span>
      )}
    </button>
  )
}
