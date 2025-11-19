
export type Language = 'uz' | 'en' | 'ru';

export enum Section {
  Story = 'story',
  Mnemonics = 'mnemonics',
  Adventure = 'adventure',
  Vocab = 'vocab',
  StudyBuddy = 'study_buddy',
  HealthAdviser = 'health_adviser',
}

export interface StoryPart {
  text: string;
  imageBase64: string;
  audioBuffer: AudioBuffer | null;
}

export interface VocabItem {
  id: string;
  words: string[];
  imageBase64: string;
  timestamp: number;
}
