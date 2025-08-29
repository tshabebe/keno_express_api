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

export type DrawNumberEvent = { roundId: string; seq: number; number: number; ts: number; nonce: string; sig: string }
export type DrawStartEvent = { roundId: string; ts: number; nonce: string; sig: string }

export function onDrawStart(handler: (e: DrawStartEvent) => void) {
  getSocket().on('draw:start', handler)
}

export function onDrawNumber(handler: (e: DrawNumberEvent) => void) {
  getSocket().on('draw:number', handler)
}

export function offDrawStart(handler: (e: DrawStartEvent) => void) {
  getSocket().off('draw:start', handler)
}

export function offDrawNumber(handler: (e: DrawNumberEvent) => void) {
  getSocket().off('draw:number', handler)
}

