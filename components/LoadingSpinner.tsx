
import React from 'react';

interface LoadingSpinnerProps {
    message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
    return (
        <div className="flex flex-col items-center justify-center space-y-4 p-8">
            <div className="w-16 h-16 border-8 border-yellow-300 border-t-purple-500 rounded-full animate-spin"></div>
            {message && <p className="text-lg font-semibold text-purple-700 animate-pulse">{message}</p>}
        </div>
    );
};
