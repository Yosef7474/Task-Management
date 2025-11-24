import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'https://task-management-wsuy.onrender.com'

let socket = null

export const getSocket = (token) => {
  if (!token) {
    return null
  }

  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: false,
      auth: { token }
    })
  }

  if (socket.auth?.token !== token) {
    socket.auth = { token }
  }

  if (!socket.connected) {
    socket.connect()
  }

  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

