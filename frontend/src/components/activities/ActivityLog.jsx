import React from 'react'
import { useGetTaskActivitiesQuery } from '../../store/api/activitiesApi'

const ActivityLog = ({ taskId }) => {
  const { data: activitiesData, isLoading } = useGetTaskActivitiesQuery(taskId)

  const activities = activitiesData?.data?.activities || []

  const getActivityIcon = (action) => {
    switch (action) {
      case 'TASK_CREATED': return '📝'
      case 'TASK_UPDATED': return '✏️'
      case 'TASK_ASSIGNED': return '👤'
      case 'TASK_COMPLETED': return '✅'
      case 'TASK_DELETED': return '🗑️'
      case 'COMMENT_ADDED': return '💬'
      case 'FILE_UPLOADED': return '📎'
      case 'STATUS_CHANGED': return '🔄'
      case 'PRIORITY_CHANGED': return '⚡'
      default: return '📋'
    }
  }

  const formatActivityMessage = (activity) => {
    const userName = activity.user?.name || 'System'
    
    switch (activity.action) {
      case 'TASK_CREATED':
        return `${userName} created this task`
      case 'TASK_UPDATED':
        return `${userName} updated the task`
      case 'TASK_ASSIGNED':
        return `${userName} assigned the task${activity.details ? ` to ${activity.details}` : ''}`
      case 'TASK_COMPLETED':
        return `${userName} marked the task as completed`
      case 'TASK_DELETED':
        return `${userName} deleted the task`
      case 'COMMENT_ADDED':
        return `${userName} added a comment`
      case 'FILE_UPLOADED':
        return `${userName} uploaded a file${activity.details ? `: ${activity.details}` : ''}`
      case 'STATUS_CHANGED':
        return `${userName} changed status to ${activity.details || 'unknown'}`
      case 'PRIORITY_CHANGED':
        return `${userName} changed priority to ${activity.details || 'unknown'}`
      default:
        return `${userName} performed ${activity.action}`
    }
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">Loading activities...</div>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">📋</div>
        <p>No activity yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Activity Log</h3>
      
      <div className="space-y-3">
        {activities.map((activity, index) => (
          <div key={activity.id} className="flex items-start space-x-3">
            {/* Timeline line */}
            {index !== activities.length - 1 && (
              <div className="absolute left-6 top-8 w-0.5 h-8 bg-gray-200 ml-4" />
            )}
            
            {/* Activity icon */}
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm">{getActivityIcon(activity.action)}</span>
            </div>
            
            {/* Activity content */}
            <div className="flex-1 min-w-0">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-800">
                  {formatActivityMessage(activity)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatTime(activity.createdAt)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ActivityLog