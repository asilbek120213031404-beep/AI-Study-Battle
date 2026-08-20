export type Difficulty = 'easy' | 'medium' | 'hard';

export type Subject = 
  | 'JavaScript'
  | 'React'
  | 'TypeScript'
  | 'Python'
  | 'Mathematics'
  | 'Physics'
  | 'History'
  | 'English'
  | 'General Knowledge'
  | 'Matematika'
  | 'Fizika'
  | 'Tarix'
  | 'Ingliz tili'
  | 'Umumiy Bilimlar';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  hasApiKey: boolean;
  apiKeyMasked?: string;
  createdAt: string;
  updatedAt?: string;
  stats: UserStats;
}

export interface UserStats {
  battlesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  totalPoints: number;
  averageScore: number;
  averageResponseTime: number; // in seconds
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // 0-indexed option index
  explanation?: string;
}

export interface Room {
  id: string;
  roomCode: string;
  creatorId: string;
  status: 'waiting' | 'starting' | 'active' | 'finished';
  subject: Subject;
  difficulty: Difficulty;
  questionCount: number;
  timePerQuestion: number; // seconds
  questions?: Question[];
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
}

export interface RoomPlayer {
  id: string;
  roomId: string;
  userId: string;
  displayName: string;
  avatarUrl: string;
  score: number;
  correctAnswersCount: number;
  isReady: boolean;
  isHost: boolean;
  joinedAt: string;
  answers: Record<number, { selectedOption: number; timeSpentSec: number; isCorrect: boolean }>;
}

export interface BattleState {
  roomId: string;
  currentQuestionIndex: number;
  questions: Question[];
  players: Record<string, RoomPlayer>; // userId -> RoomPlayer
  status: 'active' | 'finished';
  timeRemaining: number;
  mySelectedAnswer: number | null;
  hasSubmitted: boolean;
}

export interface BattleResult {
  roomId: string;
  winnerId: string | null; // null if draw
  isDraw: boolean;
  players: {
    user: RoomPlayer;
    accuracy: number;
    totalScore: number;
    avgTimeSec: number;
  }[];
  questions: Question[];
  finishedAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatarUrl: string;
  wins: number;
  battles: number;
  winRate: number;
  totalPoints: number;
  score: number;
}
