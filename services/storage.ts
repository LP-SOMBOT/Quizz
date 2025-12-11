import { UserProfile, GameMatch, LeaderboardEntry, PlayerState, Question } from '../types';
import { generateQuestions } from '../constants';

const KEYS = {
  LAST_PID: 'LPF4_lastPID',
  USER_PID: 'LPF4_user_PID',
  USER_PROFILE: 'LPF4_user_profile',
  ACTIVE_MATCH: 'LPF4_active_match',
  SELECTED_SUBJECT: 'LPF4_selected_subject',
  SELECTED_LESSON: 'LPF4_selected_lesson',
  LEADERBOARD: 'LPF4_leaderboard',
  QUEUE_PREFIX: 'LPF4_queue_',
};

export const StorageService = {
  // --- PID & User Management ---
  
  initializeUser: (name: string, avatar: string): UserProfile => {
    let lastPID = parseInt(localStorage.getItem(KEYS.LAST_PID) || '9999');
    const newPID = lastPID + 1;
    const pidString = `LPF4-${newPID}`;
    
    localStorage.setItem(KEYS.LAST_PID, newPID.toString());
    localStorage.setItem(KEYS.USER_PID, pidString);
    
    const newUser: UserProfile = {
      pid: pidString,
      name,
      avatar,
      points: 0,
      level: 1,
      stats: { wins: 0, losses: 0, gamesPlayed: 0 }
    };
    
    localStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(newUser));
    StorageService.updateLeaderboard(newUser);
    return newUser;
  },

  getUser: (): UserProfile | null => {
    const data = localStorage.getItem(KEYS.USER_PROFILE);
    return data ? JSON.parse(data) : null;
  },

  updateUser: (updates: Partial<UserProfile>) => {
    const current = StorageService.getUser();
    if (!current) return;
    const updated = { ...current, ...updates };
    localStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(updated));
    StorageService.updateLeaderboard(updated);
    return updated;
  },

  // --- Leaderboard ---

  updateLeaderboard: (user: UserProfile) => {
    const lbData = localStorage.getItem(KEYS.LEADERBOARD);
    let leaderboard: LeaderboardEntry[] = lbData ? JSON.parse(lbData) : [];
    
    // Remove existing entry for this PID
    leaderboard = leaderboard.filter(e => e.pid !== user.pid);
    
    // Add updated entry
    leaderboard.push({
      pid: user.pid,
      name: user.name,
      points: user.points,
      level: user.level,
      avatar: user.avatar
    });
    
    // Sort descending by points
    leaderboard.sort((a, b) => b.points - a.points);
    
    localStorage.setItem(KEYS.LEADERBOARD, JSON.stringify(leaderboard));
  },

  getLeaderboard: (): LeaderboardEntry[] => {
    return JSON.parse(localStorage.getItem(KEYS.LEADERBOARD) || '[]');
  },

  // --- Matchmaking & Game ---

  saveSelection: (subject: string, lesson: string) => {
    localStorage.setItem(KEYS.SELECTED_SUBJECT, subject);
    localStorage.setItem(KEYS.SELECTED_LESSON, lesson);
  },

  joinQueue: (subject: string, lesson: string, user: UserProfile): { match: GameMatch | null, isQueued: boolean } => {
    const queueKey = `${KEYS.QUEUE_PREFIX}${subject}_${lesson}`;
    const queueData = localStorage.getItem(queueKey);
    let queue: string[] = queueData ? JSON.parse(queueData) : []; // Array of PIDs

    // Remove self if already in queue to prevent duplicates
    queue = queue.filter(pid => pid !== user.pid);

    if (queue.length > 0) {
      // Opponent found!
      const opponentPID = queue.shift(); // Take first waiter
      localStorage.setItem(queueKey, JSON.stringify(queue)); // Update queue
      
      // Ideally we would fetch opponent profile, but we can't easily read other's local storage keys if they are stored as "LPF4_user_profile" (that key is local to the user).
      // SIMULATION HACK: We assume we are "simulating" via tabs, but we all share the same "LPF4_active_match".
      // However, to get opponent name/avatar, usually we'd need a centralized store. 
      // For this local simulation, we will store a "Public Profiles" map or just use placeholders if we can't find it.
      
      const allUsers = JSON.parse(localStorage.getItem('LPF4_all_users') || '{}');
      const opponentProfile = allUsers[opponentPID!] || { name: 'Player 2', avatar: '👤', pid: opponentPID };

      // Create Match
      const quizList = generateQuestions(subject, lesson);
      const match: GameMatch = {
        matchId: `LPF4_match_${Date.now()}`,
        status: 'starting',
        players: {
          p1: { pid: opponentProfile.pid, name: opponentProfile.name, avatar: opponentProfile.avatar, score: 0, currentAnswer: null },
          p2: { pid: user.pid, name: user.name, avatar: user.avatar, score: 0, currentAnswer: null }
        },
        subject,
        lesson,
        currentQuestionIndex: 0,
        totalQuestions: quizList.length,
        quizList,
        startTime: Date.now(),
        lastUpdated: Date.now()
      };

      localStorage.setItem(KEYS.ACTIVE_MATCH, JSON.stringify(match));
      return { match, isQueued: false };
    } else {
      // No opponent, join queue
      queue.push(user.pid);
      localStorage.setItem(queueKey, JSON.stringify(queue));
      return { match: null, isQueued: true };
    }
  },

  // Helper to store public profile so others can see me
  publishProfile: (user: UserProfile) => {
    const allUsers = JSON.parse(localStorage.getItem('LPF4_all_users') || '{}');
    allUsers[user.pid] = { name: user.name, avatar: user.avatar, pid: user.pid };
    localStorage.setItem('LPF4_all_users', JSON.stringify(allUsers));
  },

  getActiveMatch: (): GameMatch | null => {
    const data = localStorage.getItem(KEYS.ACTIVE_MATCH);
    return data ? JSON.parse(data) : null;
  },

  updateMatch: (match: GameMatch) => {
    match.lastUpdated = Date.now();
    localStorage.setItem(KEYS.ACTIVE_MATCH, JSON.stringify(match));
  },

  submitAnswer: (pid: string, answer: string, match: GameMatch): GameMatch => {
    const isP1 = match.players.p1?.pid === pid;
    const player = isP1 ? match.players.p1! : match.players.p2!;
    
    // If already answered this question, ignore
    if (player.currentAnswer) return match;

    player.currentAnswer = answer;
    
    // Check if both answered
    const p1 = match.players.p1!;
    const p2 = match.players.p2!;
    
    if (p1.currentAnswer && p2.currentAnswer) {
      // Evaluate answers
      const currentQ = match.quizList[match.currentQuestionIndex];
      
      if (p1.currentAnswer === currentQ.correctAnswer) p1.score += 100;
      if (p2.currentAnswer === currentQ.correctAnswer) p2.score += 100;

      // Move to next question after a short delay (handled by UI usually, but logic here updates state)
      // For simplicity in this sync model, we immediately move index, UI handles animation
      if (match.currentQuestionIndex < match.totalQuestions - 1) {
        match.currentQuestionIndex++;
        p1.currentAnswer = null;
        p2.currentAnswer = null;
      } else {
        match.status = 'finished';
        // Determine winner
        if (p1.score > p2.score) match.winnerPid = p1.pid;
        else if (p2.score > p1.score) match.winnerPid = p2.pid;
        else match.winnerPid = 'draw';
      }
    }
    
    StorageService.updateMatch(match);
    return match;
  },

  clearMatch: () => {
    localStorage.removeItem(KEYS.ACTIVE_MATCH);
  }
};
