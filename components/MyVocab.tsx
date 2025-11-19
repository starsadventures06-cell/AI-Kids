
import React, { useEffect, useState } from 'react';
import type { Language, VocabItem } from '../types';
import { translations } from '../constants';
import { getSavedVocab, deleteVocabItem } from '../services/storageService';

interface MyVocabProps {
  lang: Language;
}

export const MyVocab: React.FC<MyVocabProps> = ({ lang }) => {
  const [items, setItems] = useState<VocabItem[]>([]);
  const t = translations[lang];

  useEffect(() => {
    setItems(getSavedVocab());
  }, []);

  const handleDelete = (id: string) => {
    deleteVocabItem(id);
    setItems(getSavedVocab());
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 bg-white rounded-2xl shadow-lg min-h-[400px]">
      <h2 className="text-3xl font-bold text-center text-purple-800 mb-8">{t.myVocab}</h2>
      
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <p className="text-xl font-medium text-center">{t.vocabEmpty}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-blue-50 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col">
              <div className="aspect-square w-full bg-gray-200 relative overflow-hidden group">
                <img 
                  src={item.imageBase64} 
                  alt="Mnemonic" 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" 
                />
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <div className="flex flex-wrap gap-2 mb-4 flex-grow content-start">
                  {item.words.map((word, idx) => (
                    <span key={idx} className="inline-block bg-white text-purple-700 text-sm font-bold px-3 py-1 rounded-full border border-purple-100">
                      {word}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between items-center text-sm text-gray-400 mt-auto pt-2 border-t border-blue-100">
                  <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="text-red-500 hover:text-red-700 font-semibold hover:underline"
                  >
                    {t.delete}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
