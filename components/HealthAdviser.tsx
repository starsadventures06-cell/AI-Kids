
import React, { useState } from 'react';
import type { Language } from '../types';
import { translations } from '../constants';
import { askHealthAdviser, type HealthResult } from '../services/healthService';
import { LoadingSpinner } from './LoadingSpinner';

interface HealthAdviserProps {
  lang: Language;
}

export const HealthAdviser: React.FC<HealthAdviserProps> = ({ lang }) => {
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState<HealthResult | null>(null);
  const [status, setStatus] = useState<'idle' | 'generating' | 'done' | 'error'>('idle');

  const t = translations[lang];

  const handleAsk = async () => {
    if (!question.trim()) return;
    setStatus('generating');
    setResult(null);
    try {
        const data = await askHealthAdviser(question, lang);
        setResult(data);
        setStatus('done');
    } catch (e) {
        console.error(e);
        setStatus('error');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 bg-white rounded-2xl shadow-lg min-h-[500px]">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-red-500 mb-2">{t.healthAdviser}</h2>
            <p className="text-lg text-gray-600">{t.healthIntro}</p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Input Section */}
            <div className="w-full lg:w-1/3 space-y-6">
                <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                    <label className="block font-bold text-red-800 mb-3 text-lg">{t.healthPlaceholder}</label>
                    <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder={t.healthPlaceholder}
                        className="w-full h-48 p-4 bg-white border border-red-200 rounded-xl focus:ring-red-500 focus:border-red-500 transition resize-none text-gray-800 placeholder-gray-400 shadow-inner"
                    />
                    <button 
                        onClick={handleAsk}
                        disabled={!question.trim() || status === 'generating'}
                        className="w-full mt-4 px-8 py-4 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg disabled:opacity-50 transform hover:scale-105 transition-all flex items-center justify-center space-x-2"
                    >
                        <span>{t.getHealthAdvice}</span>
                    </button>
                </div>
            </div>

            {/* Output Section */}
            <div className="w-full lg:w-2/3 bg-gray-50 rounded-2xl p-4 md:p-8 border border-gray-200 min-h-[500px] flex flex-col">
                {status === 'generating' && (
                    <div className="flex-grow flex flex-col items-center justify-center space-y-4">
                        <LoadingSpinner message={t.generatingHealth} />
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex-grow flex items-center justify-center text-red-500 font-bold text-lg bg-red-50 rounded-xl border border-red-100">
                        {t.healthError}
                    </div>
                )}
                
                {status === 'idle' && (
                    <div className="flex-grow flex flex-col items-center justify-center text-gray-400 text-center opacity-50">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-24 h-24 mb-4 text-red-300">
                            <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                        </svg>
                        <p className="text-xl font-medium">AI Health Adviser is ready to help!</p>
                    </div>
                )}

                {status === 'done' && result && (
                    <div className="animate-fade-in flex flex-col h-full space-y-6">
                        <div className="flex-grow rounded-2xl overflow-hidden bg-black shadow-lg relative min-h-[300px] md:min-h-[400px] group">
                            <img 
                                src={result.imageUrl} 
                                alt="3D Medical Visualization" 
                                className="w-full h-full object-contain absolute inset-0 transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm">
                                3D Render Mode
                            </div>
                        </div>

                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-md border-l-8 border-red-500">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">{question}</h3>
                            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {result.answer}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};
