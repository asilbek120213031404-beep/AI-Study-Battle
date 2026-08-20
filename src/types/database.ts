export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          avatar_url: string;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string;
          avatar_url?: string;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          avatar_url?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedSchema: "auth";
          }
        ];
      };
      user_ai_credentials: {
        Row: {
          id: string;
          user_id: string;
          provider: string;
          key_last4: string | null;
          key_label: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          provider?: string;
          key_last4?: string | null;
          key_label?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          provider?: string;
          key_last4?: string | null;
          key_label?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_ai_credentials_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedSchema: "auth";
          }
        ];
      };
      rooms: {
        Row: {
          id: string;
          room_code: string;
          creator_id: string;
          status: 'waiting' | 'starting' | 'in_progress' | 'finished' | 'cancelled' | 'expired';
          subject: string;
          difficulty: 'easy' | 'medium' | 'hard';
          question_count: number;
          time_per_question: number;
          battle_mode: string;
          created_at: string;
          started_at: string | null;
          finished_at: string | null;
        };
        Insert: {
          id?: string;
          room_code: string;
          creator_id: string;
          status?: 'waiting' | 'starting' | 'in_progress' | 'finished' | 'cancelled' | 'expired';
          subject: string;
          difficulty: 'easy' | 'medium' | 'hard';
          question_count?: number;
          time_per_question?: number;
          battle_mode?: string;
          created_at?: string;
          started_at?: string | null;
          finished_at?: string | null;
        };
        Update: {
          id?: string;
          room_code?: string;
          creator_id?: string;
          status?: 'waiting' | 'starting' | 'in_progress' | 'finished' | 'cancelled' | 'expired';
          subject?: string;
          difficulty?: 'easy' | 'medium' | 'hard';
          question_count?: number;
          time_per_question?: number;
          battle_mode?: string;
          created_at?: string;
          started_at?: string | null;
          finished_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "rooms_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedSchema: "auth";
          }
        ];
      };
      room_players: {
        Row: {
          id: string;
          room_id: string;
          user_id: string;
          is_creator: boolean;
          ready: boolean;
          score: number;
          joined_at: string;
          left_at: string | null;
        };
        Insert: {
          id?: string;
          room_id: string;
          user_id: string;
          is_creator?: boolean;
          ready?: boolean;
          score?: number;
          joined_at?: string;
          left_at?: string | null;
        };
        Update: {
          id?: string;
          room_id?: string;
          user_id?: string;
          is_creator?: boolean;
          ready?: boolean;
          score?: number;
          joined_at?: string;
          left_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "room_players_room_id_fkey";
            columns: ["room_id"];
            isOneToOne: false;
            referencedRelation: "rooms";
            referencedSchema: "public";
          },
          {
            foreignKeyName: "room_players_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedSchema: "auth";
          }
        ];
      };
      battles: {
        Row: {
          id: string;
          room_id: string;
          status: 'pending' | 'in_progress' | 'finished' | 'cancelled';
          winner_id: string | null;
          started_at: string | null;
          finished_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          status?: 'pending' | 'in_progress' | 'finished' | 'cancelled';
          winner_id?: string | null;
          started_at?: string | null;
          finished_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          status?: 'pending' | 'in_progress' | 'finished' | 'cancelled';
          winner_id?: string | null;
          started_at?: string | null;
          finished_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "battles_room_id_fkey";
            columns: ["room_id"];
            isOneToOne: true;
            referencedRelation: "rooms";
            referencedSchema: "public";
          }
        ];
      };
      battle_questions: {
        Row: {
          id: string;
          battle_id: string;
          question_order: number;
          question_text: string;
          options: Json;
          explanation: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          battle_id: string;
          question_order: number;
          question_text: string;
          options: Json;
          explanation?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          battle_id?: string;
          question_order?: number;
          question_text?: string;
          options?: Json;
          explanation?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "battle_questions_battle_id_fkey";
            columns: ["battle_id"];
            isOneToOne: false;
            referencedRelation: "battles";
            referencedSchema: "public";
          }
        ];
      };
      battle_question_secrets: {
        Row: {
          id: string;
          question_id: string;
          correct_answer: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          question_id: string;
          correct_answer: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          question_id?: string;
          correct_answer?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "battle_question_secrets_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: true;
            referencedRelation: "battle_questions";
            referencedSchema: "public";
          }
        ];
      };
      question_answers: {
        Row: {
          id: string;
          question_id: string;
          battle_id: string;
          user_id: string;
          selected_answer: number | null;
          is_correct: boolean | null;
          response_time_ms: number;
          answered_at: string;
        };
        Insert: {
          id?: string;
          question_id: string;
          battle_id: string;
          user_id: string;
          selected_answer?: number | null;
          is_correct?: boolean | null;
          response_time_ms?: number;
          answered_at?: string;
        };
        Update: {
          id?: string;
          question_id?: string;
          battle_id?: string;
          user_id?: string;
          selected_answer?: number | null;
          is_correct?: boolean | null;
          response_time_ms?: number;
          answered_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "question_answers_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "battle_questions";
            referencedSchema: "public";
          }
        ];
      };
      user_stats: {
        Row: {
          user_id: string;
          battles_played: number;
          wins: number;
          losses: number;
          total_score: number;
          correct_answers: number;
          total_answers: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          battles_played?: number;
          wins?: number;
          losses?: number;
          total_score?: number;
          correct_answers?: number;
          total_answers?: number;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          battles_played?: number;
          wins?: number;
          losses?: number;
          total_score?: number;
          correct_answers?: number;
          total_answers?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_stats_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedSchema: "auth";
          },
          {
            foreignKeyName: "user_stats_profiles_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedSchema: "public";
          }
        ];
      };
    };
    Views: {
      public_profiles: {
        Row: {
          id: string;
          display_name: string;
          avatar_url: string;
          created_at: string;
        };
      };
    };
    Functions: {
      create_room: {
        Args: {
          p_subject: string;
          p_difficulty: string;
          p_question_count: number;
          p_time_per_question: number;
          p_battle_mode: string;
        };
        Returns: Json;
      };
      join_room: {
        Args: {
          p_room_code: string;
        };
        Returns: Json;
      };
      set_player_ready: {
        Args: {
          p_room_id: string;
          p_ready: boolean;
        };
        Returns: Json;
      };
      leave_room: {
        Args: {
          p_room_id: string;
        };
        Returns: Json;
      };
      start_room: {
        Args: {
          p_room_id: string;
        };
        Returns: Json;
      };
      cancel_room: {
        Args: {
          p_room_id: string;
        };
        Returns: Json;
      };
      submit_answer: {
        Args: {
          p_question_id: string;
          p_selected_answer: number;
          p_response_time_ms: number;
        };
        Returns: Json;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
