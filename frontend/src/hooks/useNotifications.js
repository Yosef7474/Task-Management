import { useMemo } from 'react'
import {
  useGetNotificationsQuery,
  useMarkAsReadMutation
} from '../store/api/notificationsApi'

const useNotifications = () => {
  const token = localStorage.getItem('token')

  const {
    data,
    isLoading,
    isFetching,
    refetch
  } = useGetNotificationsQuery(undefined, {
    skip: !token
  })

  const [markAsRead, { isLoading: markLoading }] = useMarkAsReadMutation()
  const notifications = data?.data?.notifications || data?.notifications || []
  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  )

  const markAllAsRead = async () => {
    if (!notifications.length) return

    try {
      await markAsRead().unwrap()
      await refetch()
    } catch (error) {
      console.error('Failed to mark notifications as read', error)
    }
  }

  return {
    notifications,
    unreadCount,
    isLoading: isLoading || isFetching,
    isMarkingRead: markLoading,
    markAllAsRead
  }
}

export default useNotifications

