import React, { useState, useRef, useEffect, ReactNode } from 'react';

interface TooltipProps {
  children: ReactNode;
  content: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
  delay?: number;
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'top',
  delay = 400,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Calculate position based on the chosen direction
  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    
    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = -tooltipRect.height - 5;
        left = (triggerRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'right':
        top = (triggerRect.height / 2) - (tooltipRect.height / 2);
        left = triggerRect.width + 5;
        break;
      case 'bottom':
        top = triggerRect.height + 5;
        left = (triggerRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'left':
        top = (triggerRect.height / 2) - (tooltipRect.height / 2);
        left = -tooltipRect.width - 5;
        break;
    }

    setTooltipPosition({ top, left });
  };

  // Handle mouse enter
  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      // Wait for the tooltip to render, then calculate position
      setTimeout(calculatePosition, 0);
    }, delay);
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  };

  // Clean up timeout on component unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Arrow direction based on position
  const arrowClass = {
    top: 'bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full border-t-gray-800 border-l-transparent border-r-transparent border-b-transparent',
    right: 'left-0 top-1/2 transform -translate-y-1/2 -translate-x-full border-r-gray-800 border-t-transparent border-b-transparent border-l-transparent',
    bottom: 'top-0 left-1/2 transform -translate-x-1/2 -translate-y-full border-b-gray-800 border-l-transparent border-r-transparent border-t-transparent',
    left: 'right-0 top-1/2 transform -translate-y-1/2 translate-x-full border-l-gray-800 border-t-transparent border-b-transparent border-r-transparent',
  };

  return (
    <div
      ref={triggerRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className="absolute z-50 whitespace-nowrap"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
          }}
        >
          <div className="bg-gray-800 text-white text-xs py-1 px-2 rounded shadow-lg">
            {content}
            <div
              className={`absolute w-0 h-0 border-4 ${arrowClass[position]}`}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Tooltip; 