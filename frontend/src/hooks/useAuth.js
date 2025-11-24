import { useState, useEffect } from 'react'
import { useGetMeQuery } from '../store/api/authApi'

export const useAuth = () => {
  const token = localStorage.getItem('token')
  const { data: response, isLoading, error } = useGetMeQuery(undefined, {
    skip: !token // Skip the query if no token exists
  })
  
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (response?.success && response.data?.user) {
      setUser(response.data.user)
      setIsAuthenticated(true)
    } else if (error || !token) {
      setUser(null)
      setIsAuthenticated(false)
    }
  }, [response, error, token])

  return {
    user: response?.success ? response.data?.user : null,
    isLoading: token ? isLoading : false,
    error,
    isAuthenticated
  }
}