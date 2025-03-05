import React, { useState, ReactNode } from 'react';

interface PanelProps {
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
}

const Panel: React.FC<PanelProps> = ({
  title,
  children,
  defaultExpanded = true,
  className = '',
  headerClassName = '',
  bodyClassName = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`border rounded overflow-hidden ${className}`}>
      <div 
        className={`
          flex items-center justify-between p-3 bg-gray-50 border-b cursor-pointer
          ${isExpanded ? '' : 'border-b-0'}
          ${headerClassName}
        `}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="font-medium text-sm">{title}</h3>
        <button
          type="button"
          className="text-gray-500"
          aria-label={isExpanded ? 'Collapse panel' : 'Expand panel'}
        >
          <svg
            className={`w-4 h-4 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      {isExpanded && (
        <div className={`p-4 ${bodyClassName}`}>
          {children}
        </div>
      )}
    </div>
  );
};

export default Panel; 