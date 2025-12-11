import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import confetti from 'canvas-confetti';
import { UserProfile, GameMatch, AppView, LeaderboardEntry } from './types';
import { SUBJECTS, LESSONS, AVATARS } from './constants';
import { StorageService } from './services/storage';

// --- Components ---

const Button = ({ onClick, children, className = '', disabled = false, variant = 'primary' }: any) => {
  const base = "px-6 py-3 rounded-xl font-bold transition-all transform active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed";
  const variants: any = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/30",
    secondary: "bg-slate-700 hover:bg-slate-600 text-white shadow-slate-900/20",
    success: "bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/30",
    danger: "bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/30",
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const Card = ({ children, className = '' }: any) => (
  <div className={`bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-2xl p-6 ${className}`}>
    {children}
  </div>
);

// --- Views ---

const RegisterView = ({ onComplete }: { onComplete: (user: UserProfile) => void }) => {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    const user = StorageService.initializeUser(name, avatar);
    StorageService.publishProfile(user);
    onComplete(user);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 max-w-md mx-auto w-full">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-2">
          LocalPvP Academy
        </h1>
        <p className="text-slate-400">Enter the arena.</p>
      </div>

      <Card className="w-full space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-400 mb-2">PLAYER NAME</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
            placeholder="Enter your gamertag..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-400 mb-2">CHOOSE AVATAR</label>
          <div className="grid grid-cols-5 gap-2">
            {AVATARS.map((a) => (
              <button
                key={a}
                onClick={() => setAvatar(a)}
                className={`text-2xl p-2 rounded-lg transition-all ${
                  avatar === a ? 'bg-indigo-600 scale-110 shadow-lg shadow-indigo-500/50' : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={handleSubmit} disabled={!name} className="w-full">
          Start Journey
        </Button>
      </Card>
    </div>
  );
};

const DashboardView = ({ user, onFindMatch, leaderboard }: { user: UserProfile, onFindMatch: (s: string, l: string) => void, leaderboard: LeaderboardEntry[] }) => {
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0].id);
  const [selectedLesson, setSelectedLesson] = useState(LESSONS[SUBJECTS[0].id][0]);

  useEffect(() => {
    setSelectedLesson(LESSONS[selectedSubject][0]);
  }, [selectedSubject]);

  return (
    <div className="min-h-screen p-4 max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pt-4">
        <div className="flex items-center gap-3">
          <div className="text-4xl bg-slate-800 p-2 rounded-xl border border-slate-700 shadow-lg">{user.avatar}</div>
          <div>
            <h2 className="text-xl font-bold text-white">{user.name}</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono bg-slate-800 px-2 py-0.5 rounded text-indigo-400 border border-indigo-900/50">{user.pid}</span>
              <span className="text-xs text-slate-400">Lvl {user.level} • {user.points} pts</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Selection Area */}
        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="text-indigo-400">📚</span> Select Subject
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {SUBJECTS.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubject(sub.id)}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                    selectedSubject === sub.id
                      ? 'bg-indigo-600/20 border-indigo-500 ring-1 ring-indigo-500'
                      : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${selectedSubject === sub.id ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                    {/* Icon placeholder since we don't have lucide loaded */}
                    <span className="text-xl">
                       {sub.id === 'math' ? '🧮' : sub.id === 'science' ? '🧪' : '📜'}
                    </span>
                  </div>
                  <div>
                    <div className="font-bold">{sub.name}</div>
                    <div className="text-xs text-slate-400">{LESSONS[sub.id].length} Lessons</div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          <Card>
             <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="text-indigo-400">📑</span> Select Lesson
            </h3>
            <div className="flex flex-wrap gap-2">
              {LESSONS[selectedSubject].map((lesson) => (
                <button
                  key={lesson}
                  onClick={() => setSelectedLesson(lesson)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedLesson === lesson
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {lesson}
                </button>
              ))}
            </div>
          </Card>

          <Button 
            onClick={() => onFindMatch(selectedSubject, selectedLesson)} 
            className="w-full text-lg py-4 shadow-xl shadow-indigo-900/20"
          >
            Find Match (Simulation)
          </Button>
        </div>

        {/* Leaderboard */}
        <Card className="h-full">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="text-yellow-400">🏆</span> Leaderboard
          </h3>
          <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
            {leaderboard.length === 0 && <p className="text-slate-500 text-center py-4">No champions yet.</p>}
            {leaderboard.map((entry, idx) => (
              <div key={entry.pid} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 flex items-center justify-center rounded font-bold text-xs ${
                    idx === 0 ? 'bg-yellow-500 text-black' : idx === 1 ? 'bg-slate-400 text-black' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="text-2xl">{entry.avatar}</div>
                  <div>
                    <div className="font-bold text-sm">{entry.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{entry.pid}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-indigo-400">{entry.points}</div>
                  <div className="text-[10px] text-slate-500">Level {entry.level}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

const LobbyView = ({ onCancel, subject, lesson }: any) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-4">
    <div className="text-center space-y-8 animate-pulse">
      <div className="relative w-32 h-32 mx-auto">
        <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-50 animate-ping"></div>
        <div className="relative bg-slate-800 w-32 h-32 rounded-full flex items-center justify-center text-4xl border-4 border-indigo-500">
          🔍
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-2">Searching for Opponent...</h2>
        <p className="text-slate-400">Subject: {subject} • Lesson: {lesson}</p>
        <p className="text-xs text-slate-500 mt-4 max-w-xs mx-auto">
          Tip: Open this URL in another tab to simulate a second player instantly.
        </p>
      </div>
      <Button variant="secondary" onClick={onCancel}>Cancel Search</Button>
    </div>
  </div>
);

const GameView = ({ match, userPid, onSubmitAnswer }: { match: GameMatch, userPid: string, onSubmitAnswer: (ans: string) => void }) => {
  const isP1 = match.players.p1?.pid === userPid;
  const me = isP1 ? match.players.p1 : match.players.p2;
  const opponent = isP1 ? match.players.p2 : match.players.p1;
  const currentQuestion = match.quizList[match.currentQuestionIndex];

  // Visual state for selected answer (before submission logic confirms)
  const [selectedAns, setSelectedAns] = useState<string | null>(null);

  useEffect(() => {
    // Reset selection on new question
    setSelectedAns(null);
  }, [match.currentQuestionIndex]);

  const handleSelect = (ans: string) => {
    if (me?.currentAnswer) return; // Already submitted
    setSelectedAns(ans);
    // Simulate network delay for "feel"
    setTimeout(() => {
        onSubmitAnswer(ans);
    }, 500);
  };

  if (!me || !opponent) return <div>Error: Invalid Match State</div>;

  return (
    <div className="min-h-screen flex flex-col max-w-4xl mx-auto p-4">
      {/* HUD */}
      <div className="flex items-center justify-between bg-slate-800 p-4 rounded-2xl mb-6 shadow-xl border border-slate-700">
        <div className="flex items-center gap-4">
          <div className="text-3xl relative">
            {me.avatar}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-800"></div>
          </div>
          <div>
            <div className="font-bold text-indigo-400">YOU</div>
            <div className="text-2xl font-black">{me.score}</div>
          </div>
        </div>

        <div className="text-center">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Question</div>
            <div className="text-2xl font-black bg-slate-900 px-4 py-1 rounded-lg border border-slate-700">
                {match.currentQuestionIndex + 1} <span className="text-slate-600 text-base">/ {match.totalQuestions}</span>
            </div>
        </div>

        <div className="flex items-center gap-4 text-right">
          <div>
            <div className="font-bold text-rose-400">{opponent.name}</div>
            <div className="text-2xl font-black">{opponent.score}</div>
          </div>
          <div className="text-3xl relative">
            {opponent.avatar}
            {/* Show opponent status */}
            <div className={`absolute -bottom-1 -left-1 w-4 h-4 rounded-full border-2 border-slate-800 transition-colors ${opponent.currentAnswer ? 'bg-green-500' : 'bg-slate-500'}`}></div>
          </div>
        </div>
      </div>

      {/* Question Area */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="mb-8 text-center space-y-2">
           <span className="inline-block px-3 py-1 bg-indigo-900/50 text-indigo-300 rounded-full text-xs font-bold tracking-wide uppercase">
             {match.lesson}
           </span>
           <h2 className="text-2xl md:text-4xl font-bold leading-tight">{currentQuestion.text}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQuestion.choices.map((choice, idx) => {
            const isSelected = selectedAns === choice;
            const isSubmitted = !!me.currentAnswer;
            
            return (
              <button
                key={idx}
                onClick={() => handleSelect(choice)}
                disabled={isSubmitted}
                className={`p-6 rounded-2xl text-lg font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98] text-left relative overflow-hidden group ${
                  isSelected 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40 ring-2 ring-indigo-400' 
                    : isSubmitted 
                        ? 'bg-slate-800 opacity-50 cursor-not-allowed'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                 <div className="relative z-10 flex items-center gap-4">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        isSelected ? 'bg-white text-indigo-600' : 'bg-slate-700 text-slate-400 group-hover:bg-slate-600'
                    }`}>
                        {String.fromCharCode(65 + idx)}
                    </span>
                    {choice}
                 </div>
                 {/* Selection Progress/Feedback could go here */}
              </button>
            );
          })}
        </div>

        {me.currentAnswer && !opponent.currentAnswer && (
            <div className="mt-8 text-center animate-pulse text-slate-400">
                Waiting for {opponent.name} to answer...
            </div>
        )}
      </div>
    </div>
  );
};

const ResultsView = ({ match, userPid, onHome }: { match: GameMatch, userPid: string, onHome: () => void }) => {
  const isWinner = match.winnerPid === userPid;
  const isDraw = match.winnerPid === 'draw';
  
  const isP1 = match.players.p1?.pid === userPid;
  const me = isP1 ? match.players.p1 : match.players.p2;
  const opponent = isP1 ? match.players.p2 : match.players.p1;

  useEffect(() => {
    if (isWinner) {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }
  }, [isWinner]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Background Gradients */}
        <div className={`absolute inset-0 opacity-20 ${isWinner ? 'bg-gradient-to-b from-green-500/20 to-slate-900' : isDraw ? 'bg-slate-800' : 'bg-gradient-to-b from-red-500/20 to-slate-900'}`}></div>
        
        <Card className="max-w-md w-full text-center relative z-10 p-10 border-2 border-slate-700/50">
            <div className="text-6xl mb-6">
                {isWinner ? '🏆' : isDraw ? '🤝' : '💀'}
            </div>
            
            <h1 className="text-4xl font-extrabold mb-2 text-white">
                {isWinner ? 'VICTORY!' : isDraw ? 'DRAW GAME' : 'DEFEAT'}
            </h1>
            
            <p className="text-slate-400 mb-8">
                {isWinner ? `You crushed ${opponent?.name}!` : isDraw ? 'Well fought!' : `Better luck next time against ${opponent?.name}.`}
            </p>

            <div className="flex items-center justify-center gap-8 mb-10">
                <div className="text-center">
                    <div className="text-3xl font-black text-indigo-400">{me?.score}</div>
                    <div className="text-xs font-bold text-slate-500 uppercase">Your Score</div>
                </div>
                <div className="text-slate-600 text-2xl font-thin">VS</div>
                <div className="text-center">
                    <div className="text-3xl font-black text-slate-300">{opponent?.score}</div>
                    <div className="text-xs font-bold text-slate-500 uppercase">{opponent?.name}</div>
                </div>
            </div>

            <Button onClick={onHome} className="w-full">Return to Dashboard</Button>
        </Card>
    </div>
  );
};

// --- Main App ---

const App = () => {
  const [view, setView] = useState<AppView>(AppView.REGISTER);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [match, setMatch] = useState<GameMatch | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Initialization
  useEffect(() => {
    const savedUser = StorageService.getUser();
    if (savedUser) {
      setUser(savedUser);
      setView(AppView.DASHBOARD);
      StorageService.publishProfile(savedUser); // Ensure visible to others
    }
    
    setLeaderboard(StorageService.getLeaderboard());

    // Check for active match on load (Reconnection Logic)
    const activeMatch = StorageService.getActiveMatch();
    if (activeMatch && activeMatch.status !== 'finished' && savedUser) {
        const isParticipant = activeMatch.players.p1?.pid === savedUser.pid || activeMatch.players.p2?.pid === savedUser.pid;
        if (isParticipant) {
            setMatch(activeMatch);
            setView(AppView.GAME);
        }
    }
  }, []);

  // Cross-tab synchronization (The heartbeat of this Local Storage simulation)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Sync Leaderboard
      if (e.key === 'LPF4_leaderboard') {
        setLeaderboard(StorageService.getLeaderboard());
      }

      // Sync Match State
      if (e.key === 'LPF4_active_match') {
        const newMatchData = StorageService.getActiveMatch();
        
        // If we are currently in a game (or waiting for one)
        if (newMatchData && user) {
            const isParticipant = newMatchData.players.p1?.pid === user.pid || newMatchData.players.p2?.pid === user.pid;
            
            if (isParticipant) {
                setMatch(newMatchData);
                
                // State transitions based on match status
                if (newMatchData.status === 'starting' && view !== AppView.GAME) {
                   setView(AppView.GAME);
                }
                if (newMatchData.status === 'finished' && view !== AppView.RESULTS) {
                    setView(AppView.RESULTS);
                    
                    // Update user stats if not already done in this session
                    // Note: Ideally StorageService handles the write once, 
                    // this view update just reflects it.
                    // We re-fetch user to get latest points
                    const updatedUser = StorageService.getUser();
                    if(updatedUser) setUser(updatedUser);
                    setLeaderboard(StorageService.getLeaderboard());
                }
            }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user, view]);

  // Fallback Polling for same-tab updates (React state doesn't auto-update from LS writes in same window)
  // Or simply rely on the actions to update state.
  // Ideally, we force a re-read when we take action, but for opponent actions (if simulated in another tab), storage event handles it.
  // If simulated in SAME tab (impossible for 2 players same device unless turn based, but here we assume simultaneous or 2 tabs),
  // we need a poller for the case where "Waiting for opponent" might be updated by a "bot" or matched by another tab.
  useEffect(() => {
      if (view === AppView.LOBBY) {
          const interval = setInterval(() => {
              const m = StorageService.getActiveMatch();
              if (m && user && (m.players.p1?.pid === user.pid || m.players.p2?.pid === user.pid)) {
                  setMatch(m);
                  if (m.status === 'starting' || m.status === 'playing') {
                      setView(AppView.GAME);
                  }
              }
          }, 1000);
          return () => clearInterval(interval);
      }

      if (view === AppView.GAME && match) {
          const interval = setInterval(() => {
              const m = StorageService.getActiveMatch();
              // Check if opponent answered or game finished
              if (m && m.lastUpdated > match.lastUpdated) {
                  setMatch(m);
                  if (m.status === 'finished') {
                      setView(AppView.RESULTS);
                      const u = StorageService.getUser();
                      if(u) setUser(u);
                      setLeaderboard(StorageService.getLeaderboard());
                  }
              }
          }, 500);
          return () => clearInterval(interval);
      }
  }, [view, match, user]);


  // Actions

  const handleRegister = (newUser: UserProfile) => {
    setUser(newUser);
    setView(AppView.DASHBOARD);
    setLeaderboard(StorageService.getLeaderboard());
  };

  const handleFindMatch = (subject: string, lesson: string) => {
    if (!user) return;
    StorageService.saveSelection(subject, lesson);
    
    // Clear any old match
    StorageService.clearMatch();

    const { match: instantMatch, isQueued } = StorageService.joinQueue(subject, lesson, user);
    
    if (instantMatch) {
      setMatch(instantMatch);
      setView(AppView.GAME); // Animation triggers inside GameView
    } else {
      setView(AppView.LOBBY);
    }
  };

  const handleCancelSearch = () => {
     // Simplification: Just go back, maybe remove from queue in real app
     setView(AppView.DASHBOARD);
  };

  const handleSubmitAnswer = (ans: string) => {
      if (!user || !match) return;
      const updated = StorageService.submitAnswer(user.pid, ans, match);
      setMatch({ ...updated }); // Force re-render
      
      // If game finished immediately (last question, second player answering)
      if (updated.status === 'finished') {
           // Update user stats
           const isWinner = updated.winnerPid === user.pid;
           const isDraw = updated.winnerPid === 'draw';
           const pointsToAdd = isWinner ? 50 : isDraw ? 10 : 5;
           
           // We need to be careful not to double-update if both clients run this.
           // In this simulation, let's assume the client finishing the game updates their own stats.
           // Or the `submitAnswer` logic handles the match state, and here we just update profile.
           
           const newStats = {
               wins: user.stats.wins + (isWinner ? 1 : 0),
               losses: user.stats.losses + (!isWinner && !isDraw ? 1 : 0),
               gamesPlayed: user.stats.gamesPlayed + 1
           };
           
           const u = StorageService.updateUser({
               points: user.points + pointsToAdd,
               stats: newStats,
               level: Math.floor((user.points + pointsToAdd) / 100) + 1
           });
           if(u) setUser(u);
           
           setView(AppView.RESULTS);
           setLeaderboard(StorageService.getLeaderboard());
      }
  };
  
  const handleReturnHome = () => {
      setView(AppView.DASHBOARD);
      setMatch(null);
      StorageService.clearMatch(); // Clean up so we don't rejoin automatically
  };

  // Render

  return (
    <div className="text-slate-200">
      {view === AppView.REGISTER && <RegisterView onComplete={handleRegister} />}
      {view === AppView.DASHBOARD && user && <DashboardView user={user} onFindMatch={handleFindMatch} leaderboard={leaderboard} />}
      {view === AppView.LOBBY && <LobbyView onCancel={handleCancelSearch} subject={localStorage.getItem('LPF4_selected_subject')} lesson={localStorage.getItem('LPF4_selected_lesson')} />}
      {view === AppView.GAME && match && user && <GameView match={match} userPid={user.pid} onSubmitAnswer={handleSubmitAnswer} />}
      {view === AppView.RESULTS && match && user && <ResultsView match={match} userPid={user.pid} onHome={handleReturnHome} />}
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);