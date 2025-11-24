import React from 'react'
import useNotifications from '../hooks/useNotifications'
import { NOTIFICATION_TYPES } from '../utils/constants'

const typeLabels = {
  [NOTIFICATION_TYPES.TASK_ASSIGNED]: 'Task Assigned',
  [NOTIFICATION_TYPES.TASK_UPDATED]: 'Task Updated',
  [NOTIFICATION_TYPES.COMMENT_ADDED]: 'New Comment',
  [NOTIFICATION_TYPES.DUE_DATE_REMINDER]: 'Due Date Reminder',
  [NOTIFICATION_TYPES.SYSTEM]: 'System'
}

const formatDate = (dateString) => {
  try {
    return new Date(dateString).toLocaleString()
  } catch {
    return dateString
  }
}

const Notifications = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    isMarkingRead,
    markAllAsRead
  } = useNotifications()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
          <p className="text-sm text-gray-500">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        <button
          onClick={markAllAsRead}
          disabled={unreadCount === 0 || isMarkingRead}
          className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Mark all as read
        </button>
      </div>

      {isLoading ? (
        <div className="rounded border border-gray-200 bg-white p-6 text-center text-gray-500">
          Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded border border-dashed border-gray-300 bg-white p-6 text-center text-gray-500">
          No notifications yet. Actions like task assignments or comments will appear here.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded border p-4 transition ${
                notification.isRead
                  ? 'border-gray-200 bg-white'
                  : 'border-blue-200 bg-blue-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {notification.message}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {formatDate(notification.createdAt)}
                  </p>
                </div>
                <span className="ml-4 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                  {typeLabels[notification.type] || notification.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Notifications