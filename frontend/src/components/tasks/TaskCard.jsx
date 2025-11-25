import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import TaskForm from './TaskForm'

const TaskCard = ({ task, onDelete, canEdit, canDelete, userRole, teamMembers }) => {
  const [showEditForm, setShowEditForm] = useState(false)

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800 border-red-200'
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  const handleEditSuccess = () => {
    setShowEditForm(false)
  }

  const assignedUsers = task.assignees?.map((assignment) => assignment.user) || []

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        <div className="p-4">
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold text-gray-800 text-lg line-clamp-2">
              {task.title}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-3">
              {task.description}
            </p>
          )}

          {/* Metadata */}
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                {task.status.replace('_', ' ')}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Created by:</span>
              <span className="font-medium">{task.createdBy.name}</span>
            </div>

            <div className="flex justify-between">
              <span>Assigned to:</span>
              <span className="font-medium text-right">
                {assignedUsers.length
                  ? assignedUsers.map((user) => user.name).join(', ')
                  : 'Unassigned'}
              </span>
            </div>

            {task.dueDate && (
              <div className="flex justify-between">
                <span>Due date:</span>
                <span className={`font-medium ${
                  new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED' 
                    ? 'text-red-600' 
                    : 'text-gray-800'
                }`}>
                  {new Date(task.dueDate).toLocaleDateString()}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Comments:</span>
              <span className="font-medium">{task.comments?.length || 0}</span>
            </div>

            <div className="flex justify-between">
              <span>Attachments:</span>
              <span className="font-medium">{task.attachments?.length || 0}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200">
            <Link
              to={`/tasks/${task.id}`}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
            >
              View Details
            </Link>
            
            <div className="flex space-x-2">
              {/* Only show Edit button for ADMIN and MANAGER roles */}
              {canEdit && (userRole === 'ADMIN' || userRole === 'MANAGER') && (
                <button
                  onClick={() => setShowEditForm(true)}
                  className="text-green-600 hover:text-green-800 text-sm transition-colors"
                >
                  Edit
                </button>
              )}
              
              {canDelete && (
                <button
                  onClick={() => onDelete(task.id)}
                  className="text-red-600 hover:text-red-800 text-sm transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form Modal - Only show for ADMIN and MANAGER roles */}
      {showEditForm && (userRole === 'ADMIN' || userRole === 'MANAGER') && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-1">
              <TaskForm
                task={task}
                onSuccess={handleEditSuccess}
                onCancel={() => setShowEditForm(false)}
                teamMembers={teamMembers}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default TaskCard