import React, { useState } from 'react'
import { useAuth } from '../context/authContext'
import { useGetAllTasksQuery, useGetMyTasksQuery } from '../store/api/tasksApi'
import { useGetTaskActivitiesQuery } from '../store/api/activitiesApi'

const ActivityLog = () => {
  const { user } = useAuth()
  const [selectedTask, setSelectedTask] = useState(null)
  const [timeFilter, setTimeFilter] = useState('all')

  // Fetch tasks based on user role
  const { data: allTasksData, isLoading: tasksLoading } = useGetAllTasksQuery(undefined, {
    skip: user.role === 'USER'
  })

  const { data: myTasksData } = useGetMyTasksQuery(undefined, {
    skip: user.role !== 'USER'
  })

  // Fetch activities for selected task
  const { data: activitiesData, isLoading: activitiesLoading } = useGetTaskActivitiesQuery(selectedTask, {
    skip: !selectedTask
  })

  const tasks = user.role === 'USER' ? myTasksData?.data?.tasks : allTasksData?.data?.tasks
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
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
    }
  }

  const filterActivitiesByTime = (activities) => {
    const now = new Date()
    const filterMap = {
      'today': () => activities.filter(activity => {
        const activityDate = new Date(activity.createdAt)
        return activityDate.toDateString() === now.toDateString()
      }),
      'week': () => activities.filter(activity => {
        const activityDate = new Date(activity.createdAt)
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return activityDate >= weekAgo
      }),
      'month': () => activities.filter(activity => {
        const activityDate = new Date(activity.createdAt)
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        return activityDate >= monthAgo
      }),
      'all': () => activities
    }

    return filterMap[timeFilter] ? filterMap[timeFilter]() : activities
  }

  const filteredActivities = filterActivitiesByTime(activities)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Activity Log</h1>
          <p className="text-gray-600">
            Track all activities and changes across tasks
            {selectedTask && ` for selected task`}
          </p>
        </div>

        {/* Time Filter */}
        <div className="flex items-center space-x-4">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">Today</option>
            <option value="week">Past Week</option>
            <option value="month">Past Month</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Task List Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Select Task</h3>
            
            {tasksLoading ? (
              <div className="text-center py-4">
                <div className="text-gray-500">Loading tasks...</div>
              </div>
            ) : tasks && tasks.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                <button
                  onClick={() => setSelectedTask(null)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    !selectedTask 
                      ? 'bg-blue-50 border-blue-200 text-blue-700' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">All Tasks</div>
                  <div className="text-sm text-gray-500">View activities from all tasks</div>
                </button>
                
                {tasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => setSelectedTask(task.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedTask === task.id
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium truncate">{task.title}</div>
                    <div className="text-sm text-gray-500 flex justify-between">
                      <span>#{task.id}</span>
                      <span className={`px-1 rounded text-xs ${
                        task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📝</div>
                <p>No tasks available</p>
              </div>
            )}
          </div>
        </div>

        {/* Activity Log */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">
                {selectedTask 
                  ? `Activities for Task #${selectedTask}` 
                  : 'All Activities'
                }
              </h3>
              <span className="text-sm text-gray-500">
                {filteredActivities.length} activities
              </span>
            </div>

            {activitiesLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-gray-500">Loading activities...</div>
              </div>
            ) : filteredActivities.length > 0 ? (
              <div className="space-y-4">
                {filteredActivities.map((activity, index) => (
                  <div key={activity.id} className="flex items-start space-x-4 relative">
                    {/* Timeline line */}
                    {index !== filteredActivities.length - 1 && (
                      <div className="absolute left-5 top-8 w-0.5 h-8 bg-gray-200" />
                    )}
                    
                    {/* Activity icon */}
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm">{getActivityIcon(activity.action)}</span>
                    </div>
                    
                    {/* Activity content */}
                    <div className="flex-1 min-w-0">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm font-medium text-gray-800">
                            {formatActivityMessage(activity)}
                          </p>
                          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                            {formatTime(activity.createdAt)}
                          </span>
                        </div>
                        
                        {/* Task reference */}
                        {!selectedTask && activity.taskId && (
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                              Task #{activity.taskId}
                            </span>
                          </div>
                        )}
                        
                        {/* Additional details */}
                        {activity.details && (
                          <div className="mt-2 p-2 bg-white rounded border text-sm text-gray-600">
                            {activity.details}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-2">📋</div>
                <p className="text-lg mb-2">No activities found</p>
                <p className="text-sm">
                  {selectedTask 
                    ? 'No activities recorded for this task yet' 
                    : 'No activities recorded in the selected time period'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-2xl font-bold text-blue-600">{tasks?.length || 0}</div>
          <div className="text-sm text-gray-600">Total Tasks</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-2xl font-bold text-green-600">
            {tasks?.filter(t => t.status === 'COMPLETED').length || 0}
          </div>
          <div className="text-sm text-gray-600">Completed Tasks</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-2xl font-bold text-purple-600">{activities.length}</div>
          <div className="text-sm text-gray-600">Total Activities</div>
        </div>
      </div>
    </div>
  )
}

export default ActivityLog