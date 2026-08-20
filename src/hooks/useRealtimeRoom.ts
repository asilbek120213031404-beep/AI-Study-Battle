import { useState, useEffect, useCallback } from 'react';
import type { Room, RoomPlayer, Subject, Difficulty } from '../types';
import { generateQuestionsWithAI } from '../lib/openai';
import { getSecureApiKey } from '../lib/security';

export const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const activeRoomsRegistry: Record<string, { room: Room; players: RoomPlayer[] }> = {};

export const useRealtimeRoom = (initialRoomCode?: string) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialRoomCode && activeRoomsRegistry[initialRoomCode]) {
      setRoom(activeRoomsRegistry[initialRoomCode].room);
      setPlayers(activeRoomsRegistry[initialRoomCode].players);
    }
  }, [initialRoomCode]);

  const createRoom = async (
    config: { subject: Subject; difficulty: Difficulty; questionCount: number; timePerQuestion: number },
    creatorUser: { id: string; displayName: string; avatarUrl: string }
  ): Promise<string> => {
    setLoading(true);
    setError(null);

    try {
      const code = generateRoomCode();
      const questions = await generateQuestionsWithAI(
        config.subject,
        config.difficulty,
        config.questionCount,
        getSecureApiKey() || undefined
      );

      const newRoom: Room = {
        id: `room_${Date.now()}`,
        roomCode: code,
        creatorId: creatorUser.id,
        status: 'waiting',
        subject: config.subject,
        difficulty: config.difficulty,
        questionCount: config.questionCount,
        timePerQuestion: config.timePerQuestion,
        questions: questions,
        createdAt: new Date().toISOString(),
      };

      const creatorPlayer: RoomPlayer = {
        id: `rp_${Date.now()}_1`,
        roomId: newRoom.id,
        userId: creatorUser.id,
        displayName: creatorUser.displayName,
        avatarUrl: creatorUser.avatarUrl,
        score: 0,
        correctAnswersCount: 0,
        isReady: true,
        isHost: true,
        joinedAt: new Date().toISOString(),
        answers: {},
      };

      activeRoomsRegistry[code] = {
        room: newRoom,
        players: [creatorPlayer],
      };

      setRoom(newRoom);
      setPlayers([creatorPlayer]);
      return code;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Xona yaratishda xatolik yuz berdi';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async (
    code: string,
    joiningUser: { id: string; displayName: string; avatarUrl: string }
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    const cleanCode = code.trim().toUpperCase();
    const existing = activeRoomsRegistry[cleanCode];

    if (!existing) {
      setError('Xona kodi topilmadi. Kodni qayta tekshirib koʻring.');
      setLoading(false);
      return false;
    }

    if (existing.room.status !== 'waiting') {
      setError('Ushbu xonada oʻyin allachon boshlangan.');
      setLoading(false);
      return false;
    }

    if (existing.players.length >= 2) {
      setError('Xona toʻla (Maksimal 2 ta oʻyinchi).');
      setLoading(false);
      return false;
    }

    const opponentPlayer: RoomPlayer = {
      id: `rp_${Date.now()}_2`,
      roomId: existing.room.id,
      userId: joiningUser.id,
      displayName: joiningUser.displayName,
      avatarUrl: joiningUser.avatarUrl,
      score: 0,
      correctAnswersCount: 0,
      isReady: true,
      isHost: false,
      joinedAt: new Date().toISOString(),
      answers: {},
    };

    existing.players.push(opponentPlayer);
    setRoom(existing.room);
    setPlayers([...existing.players]);
    setLoading(false);
    return true;
  };

  const startBattle = useCallback(() => {
    if (room && activeRoomsRegistry[room.roomCode]) {
      const updated = { ...room, status: 'active' as const, startedAt: new Date().toISOString() };
      activeRoomsRegistry[room.roomCode].room = updated;
      setRoom(updated);
    }
  }, [room]);

  return {
    room,
    players,
    loading,
    error,
    createRoom,
    joinRoom,
    startBattle,
  };
};
