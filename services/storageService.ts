
import type { VocabItem } from '../types';

const VOCAB_KEY = 'kids_world_vocab';

export const getSavedVocab = (): VocabItem[] => {
  try {
    const stored = localStorage.getItem(VOCAB_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to load vocab", e);
    return [];
  }
};

export const saveVocabItem = (words: string[], imageBase64: string) => {
  try {
    const items = getSavedVocab();
    const newItem: VocabItem = {
      id: Date.now().toString(),
      words,
      imageBase64,
      timestamp: Date.now(),
    };
    // Limit to last 20 items to prevent storage full errors
    const updatedItems = [newItem, ...items].slice(0, 20);
    localStorage.setItem(VOCAB_KEY, JSON.stringify(updatedItems));
  } catch (e) {
    console.error("Failed to save vocab", e);
  }
};

export const deleteVocabItem = (id: string) => {
  try {
    const items = getSavedVocab();
    const filtered = items.filter(item => item.id !== id);
    localStorage.setItem(VOCAB_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error("Failed to delete vocab", e);
  }
};
