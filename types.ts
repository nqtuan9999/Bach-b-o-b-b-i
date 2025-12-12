export enum AppMode {
  EXPLORE = 'EXPLORE',
  QUIZ = 'QUIZ',
  CHAT = 'CHAT',
  GAME = 'GAME'
}

export type ThemeColor = 'teal' | 'blue' | 'rose' | 'amber' | 'violet';

// Grade level from 1 to 12
export type GradeLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface AppSettings {
  theme: ThemeColor;
  gradeLevel: GradeLevel;
  language: string; // Tên ngôn ngữ (e.g., 'Vietnamese', 'English', 'French')
}

export interface Landmark {
  id: string;
  name: string;
  category: 'History' | 'Economy' | 'Culture';
  description: string;
  imageUrl: string;
  oldImageUrl?: string; // Cho tính năng Time Window
  audioText?: string; // Cho Audio Guide
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // Index of the correct option
  explanation: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface Quest {
  id: string;
  label: string;
  target: number;
  current: number;
  completed: boolean;
  xpReward: number;
}

export interface UserState {
  xp: number;
  level: number;
  quests: Quest[];
  inventory: string[]; // Cho game Tycoon
  money: number; // Cho game Tycoon
}