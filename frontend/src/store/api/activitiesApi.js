import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import baseUrl  from '../../utils/baseUrl'

export const activitiesApi = createApi({
  reducerPath: 'activitiesApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'https://task-management-wsuy.onrender.com/api/activities',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token')
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    }
  }),
  endpoints: (builder) => ({
    getTaskActivities: builder.query({
      query: (taskId) => `/task/${taskId}`
    })
  }),
})

export const {
  useGetTaskActivitiesQuery
} = activitiesApi