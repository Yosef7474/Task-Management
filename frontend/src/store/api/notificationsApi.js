import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const notificationsApi = createApi({
  reducerPath: 'notificationsApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:5000/api/notifications',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token')
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    }
  }),
  tagTypes: ['Notification'],
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: () => '/',
      providesTags: ['Notification']
    }),
    markAsRead: builder.mutation({
      query: () => ({
        url: '/read',
        method: 'PATCH'
      }),
      invalidatesTags: ['Notification']
    })
  }),
})

export const {
  useGetNotificationsQuery,
  useMarkAsReadMutation
} = notificationsApi