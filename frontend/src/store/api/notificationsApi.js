import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { getSocket } from '../../utils/socket'
import baseUrl  from '../../utils/baseUrl'

export const notificationsApi = createApi({
  reducerPath: 'notificationsApi',
  baseQuery: fetchBaseQuery({ 
  baseUrl: 'https://task-management-wsuy.onrender.com/api/notifications',
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
      providesTags: ['Notification'],
      async onCacheEntryAdded(_, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        const token = localStorage.getItem('token')
        if (!token) return

        await cacheDataLoaded

        const socket = getSocket(token)
        const handleNotification = (notification) => {
          updateCachedData((draft) => {
            if (!draft) return

            if (draft.data?.notifications) {
              draft.data.notifications.unshift(notification)
            } else if (draft.notifications) {
              draft.notifications.unshift(notification)
            } else if (draft.data) {
              draft.data.notifications = [notification]
            } else {
              draft.notifications = [notification]
            }
          })
        }

        socket?.on('notification:new', handleNotification)

        await cacheEntryRemoved

        socket?.off('notification:new', handleNotification)
      }
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