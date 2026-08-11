import React, { useState, useRef, useEffect } from 'react';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right' | 'auto';
type TooltipTrigger = 'hover' | 'click' | 'focus';

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: TooltipPosition;
  trigger?: TooltipTrigger;
  delay?: number;
  className?: string;
  contentClassName?: string;
  maxWidth?: number;
  arrow?: boolean;
  theme?: 'light' | 'dark' | 'auto';
}

/**
 * Tooltip Component
 * يعرض تلميح عند تمرير مؤشر الماوس أو النقر
 */
export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'top',
  trigger = 'hover',
  delay = 200,
  className = '',
  contentClassName = '',
  maxWidth = 250,
  arrow = true,
  theme = 'auto',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>(position);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>(undefined);

  // Calculate tooltip position to avoid viewport overflow
  useEffect(() => {
    if (!isVisible || !triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let finalPosition = position;

    if (position === 'auto') {
      // Check if there's enough space for each position
      if (triggerRect.top > tooltipRect.height + 10) {
        finalPosition = 'top';
      } else if (viewportHeight - triggerRect.bottom > tooltipRect.height + 10) {
        finalPosition = 'bottom';
      } else if (triggerRect.left > tooltipRect.width + 10) {
        finalPosition = 'left';
      } else if (viewportWidth - triggerRect.right > tooltipRect.width + 10) {
        finalPosition = 'right';
      } else {
        finalPosition = 'top';
      }
    }

    setTooltipPosition(finalPosition);
  }, [isVisible, position]);

  const handleMouseEnter = () => {
    if (trigger !== 'hover') return;
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
  };

  const handleMouseLeave = () => {
    if (trigger !== 'hover') return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  const handleClick = () => {
    if (trigger !== 'click') return;
    setIsVisible(!isVisible);
  };

  const handleFocus = () => {
    if (trigger !== 'focus') return;
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
  };

  const handleBlur = () => {
    if (trigger !== 'focus') return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  const getPositionClasses = () => {
    const baseClasses = 'absolute z-50 pointer-events-none';
    const spacing = 8;

    switch (tooltipPosition) {
      case 'top':
        return `${baseClasses} bottom-full left-1/2 -translate-x-1/2 mb-${spacing}`;
      case 'bottom':
        return `${baseClasses} top-full left-1/2 -translate-x-1/2 mt-${spacing}`;
      case 'left':
        return `${baseClasses} right-full top-1/2 -translate-y-1/2 mr-${spacing}`;
      case 'right':
        return `${baseClasses} left-full top-1/2 -translate-y-1/2 ml-${spacing}`;
      default:
        return baseClasses;
    }
  };

  const getArrowClasses = () => {
    const baseClasses = 'absolute w-2 h-2 bg-inherit rotate-45';
    const spacing = -4;

    switch (tooltipPosition) {
      case 'top':
        return `${baseClasses} -bottom-1 left-1/2 -translate-x-1/2`;
      case 'bottom':
        return `${baseClasses} -top-1 left-1/2 -translate-x-1/2`;
      case 'left':
        return `${baseClasses} -right-1 top-1/2 -translate-y-1/2`;
      case 'right':
        return `${baseClasses} -left-1 top-1/2 -translate-y-1/2`;
      default:
        return baseClasses;
    }
  };

  const isDarkMode = theme === 'auto' 
    ? document.documentElement.classList.contains('dark')
    : theme === 'dark';

  return (
    <div
      ref={triggerRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {children}

      {isVisible && (
        <div
          ref={tooltipRef}
          className={`
            ${getPositionClasses()}
            px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap
            transition-all duration-200 opacity-0 scale-95 pointer-events-auto
            ${isDarkMode
              ? 'bg-gray-800 text-gray-100 border border-gray-700'
              : 'bg-gray-900 text-white border border-gray-800'
            }
            ${contentClassName}
          `}
          style={{
            maxWidth: `${maxWidth}px`,
            animation: 'fadeInScale 200ms ease-out forwards',
          }}
          role="tooltip"
        >
          {content}
          {arrow && <div className={getArrowClasses()} />}
        </div>
      )}

      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Tooltip Group Component
 * لإدارة مجموعة من التلميحات
 */
export const TooltipGroup: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      {children}
    </div>
  );
};

/**
 * Rich Tooltip Component
 * تلميح متقدم مع رأس وجسم وتذييل
 */
export const RichTooltip: React.FC<{
  children: React.ReactNode;
  title?: string;
  content: React.ReactNode;
  footer?: string;
  position?: TooltipPosition;
  trigger?: TooltipTrigger;
  delay?: number;
  className?: string;
}> = ({
  children,
  title,
  content,
  footer,
  position = 'top',
  trigger = 'hover',
  delay = 200,
  className = '',
}) => {
  return (
    <Tooltip
      content={
        <div className="space-y-1">
          {title && <div className="font-bold text-yellow-400">{title}</div>}
          <div className="text-sm">{content}</div>
          {footer && <div className="text-xs opacity-75">{footer}</div>}
        </div>
      }
      position={position}
      trigger={trigger}
      delay={delay}
      maxWidth={300}
      className={className}
    >
      {children}
    </Tooltip>
  );
};

/**
 * Tooltip with Icon Component
 * تلميح مع أيقونة
 */
export const TooltipWithIcon: React.FC<{
  children: React.ReactNode;
  content: React.ReactNode;
  icon?: React.ReactNode;
  position?: TooltipPosition;
  trigger?: TooltipTrigger;
  delay?: number;
}> = ({
  children,
  content,
  icon,
  position = 'top',
  trigger = 'hover',
  delay = 200,
}) => {
  return (
    <Tooltip
      content={
        <div className="flex items-center gap-2">
          {icon && <div className="flex-shrink-0">{icon}</div>}
          <div>{content}</div>
        </div>
      }
      position={position}
      trigger={trigger}
      delay={delay}
      maxWidth={300}
    >
      {children}
    </Tooltip>
  );
};
