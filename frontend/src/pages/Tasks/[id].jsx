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
        <div className="text-lg text-gray-600">Loading task details...</div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Task Not Found</h2>
        <p className="text-gray-600 mb-6">The task you're looking for doesn't exist or you don't have access.</p>
        <Link to="/tasks" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
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
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-3">Description</h3>
              <p className="text-gray-600 whitespace-pre-wrap bg-white p-4 rounded border border-gray-200">
                {task.description || 'No description provided.'}
              </p>
            </div>

            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-3">Task Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    task.status === 'COMPLETED' ? 'bg-green-100 text-green-800 border border-green-200' :
                    task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                    task.status === 'CANCELLED' ? 'bg-red-100 text-red-800 border border-red-200' :
                    'bg-yellow-100 text-yellow-800 border border-yellow-200'
                  }`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-700">Priority:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    task.priority === 'URGENT' ? 'bg-red-100 text-red-800 border border-red-200' :
                    task.priority === 'HIGH' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                    task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                    'bg-green-100 text-green-800 border border-green-200'
                  }`}>
                    {task.priority}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-700">Created by:</span>
                  <span className="text-gray-600">{task.createdBy.name}</span>
                </div>

                <div className="flex justify-between items-start py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-700">Assigned to:</span>
                  <span className="text-right text-gray-600">
                    {task.assignees?.length
                      ? task.assignees.map((assignment) => assignment.user.name).join(', ')
                      : 'Unassigned'}
                  </span>
                </div>

                {task.dueDate && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="font-medium text-gray-700">Due date:</span>
                    <span className={
                      new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED' 
                        ? 'text-red-600 font-medium' 
                        : 'text-gray-600'
                    }>
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-700">Created:</span>
                  <span className="text-gray-600">{new Date(task.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="font-medium text-gray-700">Last Updated:</span>
                  <span className="text-gray-600">{new Date(task.updatedAt).toLocaleDateString()}</span>
                </div>
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
    <div className="max-w-6xl mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Link to="/tasks" className="text-blue-600 hover:text-blue-800 mb-4 inline-block transition-colors">
            ← Back to Tasks
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">{task.title}</h1>
        </div>
        
        {/* Only show Edit Task button for ADMIN and MANAGER roles */}
        {(user.role === 'ADMIN' || user.role === 'MANAGER') && canEdit && (
          <button
            onClick={() => setShowEditForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
          >
            Edit Task
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
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
        <div className="p-6 bg-white">
          {renderTabContent()}
        </div>
      </div>

      {/* Edit Form Modal - Only show for ADMIN and MANAGER roles */}
      {showEditForm && (user.role === 'ADMIN' || user.role === 'MANAGER') && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-1">
              <TaskForm
                task={task}
                onSuccess={handleEditSuccess}
                onCancel={() => setShowEditForm(false)}
                teamMembers={teamMembersData?.data?.users || []}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TaskDetail