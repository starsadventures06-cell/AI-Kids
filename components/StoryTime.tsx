
import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { Language, StoryPart } from '../types';
import { translations } from '../constants';
import { generateStory } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';

interface StoryTimeProps {
  lang: Language;
}

export const StoryTime: React.FC<StoryTimeProps> = ({ lang }) => {
  const [answers, setAnswers] = useState<string[]>(Array(5).fill(''));
  const [story, setStory] = useState<StoryPart[]>([]);
  const [currentPart, setCurrentPart] = useState(0);
  const [status, setStatus] = useState<'idle' | 'generating' | 'playing' | 'error'>('idle');
  const [progress, setProgress] = useState('');
  
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleGenerateStory = useCallback(async () => {
    setStatus('generating');
    setProgress(translations[lang].generating);
    try {
      const result = await generateStory(answers, lang, (p) => setProgress(translations[lang][p]));
      setStory(result.story);
      setCurrentPart(0);
      setStatus('playing');
    } catch (error) {
      console.error("Error generating story:", error);
      setStatus('error');
    }
  }, [answers, lang]);

  const playAudio = useCallback((index: number) => {
    if (audioSourceRef.current) {
        audioSourceRef.current.stop();
    }

    if (story[index] && story[index].audioBuffer) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = audioContext.createBufferSource();
        source.buffer = story[index].audioBuffer;
        source.connect(audioContext.destination);
        source.start();
        audioSourceRef.current = source;
    }
  }, [story]);

  useEffect(() => {
    if (status === 'playing' && story.length > 0) {
        playAudio(currentPart);
    }
  }, [status, story, currentPart, playAudio]);

  const handleNext = () => {
    if (currentPart < story.length - 1) {
        setCurrentPart(prev => prev + 1);
    }
  };
  
  const handlePrev = () => {
    if (currentPart > 0) {
        setCurrentPart(prev => prev - 1);
    }
  };

  const t = translations[lang];

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8 bg-white rounded-2xl shadow-lg">
      {status === 'idle' && (
        <div className="flex flex-col items-center">
            <p className="text-center text-lg text-gray-700 mb-6">{t.storyIntro}</p>
            <div className="w-full space-y-4">
                {t.questions.map((q: string, i: number) => (
                    <div key={i}>
                        <label className="font-semibold text-gray-600">{i + 1}. {q}</label>
                        <input
                            type="text"
                            value={answers[i]}
                            onChange={(e) => handleAnswerChange(i, e.target.value)}
                            className="mt-1 block w-full px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg focus:ring-purple-500 focus:border-purple-500 transition"
                        />
                    </div>
                ))}
            </div>
            <button
                onClick={handleGenerateStory}
                disabled={answers.some(a => a.trim() === '')}
                className="mt-8 px-8 py-3 bg-purple-600 text-white font-bold rounded-full hover:bg-purple-700 disabled:bg-gray-400 transform hover:scale-105 transition-transform duration-300"
            >
                {t.generateStory}
            </button>
        </div>
      )}
      {status === 'generating' && <LoadingSpinner message={progress} />}
      {status === 'error' && <p className="text-center text-red-500 font-bold">{t.storyError}</p>}
      {status === 'playing' && story.length > 0 && (
         <div className="flex flex-col items-center">
            <div className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden shadow-md mb-4">
                <img src={story[currentPart].imageBase64} alt={`Story part ${currentPart + 1}`} className="w-full h-full object-cover animate-fade-in" />
            </div>
            <p className="text-center text-gray-800 text-lg mb-4 h-24 overflow-y-auto p-2">{story[currentPart].text}</p>
            <div className="flex items-center space-x-4">
                <button onClick={handlePrev} disabled={currentPart === 0} className="px-6 py-2 bg-yellow-400 text-yellow-900 font-bold rounded-full disabled:opacity-50 hover:bg-yellow-500 transition">Prev</button>
                <span className="font-bold text-gray-700">{currentPart + 1} / {story.length}</span>
                <button onClick={handleNext} disabled={currentPart === story.length - 1} className="px-6 py-2 bg-yellow-400 text-yellow-900 font-bold rounded-full disabled:opacity-50 hover:bg-yellow-500 transition">Next</button>
            </div>
         </div>
      )}
    </div>
  );
};
