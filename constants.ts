import { Question } from './types';

export const SUBJECTS = [
  { id: 'math', name: 'Mathematics', icon: 'Calculator' },
  { id: 'science', name: 'Science', icon: 'FlaskConical' },
  { id: 'history', name: 'History', icon: 'ScrollText' },
];

export const LESSONS: Record<string, string[]> = {
  math: ['Algebra Basics', 'Geometry', 'Mental Math'],
  science: ['Physics 101', 'Chemistry', 'Biology'],
  history: ['Ancient Rome', 'World War II', 'Cold War'],
};

// Mock Question Generator
export const generateQuestions = (subject: string, lesson: string): Question[] => {
  // In a real app, this might come from Gemini API or a database.
  // We generate 5 mock questions based on the selection.
  const questions: Question[] = [];
  
  for (let i = 1; i <= 5; i++) {
    questions.push({
      id: `q-${Date.now()}-${i}`,
      text: `Question ${i} about ${lesson} (${subject})`,
      choices: [
        `Correct Answer ${i}`,
        `Wrong Answer A`,
        `Wrong Answer B`,
        `Wrong Answer C`
      ].sort(() => Math.random() - 0.5),
      correctAnswer: `Correct Answer ${i}`
    });
  }
  return questions;
};

export const AVATARS = [
  '🤖', '👽', '🦊', '🐯', '🦁', '🐸', '🐙', '🦄', '🐲', '🧙‍♂️'
];
