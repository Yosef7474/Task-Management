import React, { useState } from 'react'
import { useAuth } from '../context/authContext'
import { useGetAllUsersQuery, useGetTeamMembersQuery, useUpdateUserRoleMutation } from '../store/api/usersApi'

const Users = () => {
  const { user: currentUser } = useAuth()
  const { data: allUsersData, isLoading: allUsersLoading, refetch: refetchAllUsers } = useGetAllUsersQuery(undefined, {
    skip: currentUser.role !== 'ADMIN'
  })
  const { data: teamMembersData, isLoading: teamMembersLoading, refetch: refetchTeamMembers } = useGetTeamMembersQuery()
  const [updateUserRole, { isLoading: updating }] = useUpdateUserRoleMutation()

  const [editingUser, setEditingUser] = useState(null)
  const [roleForm, setRoleForm] = useState({ role: '', isActive: true })

  const isLoading = currentUser.role === 'ADMIN' ? allUsersLoading : teamMembersLoading
  const users = currentUser.role === 'ADMIN' ? allUsersData?.data?.users : teamMembersData?.data?.users

  const handleEditClick = (user) => {
    setEditingUser(user.id)
    setRoleForm({ role: user.role, isActive: user.isActive })
  }

  const handleRoleUpdate = async (userId) => {
    try {
      await updateUserRole({ id: userId, ...roleForm }).unwrap()
      setEditingUser(null)
      if (currentUser.role === 'ADMIN') {
        refetchAllUsers()
      } else {
        refetchTeamMembers()
      }
    } catch (error) {
      console.error('Failed to update user:', error)
    }
  }

  const handleCancelEdit = () => {
    setEditingUser(null)
    setRoleForm({ role: '', isActive: true })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading users...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {currentUser.role === 'ADMIN' ? 'All Users' : 'Team Members'}
        </h1>
        {currentUser.role === 'ADMIN' && (
          <span className="text-sm text-gray-600 bg-blue-100 px-3 py-1 rounded-full">
            Admin View
          </span>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                {currentUser.role === 'ADMIN' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users?.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-sm font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingUser === user.id ? (
                      <select
                        value={roleForm.role}
                        onChange={(e) => setRoleForm({ ...roleForm, role: e.target.value })}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="USER">User</option>
                        <option value="MANAGER">Manager</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    ) : (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'MANAGER' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    )}
                  </td>
                  {currentUser.role === 'ADMIN' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingUser === user.id ? (
                          <select
                            value={roleForm.isActive}
                            onChange={(e) => setRoleForm({ ...roleForm, isActive: e.target.value === 'true' })}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          >
                            <option value={true}>Active</option>
                            <option value={false}>Inactive</option>
                          </select>
                        ) : (
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {editingUser === user.id ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleRoleUpdate(user.id)}
                              disabled={updating}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEditClick(user)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(!users || users.length === 0) && (
        <div className="text-center py-8 text-gray-500">
          No users found
        </div>
      )}
    </div>
  )
}

export default Users