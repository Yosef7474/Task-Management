import React, { useState } from 'react'
import { useAuth } from '../../context/authContext'
import { useGetAllTasksQuery, useGetMyTasksQuery, useDeleteTaskMutation } from '../../store/api/tasksApi'
import { useGetTeamMembersQuery } from '../../store/api/usersApi'
import TaskForm from '../../components/tasks/TaskForm'
import TaskCard from '../../components/tasks/TaskCard'
import TaskFilters from '../../components/tasks/TaskFilters'

const Tasks = () => {
  const { user } = useAuth()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [filters, setFilters] = useState({})
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch tasks based on user role
  const { 
    data: allTasksData, 
    isLoading: allTasksLoading, 
    refetch: refetchAllTasks 
  } = useGetAllTasksQuery(undefined, {
    skip: user.role === 'USER'
  })

  const { 
    data: myTasksData, 
    isLoading: myTasksLoading, 
    refetch: refetchMyTasks 
  } = useGetMyTasksQuery()

  const { data: teamMembersData } = useGetTeamMembersQuery()
  const [deleteTask] = useDeleteTaskMutation()

  const isLoading = user.role === 'USER' ? myTasksLoading : allTasksLoading
  const tasks = user.role === 'USER' ? myTasksData?.data?.tasks : allTasksData?.data?.tasks

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId).unwrap()
        if (user.role === 'USER') {
          refetchMyTasks()
        } else {
          refetchAllTasks()
        }
      } catch (error) {
        console.error('Failed to delete task:', error)
      }
    }
  }

  const handleCreateSuccess = () => {
    setShowCreateForm(false)
    if (user.role === 'USER') {
      refetchMyTasks()
    } else {
      refetchAllTasks()
    }
  }

  const filteredTasks = tasks?.filter(task => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower)
      )
    }
    
    if (filters.status && task.status !== filters.status) return false
    if (filters.priority && task.priority !== filters.priority) return false
    if (
      filters.assignedTo &&
      !task.assignees?.some((assignment) => assignment.userId === parseInt(filters.assignedTo))
    ) {
      return false
    }
    
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {user.role === 'USER' ? 'My Tasks' : 'Tasks'}
          </h1>
          <p className="text-gray-600">
            {user.role === 'ADMIN' ? 'All system tasks' : 
             user.role === 'MANAGER' ? 'Tasks created by you' : 
             'Tasks assigned to you'}
          </p>
        </div>
        
        {(user.role === 'ADMIN' || user.role === 'MANAGER') && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Task
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <TaskFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={filters}
        onFiltersChange={setFilters}
        teamMembers={teamMembersData?.data?.users || []}
        userRole={user.role}
      />

      {/* Create Task Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <TaskForm
              onSuccess={handleCreateSuccess}
              onCancel={() => setShowCreateForm(false)}
              teamMembers={teamMembersData?.data?.users || []}
            />
          </div>
        </div>
      )}

      {/* Tasks List */}
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="text-lg">Loading tasks...</div>
        </div>
      ) : filteredTasks && filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => {
            const isUserAssignee = task.assignees?.some((assignment) => assignment.userId === user.id)
            return (
            <TaskCard
              key={task.id}
              task={task}
              onDelete={handleDeleteTask}
              canEdit={user.role !== 'USER' || isUserAssignee}
              canDelete={user.role !== 'USER' && task.createdById === user.id}
              userRole={user.role}
              teamMembers={teamMembersData?.data?.users || []}
            />
          )})}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || Object.keys(filters).length > 0 
              ? 'Try adjusting your search or filters'
              : user.role === 'USER' 
                ? 'You have no tasks assigned to you yet'
                : 'No tasks created yet'
            }
          </p>
          {(user.role === 'ADMIN' || user.role === 'MANAGER') && !showCreateForm && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create Your First Task
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default Tasks