
import React, { useState } from 'react';
import type { Language } from '../types';
import { translations } from '../constants';
import { askStudyBuddy, type StudyResult } from '../services/studyService';
import { LoadingSpinner } from './LoadingSpinner';

interface StudyBuddyProps {
  lang: Language;
}

export const StudyBuddy: React.FC<StudyBuddyProps> = ({ lang }) => {
  const [subject, setSubject] = useState<string>('cs');
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState<StudyResult | null>(null);
  const [status, setStatus] = useState<'idle' | 'generating' | 'done' | 'error'>('idle');

  const t = translations[lang];

  const handleAsk = async () => {
    if (!question.trim()) return;
    setStatus('generating');
    setResult(null);
    try {
        const data = await askStudyBuddy(question, subject, lang);
        setResult(data);
        setStatus('done');
    } catch (e) {
        console.error(e);
        setStatus('error');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 bg-white rounded-2xl shadow-lg min-h-[500px]">
        <p className="text-center text-lg text-gray-700 mb-6">{t.studyIntro}</p>
        
        <div className="flex flex-col md:flex-row gap-8">
            {/* Input Section */}
            <div className="w-full md:w-1/3 space-y-6">
                <div>
                    <label className="block font-bold text-purple-800 mb-2">{t.selectSubject}</label>
                    <div className="grid grid-cols-1 gap-2">
                        {t.subjects.map((sub: {value: string, label: string}) => (
                            <button
                                key={sub.value}
                                onClick={() => setSubject(sub.value)}
                                className={`px-4 py-2 rounded-lg text-left transition-all ${
                                    subject === sub.value 
                                    ? 'bg-purple-600 text-white shadow-md transform scale-105' 
                                    : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                                }`}
                            >
                                {sub.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block font-bold text-purple-800 mb-2">{t.askQuestion}</label>
                    <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder={t.enterQuestion}
                        className="w-full h-32 p-4 bg-blue-50 border border-blue-200 rounded-xl focus:ring-purple-500 focus:border-purple-500 transition resize-none"
                    />
                </div>

                <button 
                    onClick={handleAsk}
                    disabled={!question.trim() || status === 'generating'}
                    className="w-full px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-full hover:shadow-lg disabled:opacity-50 transform hover:scale-105 transition-all"
                >
                    {t.askQuestion}
                </button>
            </div>

            {/* Output Section */}
            <div className="w-full md:w-2/3 bg-gray-50 rounded-2xl p-4 md:p-6 border border-gray-200 min-h-[400px] flex flex-col">
                {status === 'generating' && (
                    <div className="flex-grow flex items-center justify-center">
                        <LoadingSpinner message={t.generatingAnswer} />
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex-grow flex items-center justify-center text-red-500 font-bold">
                        {t.studyError}
                    </div>
                )}
                
                {status === 'idle' && (
                    <div className="flex-grow flex items-center justify-center text-gray-400 text-center">
                        <div className="max-w-xs">
                            <p className="text-6xl mb-4">🎓</p>
                            <p>{t.studyIntro}</p>
                        </div>
                    </div>
                )}

                {status === 'done' && result && (
                    <div className="animate-fade-in flex flex-col h-full">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 overflow-y-auto max-h-64">
                            <h3 className="text-xl font-bold text-purple-900 mb-4 border-b pb-2">{question}</h3>
                            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{result.answer}</p>
                        </div>
                        
                        <div className="flex-grow rounded-xl overflow-hidden bg-gray-200 relative min-h-[250px]">
                            <img 
                                src={result.imageUrl} 
                                alt="Visual Explanation" 
                                className="w-full h-full object-contain absolute inset-0 bg-black/5"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-xs text-center backdrop-blur-sm">
                                AI Generated Visualization for {subject === 'medicine' ? 'Medicine (3D Mode)' : subject}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};
