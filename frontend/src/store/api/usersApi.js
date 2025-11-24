import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import baseUrl  from '../../utils/baseUrl'

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'https://task-management-wsuy.onrender.com/api/users',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token')
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    }
  }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getTeamMembers: builder.query({
      query: () => '/team-members'
    }),
    getAllUsers: builder.query({
      query: () => '/',
      providesTags: ['User']
    }),
    updateUserRole: builder.mutation({
      query: ({ id, role }) => ({
        url: `/${id}/role`,
        method: 'PATCH',
        body: { role }
      }),
      invalidatesTags: ['User']
    })
  }),
})

export const {
  useGetTeamMembersQuery,
  useGetAllUsersQuery,
  useUpdateUserRoleMutation
} = usersApi