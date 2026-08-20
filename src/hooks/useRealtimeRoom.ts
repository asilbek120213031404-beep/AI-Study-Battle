import { useState, useEffect, useCallback } from 'react';
import type { Room, RoomPlayer, Subject, Difficulty, Question } from '../types';
import { generateQuestionsWithAI } from '../lib/openai';
import { getSecureApiKey } from '../lib/security';
import { supabase } from '../lib/supabase';
import { createRoom as createRoomRPC, joinRoom as joinRoomRPC, setPlayerReadyStatus, leaveRoom as leaveRoomRPC, startRoom } from '../services/roomService';

const activeRoomsRegistry: Record<string, { room: Room; players: RoomPlayer[] }> = {};

export const useRealtimeRoom = (initialRoomCode?: string) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state from Supabase Realtime or local fallback
  useEffect(() => {
    if (!initialRoomCode) return;

    let isMounted = true;
    const cleanCode = initialRoomCode.trim().toUpperCase();

    const fetchRoomState = async () => {
      if (activeRoomsRegistry[cleanCode]) {
        setRoom(activeRoomsRegistry[cleanCode].room);
        setPlayers(activeRoomsRegistry[cleanCode].players);
      }

      if (!supabase) return;

      try {
        const { data: dbRoom } = await supabase
          .from('rooms')
          .select('*')
          .eq('room_code', cleanCode)
          .maybeSingle();

        if (dbRoom && isMounted) {
          const { data: dbPlayers } = await supabase
            .from('room_players')
            .select(`
              id,
              room_id,
              user_id,
              is_creator,
              ready,
              score,
              joined_at,
              profiles (
                display_name,
                avatar_url
              )
            `)
            .eq('room_id', dbRoom.id)
            .is('left_at', null);

          // Map DB room to frontend Room
          const mappedRoom: Room = {
            id: dbRoom.id,
            roomCode: dbRoom.room_code,
            creatorId: dbRoom.creator_id,
            status: dbRoom.status === 'in_progress' ? 'active' : (dbRoom.status as any),
            subject: dbRoom.subject as Subject,
            difficulty: dbRoom.difficulty as Difficulty,
            questionCount: dbRoom.question_count,
            timePerQuestion: dbRoom.time_per_question,
            questions: activeRoomsRegistry[cleanCode]?.room?.questions || [],
            createdAt: dbRoom.created_at,
          };

          const mappedPlayers: RoomPlayer[] = (dbPlayers || []).map((p: any) => ({
            id: p.id,
            roomId: p.room_id,
            userId: p.user_id,
            displayName: p.profiles?.display_name || 'O\'yinchi',
            avatarUrl: p.profiles?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            score: p.score || 0,
            correctAnswersCount: 0,
            isReady: p.ready || false,
            isHost: p.is_creator || false,
            joinedAt: p.joined_at,
            answers: {},
          }));

          activeRoomsRegistry[cleanCode] = {
            room: mappedRoom,
            players: mappedPlayers,
          };

          setRoom(mappedRoom);
          setPlayers(mappedPlayers);
        }
      } catch (err) {
        console.warn('Error fetching room state from Supabase:', err);
      }
    };

    fetchRoomState();

    // Subscribe to Realtime Postgres Changes on rooms & room_players
    if (supabase) {
      const channel = supabase
        .channel(`room_${cleanCode}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'rooms' },
          () => fetchRoomState()
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'room_players' },
          () => fetchRoomState()
        )
        .subscribe();

      return () => {
        isMounted = false;
        supabase?.removeChannel(channel);
      };
    }

    return () => {
      isMounted = false;
    };
  }, [initialRoomCode]);

  const createRoom = async (
    config: { subject: Subject; difficulty: Difficulty; questionCount: number; timePerQuestion: number },
    creatorUser: { id: string; displayName: string; avatarUrl: string }
  ): Promise<string> => {
    setLoading(true);
    setError(null);

    try {
      // 1. Generate 100% dynamic AI Questions using OpenAI/Gemini
      const generatedQuestions: Question[] = await generateQuestionsWithAI(
        config.subject,
        config.difficulty,
        config.questionCount,
        getSecureApiKey() || undefined
      );

      let roomCode = '';
      let roomId = `room_${Date.now()}`;

      // 2. Persist room in Supabase DB via create_room RPC
      if (supabase) {
        try {
          const rpcRes = await createRoomRPC({
            subject: config.subject,
            difficulty: config.difficulty,
            questionCount: config.questionCount,
            timePerQuestion: config.timePerQuestion,
            battleMode: '1v1',
          });

          if (rpcRes?.room) {
            roomCode = rpcRes.room.room_code;
            roomId = rpcRes.room.id;

            // Create battle row
            const { data: battleData } = await supabase
              .from('battles')
              .insert({
                room_id: roomId,
                status: 'pending',
              })
              .select()
              .single();

            if (battleData) {
              // Insert client questions and secrets
              for (let i = 0; i < generatedQuestions.length; i++) {
                const q = generatedQuestions[i];
                const { data: insertedQ } = await supabase
                  .from('battle_questions')
                  .insert({
                    battle_id: battleData.id,
                    question_order: i + 1,
                    question_text: q.question,
                    options: q.options as any,
                    explanation: q.explanation || null,
                  })
                  .select()
                  .single();

                if (insertedQ) {
                  await supabase.from('battle_question_secrets').insert({
                    question_id: insertedQ.id,
                    correct_answer: q.correctAnswer,
                  });
                }
              }
            }
          }
        } catch (dbErr) {
          console.warn('Supabase DB room creation fallback to local state:', dbErr);
        }
      }

      if (!roomCode) {
        // Fallback room code generator
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        for (let i = 0; i < 6; i++) {
          roomCode += chars.charAt(Math.floor(Math.random() * chars.length));
        }
      }

      const newRoom: Room = {
        id: roomId,
        roomCode,
        creatorId: creatorUser.id,
        status: 'waiting',
        subject: config.subject,
        difficulty: config.difficulty,
        questionCount: config.questionCount,
        timePerQuestion: config.timePerQuestion,
        questions: generatedQuestions,
        createdAt: new Date().toISOString(),
      };

      const creatorPlayer: RoomPlayer = {
        id: `rp_${Date.now()}_1`,
        roomId,
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

      activeRoomsRegistry[roomCode] = {
        room: newRoom,
        players: [creatorPlayer],
      };

      setRoom(newRoom);
      setPlayers([creatorPlayer]);
      return roomCode;
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

    // 1. Join room via Supabase RPC
    if (supabase) {
      try {
        await joinRoomRPC(cleanCode);
      } catch (dbErr: any) {
        console.warn('Supabase DB join_room RPC notice:', dbErr.message);
      }
    }

    // Local / In-memory fallback sync
    const existing = activeRoomsRegistry[cleanCode];

    if (existing) {
      if (existing.room.status !== 'waiting') {
        setError('Ushbu xonada oʻyin allaqachon boshlangan.');
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

      if (!existing.players.some(p => p.userId === joiningUser.id)) {
        existing.players.push(opponentPlayer);
      }

      setRoom(existing.room);
      setPlayers([...existing.players]);
    }

    setLoading(false);
    return true;
  };

  const toggleReady = async (ready: boolean) => {
    if (room?.id && supabase) {
      await setPlayerReadyStatus(room.id, '', ready);
    }
  };

  const startBattle = useCallback(async () => {
    if (room) {
      if (supabase && room.id) {
        try {
          await startRoom(room.id);
        } catch (e) {
          console.warn('RPC start_room notice:', e);
        }
      }

      const updated = { ...room, status: 'active' as const, startedAt: new Date().toISOString() };
      if (activeRoomsRegistry[room.roomCode]) {
        activeRoomsRegistry[room.roomCode].room = updated;
      }
      setRoom(updated);
    }
  }, [room]);

  const leave = async () => {
    if (room?.id && supabase) {
      await leaveRoomRPC(room.id);
    }
  };

  return {
    room,
    players,
    loading,
    error,
    createRoom,
    joinRoom,
    toggleReady,
    startBattle,
    leave,
  };
};
