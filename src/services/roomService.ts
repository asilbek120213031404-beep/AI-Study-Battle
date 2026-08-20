import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

export type RoomRow = Database['public']['Tables']['rooms']['Row'];
export type RoomPlayerRow = Database['public']['Tables']['room_players']['Row'];

export interface CreateRoomParams {
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount?: number;
  timePerQuestion?: number;
  battleMode?: string;
}

export interface CreateRoomResult {
  room: RoomRow;
  player: RoomPlayerRow;
}

export interface JoinRoomResult {
  room: RoomRow;
  player: RoomPlayerRow;
  alreadyJoined: boolean;
}

/**
 * Creates a new multiplayer room via atomic PostgreSQL RPC function.
 */
export const createRoom = async (params: CreateRoomParams): Promise<CreateRoomResult> => {
  if (!supabase) {
    throw new Error('Supabase client is not initialized.');
  }

  const { data, error } = await (supabase.rpc as any)('create_room', {
    p_subject: params.subject,
    p_difficulty: params.difficulty,
    p_question_count: params.questionCount || 10,
    p_time_per_question: params.timePerQuestion || 15,
    p_battle_mode: params.battleMode || '1v1',
  });

  if (error) {
    console.error('RPC create_room error:', error.message);
    throw new Error(error.message);
  }

  return data as unknown as CreateRoomResult;
};

/**
 * Joins an existing multiplayer room by room code via atomic PostgreSQL RPC function.
 */
export const joinRoom = async (roomCode: string): Promise<JoinRoomResult> => {
  if (!supabase) {
    throw new Error('Supabase client is not initialized.');
  }

  const { data, error } = await (supabase.rpc as any)('join_room', {
    p_room_code: roomCode.trim().toUpperCase(),
  });

  if (error) {
    console.error('RPC join_room error:', error.message);
    throw new Error(error.message);
  }

  return data as unknown as JoinRoomResult;
};

/**
 * Fetches room details along with connected players.
 */
export const getRoomWithPlayers = async (roomCode: string): Promise<{ room: RoomRow; players: RoomPlayerRow[] } | null> => {
  if (!supabase) return null;

  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('*')
    .eq('room_code', roomCode.trim().toUpperCase())
    .maybeSingle();

  if (roomError || !room) {
    return null;
  }

  const { data: players, error: playersError } = await supabase
    .from('room_players')
    .select('*')
    .eq('room_id', (room as RoomRow).id)
    .is('left_at', null);

  if (playersError) {
    console.error('Error fetching room players:', playersError.message);
  }

  return {
    room: room as RoomRow,
    players: (players || []) as RoomPlayerRow[],
  };
};

/**
 * Toggles a player's ready state in a room via RPC function.
 */
export const setPlayerReadyStatus = async (roomId: string, _userId: string, ready: boolean): Promise<boolean> => {
  if (!supabase) return false;

  const { error } = await (supabase.rpc as any)('set_player_ready', {
    p_room_id: roomId,
    p_ready: ready,
  });

  if (error) {
    console.error('Error toggling ready status:', error.message);
    return false;
  }
  return true;
};

/**
 * Leaves a room via RPC function.
 */
export const leaveRoom = async (roomId: string, _userId?: string): Promise<boolean> => {
  if (!supabase) return false;

  const { error } = await (supabase.rpc as any)('leave_room', {
    p_room_id: roomId,
  });

  if (error) {
    console.error('Error leaving room:', error.message);
    return false;
  }
  return true;
};

/**
 * Starts a room battle via RPC function (Creator only).
 */
export const startRoom = async (roomId: string): Promise<boolean> => {
  if (!supabase) return false;

  const { error } = await (supabase.rpc as any)('start_room', {
    p_room_id: roomId,
  });

  if (error) {
    console.error('Error starting room:', error.message);
    return false;
  }
  return true;
};

/**
 * Cancels a room via RPC function (Creator only).
 */
export const cancelRoom = async (roomId: string): Promise<boolean> => {
  if (!supabase) return false;

  const { error } = await (supabase.rpc as any)('cancel_room', {
    p_room_id: roomId,
  });

  if (error) {
    console.error('Error cancelling room:', error.message);
    return false;
  }
  return true;
};
