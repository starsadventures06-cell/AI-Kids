
import React, { useState, useCallback } from 'react';
import type { Language } from '../types';
import { translations } from '../constants';
import { generateMnemonicImage } from '../services/geminiService';
import { saveVocabItem } from '../services/storageService';
import { LoadingSpinner } from './LoadingSpinner';

interface MnemonicsProps {
  lang: Language;
}

export const Mnemonics: React.FC<MnemonicsProps> = ({ lang }) => {
  const [words, setWords] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'generating' | 'done' | 'error'>('idle');

  const t = translations[lang];

  const handleAddWord = () => {
    if (currentWord.trim() && words.length < 10) {
      setWords([...words, currentWord.trim()]);
      setCurrentWord('');
    }
  };

  const handleRemoveWord = (index: number) => {
    setWords(words.filter((_, i) => i !== index));
  };
  
  const handleGenerate = useCallback(async () => {
    if (words.length < 3) return;
    setStatus('generating');
    setImage(null);
    try {
      const generatedImage = await generateMnemonicImage(words, lang);
      setImage(generatedImage);
      saveVocabItem(words, generatedImage);
      setStatus('done');
    } catch (error) {
      console.error("Error generating mnemonic image:", error);
      setStatus('error');
    }
  }, [words, lang]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8 bg-white rounded-2xl shadow-lg">
      <p className="text-center text-lg text-gray-700 mb-6">{t.mnemonicsIntro}</p>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3 space-y-4">
          <div>
            <div className="flex space-x-2">
              <input 
                type="text"
                value={currentWord}
                onChange={(e) => setCurrentWord(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddWord()}
                placeholder={t.enterWord}
                className="flex-grow px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg focus:ring-purple-500 focus:border-purple-500 transition"
              />
              <button onClick={handleAddWord} disabled={words.length >= 10} className="px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition">+</button>
            </div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg min-h-[150px]">
            <h3 className="font-bold text-blue-800 mb-2">{t.words} ({words.length})</h3>
            <div className="flex flex-wrap gap-2">
              {words.map((word, i) => (
                <span key={i} className="flex items-center bg-blue-200 text-blue-800 text-sm font-semibold px-2.5 py-1 rounded-full">
                  {word}
                  <button onClick={() => handleRemoveWord(i)} className="ml-2 text-blue-600 hover:text-blue-900">&times;</button>
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={words.length < 3 || words.length > 10 || status === 'generating'}
            className="w-full px-8 py-3 bg-purple-600 text-white font-bold rounded-full hover:bg-purple-700 disabled:bg-gray-400 transform hover:scale-105 transition-transform duration-300"
          >
            {t.generateImage}
          </button>
        </div>
        <div className="w-full md:w-2/3 flex items-center justify-center bg-gray-100 rounded-lg aspect-square">
            {status === 'generating' && <LoadingSpinner message="Creating your image..." />}
            {status === 'error' && <p className="text-center text-red-500 font-bold">{t.mnemonicsError}</p>}
            {status === 'done' && image && (
                <img src={image} alt="Mnemonic representation" className="w-full h-full object-contain rounded-lg animate-fade-in" />
            )}
        </div>
      </div>
    </div>
  );
};
