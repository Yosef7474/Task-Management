import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../../context/authContext'
import { useGetTaskByIdQuery, useGetMyTaskByIdQuery } from '../../store/api/tasksApi'
import { useGetTaskCommentsQuery } from '../../store/api/commentsApi'
import { useGetTaskAttachmentsQuery } from '../../store/api/attachmentsApi'
import { useGetTeamMembersQuery } from '../../store/api/usersApi'
import TaskForm from '../../components/tasks/TaskForm'
import CommentSection from '../../components/comments/CommentSection'
import AttachmentList from '../../components/attachments/AttachmentList'
import ActivityLog from '../../pages/ActivityLog'

const TaskDetail = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('details')
  const [showEditForm, setShowEditForm] = useState(false)

  // Use appropriate query based on user role
  const { data: taskData, isLoading, refetch: refetchTask } = user.role === 'USER' 
    ? useGetMyTaskByIdQuery(id)
    : useGetTaskByIdQuery(id)

  const { data: commentsData, refetch: refetchComments } = useGetTaskCommentsQuery(id)
  const { data: attachmentsData, refetch: refetchAttachments } = useGetTaskAttachmentsQuery(id)
  const { data: teamMembersData } = useGetTeamMembersQuery(undefined, {
    skip: user.role === 'USER'
  })

  const task = taskData?.data?.task
  const comments = commentsData?.data?.comments || []
  const attachments = attachmentsData?.data?.attachments || []

  const isUserAssignee = task?.assignees?.some((assignment) => assignment.userId === user.id)
  const canEdit = user.role !== 'USER' || isUserAssignee

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading task details...</div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Task Not Found</h2>
        <p className="text-gray-600 mb-6">The task you're looking for doesn't exist or you don't have access.</p>
        <Link to="/tasks" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Back to Tasks
        </Link>
      </div>
    )
  }

  const handleEditSuccess = () => {
    setShowEditForm(false)
    refetchTask()
  }

  const tabs = [
    { id: 'details', label: 'Details', icon: '📋' },
    { id: 'comments', label: `Comments (${comments.length})`, icon: '💬' },
    { id: 'attachments', label: `Files (${attachments.length})`, icon: '📎' },
    { id: 'activity', label: 'Activity', icon: '🕒' },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'details':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
              <p className="text-gray-600 whitespace-pre-wrap">
                {task.description || 'No description provided.'}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                  task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                  task.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="font-medium">Priority:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  task.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                  task.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                  task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {task.priority}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="font-medium">Created by:</span>
                <span>{task.createdBy.name}</span>
              </div>

              <div className="flex justify-between">
                <span className="font-medium">Assigned to:</span>
                <span className="text-right">
                  {task.assignees?.length
                    ? task.assignees.map((assignment) => assignment.user.name).join(', ')
                    : 'Unassigned'}
                </span>
              </div>

              {task.dueDate && (
                <div className="flex justify-between">
                  <span className="font-medium">Due date:</span>
                  <span className={
                    new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED' 
                      ? 'text-red-600 font-medium' 
                      : ''
                  }>
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="font-medium">Created:</span>
                <span>{new Date(task.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="flex justify-between">
                <span className="font-medium">Last Updated:</span>
                <span>{new Date(task.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        )
      
      case 'comments':
        return (
          <CommentSection 
            taskId={id} 
            comments={comments} 
            onCommentAdded={refetchComments}
          />
        )
      
      case 'attachments':
        return (
          <AttachmentList
            taskId={id}
            attachments={attachments}
            onAttachmentChange={refetchAttachments}
          />
        )
      
      case 'activity':
        return <ActivityLog taskId={id} />
      
      default:
        return null
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Link to="/tasks" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Tasks
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">{task.title}</h1>
        </div>
        
        {canEdit && (
          <button
            onClick={() => setShowEditForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Edit Task
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>

      {/* Edit Form Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <TaskForm
              task={task}
              onSuccess={handleEditSuccess}
              onCancel={() => setShowEditForm(false)}
              teamMembers={teamMembersData?.data?.users || []}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default TaskDetail