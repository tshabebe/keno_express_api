import { io, Socket } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, { transports: ['websocket'], autoConnect: true })
  }
  return socket
}

export function joinLobby(lobbyId: string) {
  const s = getSocket()
  s.emit('lobby:join', lobbyId)
}

export function joinGlobalKeno() {
  getSocket() // server auto-joins 'lobby:global' on connect
}

