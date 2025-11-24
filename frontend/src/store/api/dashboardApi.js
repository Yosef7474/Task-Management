import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import baseUrl  from '../../utils/baseUrl'

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'https://task-management-wsuy.onrender.com/api/dashboard',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token')
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    }
  }),
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: () => '/stats'
    })
  }),
})

export const {
  useGetDashboardStatsQuery
} = dashboardApi