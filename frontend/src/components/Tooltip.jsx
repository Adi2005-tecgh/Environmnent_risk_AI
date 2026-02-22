import React, { useState } from 'react';
import { Info } from 'lucide-react';

const Tooltip = ({ content, children }) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div className="relative inline-block">
            <div
                className="inline-flex items-center cursor-help"
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
            >
                {children}
                <Info size={12} className="text-slate-400 ml-1 hover:text-slate-600 transition-colors" />
            </div>
            
            {isVisible && (
                <div className="absolute z-50 w-64 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-lg border border-slate-700 -top-2 left-full ml-2">
                    <div className="absolute -right-2 top-3 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-slate-900"></div>
                    {content}
                </div>
            )}
        </div>
    );
};

export default Tooltip;
