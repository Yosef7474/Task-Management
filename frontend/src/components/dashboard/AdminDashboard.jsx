import React from 'react'
import { Link } from 'react-router-dom'

const AdminDashboard = ({ data }) => {
  const { stats, recentTasks } = data || {}

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
          <p className="text-3xl font-bold text-gray-900">{stats?.userCount || 0}</p>
          <Link to="/users" className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block">
            Manage Users →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <h3 className="text-lg font-semibold text-gray-700">Total Tasks</h3>
          <p className="text-3xl font-bold text-gray-900">{stats?.totalTasks || 0}</p>
          <Link to="/tasks" className="text-green-600 hover:text-green-800 text-sm mt-2 inline-block">
            View All Tasks →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <h3 className="text-lg font-semibold text-gray-700">Completed Tasks</h3>
          <p className="text-3xl font-bold text-gray-900">{stats?.completedTasks || 0}</p>
          <p className="text-sm text-gray-600 mt-1">
            {stats?.totalTasks ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}% completion rate
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
          <h3 className="text-lg font-semibold text-gray-700">Overdue Tasks</h3>
          <p className="text-3xl font-bold text-gray-900">{stats?.overdueTasks || 0}</p>
          <p className="text-sm text-red-600 mt-1">Requires attention</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/users"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <div className="text-blue-500 text-2xl mb-2">👥</div>
            <h3 className="font-medium text-gray-700">Manage Users</h3>
            <p className="text-sm text-gray-500">View and manage all system users</p>
          </Link>

          <Link
            to="/tasks"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <div className="text-green-500 text-2xl mb-2">✅</div>
            <h3 className="font-medium text-gray-700">All Tasks</h3>
            <p className="text-sm text-gray-500">View all tasks in the system</p>
          </Link>

          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <div className="text-purple-500 text-2xl mb-2">📊</div>
            <h3 className="font-medium text-gray-700">System Analytics</h3>
            <p className="text-sm text-gray-500">View system-wide analytics</p>
          </div>
        </div>
      </div>

      {/* Recent Tasks */}
      {recentTasks && recentTasks.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Tasks</h2>
          <div className="space-y-3">
            {recentTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-800">{task.title}</h4>
                  <p className="text-sm text-gray-600">
                    Created by: {task.createdBy.name} | Assigned to:{' '}
                    {task.assignees?.length
                      ? task.assignees.map((assignment) => assignment.user.name).join(', ')
                      : 'Unassigned'}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                  task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard