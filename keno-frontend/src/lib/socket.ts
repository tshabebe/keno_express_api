import { io, Socket } from 'socket.io-client'
import { getSocketUrl } from './env'

const SOCKET_URL = getSocketUrl()

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

export function joinRoundRoom(roundId: string) {
  const s = getSocket()
  s.emit('lobby:join', roundId)
}

