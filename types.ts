export interface UserProfile {
  pid: string;
  name: string;
  avatar: string;
  points: number;
  level: number;
  stats: {
    wins: number;
    losses: number;
    gamesPlayed: number;
  };
}

export interface Question {
  id: string;
  text: string;
  choices: string[];
  correctAnswer: string;
}

export interface PlayerState {
  pid: string;
  name: string;
  avatar: string;
  score: number;
  currentAnswer: string | null; // Track current question answer for UI feedback
}

export interface GameMatch {
  matchId: string;
  status: 'waiting' | 'starting' | 'playing' | 'finished';
  players: {
    p1: PlayerState; // p1 is the creator or first player
    p2: PlayerState | null; // p2 might join later
  };
  subject: string;
  lesson: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  quizList: Question[];
  winnerPid?: string | null;
  startTime: number;
  lastUpdated: number; // For polling sync
}

export interface LeaderboardEntry {
  pid: string;
  name: string;
  points: number;
  level: number;
  avatar: string;
}

export enum AppView {
  REGISTER = 'REGISTER',
  DASHBOARD = 'DASHBOARD',
  LOBBY = 'LOBBY',
  GAME = 'GAME',
  RESULTS = 'RESULTS',
}
