import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const tasksApi = createApi({
  reducerPath: 'tasksApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:3000/api/tasks',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token')
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    }
  }),
  tagTypes: ['Task'],
  endpoints: (builder) => ({
    // User tasks
    getMyTasks: builder.query({
      query: () => '/my-tasks',
      providesTags: ['Task']
    }),
    getMyTaskById: builder.query({
      query: (id) => `/my-tasks/${id}`,
      providesTags: ['Task']
    }),
    updateMyTask: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: `/my-tasks/${id}`,
        method: 'PUT',
        body: updates
      }),
      invalidatesTags: ['Task']
    }),

    // Manager/Admin tasks
    getAllTasks: builder.query({
      query: () => '/',
      providesTags: ['Task']
    }),
    getTaskById: builder.query({
      query: (id) => `/${id}`,
      providesTags: ['Task']
    }),
    createTask: builder.mutation({
      query: (taskData) => ({
        url: '/',
        method: 'POST',
        body: taskData
      }),
      invalidatesTags: ['Task']
    }),
    updateTask: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: updates
      }),
      invalidatesTags: ['Task']
    }),
    deleteTask: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Task']
    })
  }),
})

export const { 
  useGetMyTasksQuery,
  useGetMyTaskByIdQuery,
  useUpdateMyTaskMutation,
  useGetAllTasksQuery,
  useGetTaskByIdQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation
} = tasksApi