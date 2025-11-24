import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/authContext'

const Sidebar = () => {
  const location = useLocation()
  const { user } = useAuth()

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/tasks', label: user?.role === 'USER' ? 'My Tasks' : 'Tasks', icon: '✅' },
    ...(user?.role === 'ADMIN' || user?.role === 'MANAGER' 
      ? [{ path: '/users', label: user?.role === 'ADMIN' ? 'All Users' : 'Team Members', icon: '👥' }] 
      : []),
    { path: '/profile', label: 'Profile', icon: '👤' },
    { path: '/notifications', label: 'Notifications', icon: '🔔' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-4 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-medium">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-800">{user?.name}</p>
            <p className="text-sm text-gray-600 capitalize">{user?.role?.toLowerCase()}</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-4">
        <ul className="space-y-2 px-4">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

export default Sidebar