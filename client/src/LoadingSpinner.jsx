import React from 'react';

const LoadingSpinner = ({ size = 'md', message = 'Loading...' }) => {
    const sizeClasses = {
        sm: 'h-4 w-4 border-2',
        md: 'h-8 w-8 border-3',
        lg: 'h-12 w-12 border-4'
    };

    return (
        <div className="flex flex-col items-center justify-center gap-3">
            <div className={`${sizeClasses[size]} border-pink-200 border-t-pink-500 rounded-full animate-spin`}></div>
            {message && <p className="text-sm text-gray-600 font-ui animate-pulse">{message}</p>}
        </div>
    );
};

export default LoadingSpinner;
