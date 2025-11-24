import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import  baseUrl from '../../utils/baseUrl'

export const attachmentsApi = createApi({
  reducerPath: 'attachmentsApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'https://task-management-wsuy.onrender.com/api/attachments',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token')
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    }
  }),
  tagTypes: ['Attachment'],
  endpoints: (builder) => ({
    getTaskAttachments: builder.query({
      query: (taskId) => `/${taskId}`,
      providesTags: ['Attachment']
    }),
    uploadAttachment: builder.mutation({
      query: ({ taskId, file }) => {
        const formData = new FormData()
        formData.append('file', file)
        
        return {
          url: `/${taskId}/upload`,
          method: 'POST',
          body: formData
        }
      },
      invalidatesTags: ['Attachment']
    }),
    deleteAttachment: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Attachment']
    })
  }),
})

export const {
  useGetTaskAttachmentsQuery,
  useUploadAttachmentMutation,
  useDeleteAttachmentMutation
} = attachmentsApi