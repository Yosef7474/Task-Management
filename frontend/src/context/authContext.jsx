import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { useGetMeQuery } from '../store/api/authApi'

const AuthContext = createContext()

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null
      }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null
      }
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      }
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      }
    default:
      return state
  }
}

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const token = localStorage.getItem('token')

  // Use RTK Query to get user data
  const { data: meResponse, isLoading: meLoading, error: meError } = useGetMeQuery(undefined, {
    skip: !token
  })

  // Effect to handle automatic login when token exists
  useEffect(() => {
    if (token && meResponse?.success) {
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: meResponse.data.user
      })
    } else if (meError && token) {
      // Only logout if there was a token and it's invalid
      localStorage.removeItem('token')
      dispatch({ type: 'LOGOUT' })
    }
  }, [meResponse, meError, token])

  const login = (userData, token) => {
    try {
      localStorage.setItem('token', token)
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: userData
      })
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.message
      })
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    dispatch({ type: 'LOGOUT' })
  }

  const setLoading = (loading) => {
    dispatch({
      type: 'SET_LOADING',
      payload: loading
    })
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const value = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading || meLoading,
    error: state.error,
    login,
    logout,
    setLoading,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}