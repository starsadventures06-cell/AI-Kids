
import React, { useState, useCallback } from 'react';
import type { Language } from '../types';
import { translations } from '../constants';
import { generateAdventureImage } from '../services/geminiService';
import { fileToBase64 } from '../services/utils';
import { LoadingSpinner } from './LoadingSpinner';

interface OnlineAdventureProps {
  lang: Language;
}

export const OnlineAdventure: React.FC<OnlineAdventureProps> = ({ lang }) => {
  const [userImage, setUserImage] = useState<string | null>(null);
  const [userImageBase64, setUserImageBase64] = useState<string | null>(null);
  const [theme, setTheme] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'generating' | 'done' | 'error'>('idle');
  
  const t = translations[lang];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUserImage(URL.createObjectURL(file));
      const base64 = await fileToBase64(file);
      setUserImageBase64(base64);
    }
  };
  
  const handleGenerate = useCallback(async () => {
    if (!userImageBase64 || !theme) return;
    setStatus('generating');
    setGeneratedImage(null);
    try {
      const result = await generateAdventureImage(userImageBase64, theme, lang);
      setGeneratedImage(result);
      setStatus('done');
    } catch (error) {
      console.error("Error in adventure generation:", error);
      setStatus('error');
    }
  }, [userImageBase64, theme, lang]);

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 bg-white rounded-2xl shadow-lg">
      <p className="text-center text-lg text-gray-700 mb-6">{t.adventureIntro}</p>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="relative w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
            {userImage ? (
              <img src={userImage} alt="User upload" className="w-full h-full object-cover rounded-lg"/>
            ) : (
              <span>{t.uploadImage}</span>
            )}
            <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          </div>
          <div>
            <label className="font-semibold text-gray-600">{t.chooseTheme}</label>
            <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="mt-1 block w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg focus:ring-purple-500 focus:border-purple-500 transition"
            >
                <option value="" disabled>Select a theme</option>
                {t.themes.map((th: { value: string, label: string }) => (
                    <option key={th.value} value={th.value}>{th.label}</option>
                ))}
            </select>
          </div>
          <button 
            onClick={handleGenerate}
            disabled={!userImage || !theme || status === 'generating'}
            className="w-full px-8 py-3 bg-purple-600 text-white font-bold rounded-full hover:bg-purple-700 disabled:bg-gray-400 transform hover:scale-105 transition-transform duration-300"
          >
            {t.generateImage}
          </button>
        </div>
        <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
            {status === 'generating' && <LoadingSpinner message="Embarking on your adventure..." />}
            {status === 'error' && <p className="text-center text-red-500 font-bold">{t.adventureError}</p>}
            {(status === 'idle' || status === 'done') && generatedImage && (
                <img src={generatedImage} alt={t.yourAdventure} className="w-full h-full object-cover rounded-lg animate-fade-in" />
            )}
        </div>
      </div>
    </div>
  );
};
