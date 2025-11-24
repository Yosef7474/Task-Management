import { configureStore } from '@reduxjs/toolkit'
import { authApi } from './api/authApi'
import { tasksApi } from './api/tasksApi'
import { usersApi } from './api/usersApi'
import { commentsApi } from './api/commentsApi'
import { attachmentsApi } from './api/attachmentsApi'
import { notificationsApi } from './api/notificationsApi'
import { activitiesApi } from './api/activitiesApi'
import { dashboardApi } from './api/dashboardApi'

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [tasksApi.reducerPath]: tasksApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [commentsApi.reducerPath]: commentsApi.reducer,
    [attachmentsApi.reducerPath]: attachmentsApi.reducer,
    [notificationsApi.reducerPath]: notificationsApi.reducer,
    [activitiesApi.reducerPath]: activitiesApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      tasksApi.middleware,
      usersApi.middleware,
      commentsApi.middleware,
      attachmentsApi.middleware,
      notificationsApi.middleware,
      activitiesApi.middleware,
      dashboardApi.middleware
    ),
})