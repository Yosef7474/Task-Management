import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const activitiesApi = createApi({
  reducerPath: 'activitiesApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:3000/api/activities',
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