
import React, { useState } from 'react';
import { Language, Section } from './types';
import { translations } from './constants';
import { StoryTime } from './components/StoryTime';
import { Mnemonics } from './components/Mnemonics';
import { OnlineAdventure } from './components/OnlineAdventure';
import { MyVocab } from './components/MyVocab';
import { StudyBuddy } from './components/StudyBuddy';
import { HealthAdviser } from './components/HealthAdviser';
import { StoryIcon } from './components/icons/StoryIcon';
import { MnemonicIcon } from './components/icons/MnemonicIcon';
import { AdventureIcon } from './components/icons/AdventureIcon';
import { VocabIcon } from './components/icons/VocabIcon';
import { StudyIcon } from './components/icons/StudyIcon';
import { HealthIcon } from './components/icons/HealthIcon';


const App: React.FC = () => {
    const [language, setLanguage] = useState<Language>('en');
    const [activeSection, setActiveSection] = useState<Section>(Section.Story);

    const t = translations[language];

    const renderSection = () => {
        switch (activeSection) {
            case Section.Story:
                return <StoryTime lang={language} />;
            case Section.Mnemonics:
                return <Mnemonics lang={language} />;
            case Section.Adventure:
                return <OnlineAdventure lang={language} />;
            case Section.Vocab:
                return <MyVocab lang={language} />;
            case Section.StudyBuddy:
                return <StudyBuddy lang={language} />;
            case Section.HealthAdviser:
                return <HealthAdviser lang={language} />;
            default:
                return <StoryTime lang={language} />;
        }
    };

    const NavButton = ({ section, icon, label }: { section: Section, icon: React.ReactNode, label: string }) => (
        <button
            onClick={() => setActiveSection(section)}
            className={`flex flex-col md:flex-row items-center justify-center space-y-1 md:space-y-0 md:space-x-3 px-4 py-2 rounded-full transition-all duration-300 font-semibold text-lg whitespace-nowrap ${
                activeSection === section 
                ? 'bg-white text-purple-600 shadow-md scale-105' 
                : 'bg-white/50 text-purple-800 hover:bg-white/80'
            }`}
        >
            {icon}
            <span className="hidden md:inline">{label}</span>
        </button>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-yellow-100 font-sans p-4">
            <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0">
                <h1 className="text-4xl font-bold text-purple-800 tracking-wider" style={{fontFamily: "'Comic Sans MS', cursive, sans-serif"}}>{t.title}</h1>
                <div className="flex items-center space-x-2 bg-white/60 p-1 rounded-full">
                    <button onClick={() => setLanguage('uz')} className={`px-4 py-1 rounded-full ${language === 'uz' ? 'bg-white shadow' : ''}`}>UZ</button>
                    <button onClick={() => setLanguage('en')} className={`px-4 py-1 rounded-full ${language === 'en' ? 'bg-white shadow' : ''}`}>EN</button>
                    <button onClick={() => setLanguage('ru')} className={`px-4 py-1 rounded-full ${language === 'ru' ? 'bg-white shadow' : ''}`}>RU</button>
                </div>
            </header>

            <nav className="max-w-6xl mx-auto flex justify-start lg:justify-center items-center space-x-2 md:space-x-4 bg-purple-300/50 p-2 rounded-full shadow-inner mb-8 overflow-x-auto no-scrollbar pb-4 md:pb-2">
                <NavButton section={Section.Story} icon={<StoryIcon className="w-6 h-6" />} label={t.storyTime} />
                <NavButton section={Section.Mnemonics} icon={<MnemonicIcon className="w-6 h-6" />} label={t.mnemonics} />
                <NavButton section={Section.Vocab} icon={<VocabIcon className="w-6 h-6" />} label={t.myVocab} />
                <NavButton section={Section.StudyBuddy} icon={<StudyIcon className="w-6 h-6" />} label={t.studyBuddy} />
                <NavButton section={Section.HealthAdviser} icon={<HealthIcon className="w-6 h-6" />} label={t.healthAdviser} />
                <NavButton section={Section.Adventure} icon={<AdventureIcon className="w-6 h-6" />} label={t.onlineAdventure} />
            </nav>

            <main>
                {renderSection()}
            </main>
        </div>
    );
};

export default App;
