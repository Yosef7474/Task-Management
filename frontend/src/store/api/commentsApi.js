import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const commentsApi = createApi({
  reducerPath: 'commentsApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:3000/api/comments',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token')
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    }
  }),
  tagTypes: ['Comment'],
  endpoints: (builder) => ({
    getTaskComments: builder.query({
      query: (taskId) => `/${taskId}`,
      providesTags: ['Comment']
    }),
    addComment: builder.mutation({
      query: ({ taskId, content }) => ({
        url: `/${taskId}`,
        method: 'POST',
        body: { content }
      }),
      invalidatesTags: ['Comment']
    }),
    deleteComment: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Comment']
    })
  }),
})

export const {
  useGetTaskCommentsQuery,
  useAddCommentMutation,
  useDeleteCommentMutation
} = commentsApi