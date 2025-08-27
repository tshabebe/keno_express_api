export type Round = {
  _id: string
  starts_at?: string | Date
  ends_at?: string | Date
}

export type Ticket = {
  _id: string
  round_id: string
  played_number: number[]
  created_at: string | Date
  bet_amount?: number
  user_id?: string
  username?: string
}

export type Draw = {
  round_id: string
  drawn_number: number[]
  created_at: string | Date
}

export type DrawCompletedPayload = {
  current_timestamp: string | Date
  drawn: Draw
  winnings: Array<{ played_number: number[] }>
}