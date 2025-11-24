import React from 'react'
import { useAuth } from '../context/authContext'
import { useGetDashboardStatsQuery } from '../store/api/dashboardApi'
import AdminDashboard from '../components/dashboard/AdminDashboard'
import ManagerDashboard from '../components/dashboard/ManagerDashboard'
import UserDashboard from '../components/dashboard/UserDashboard'

const Dashboard = () => {
  const { user } = useAuth()
  const { data: dashboardData, isLoading } = useGetDashboardStatsQuery()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    )
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'ADMIN':
        return <AdminDashboard data={dashboardData?.data} />
      case 'MANAGER':
        return <ManagerDashboard data={dashboardData?.data} />
      case 'USER':
        return <UserDashboard data={dashboardData?.data} />
      default:
        return <UserDashboard data={dashboardData?.data} />
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {user.role === 'ADMIN' ? 'Admin Dashboard' : 
         user.role === 'MANAGER' ? 'Manager Dashboard' : 'My Dashboard'}
      </h1>
      {renderDashboard()}
    </div>
  )
}

export default Dashboard