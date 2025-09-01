// Lobbies removed; placeholder exports retained to avoid breaking imports
export type Lobby = never
export async function listLobbies(): Promise<Lobby[]> { return [] as never }
export async function createLobby(_: any) { return {} as never }
export async function joinLobbyApi(_: any) { return { ok: true } as never }
export async function leaveLobbyApi(_: any) { return { ok: true } as never }
export async function setLobbyRound(_: any, __: any) { return { ok: true } as never }

