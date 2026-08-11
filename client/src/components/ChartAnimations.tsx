import React from 'react';

/**
 * Chart Animation Styles
 * أنماط التأثيرات المتحركة للرسوم البيانية
 */
export const chartAnimationStyles = `
  /* Tooltip animations */
  @keyframes tooltipFadeIn {
    from {
      opacity: 0;
      transform: translateY(-8px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes tooltipFadeOut {
    from {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    to {
      opacity: 0;
      transform: translateY(-8px) scale(0.95);
    }
  }

  /* Bar animations */
  @keyframes barSlideUp {
    from {
      height: 0;
      opacity: 0;
    }
    to {
      height: 100%;
      opacity: 1;
    }
  }

  @keyframes barPulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }

  @keyframes barGlow {
    0%, 100% {
      filter: drop-shadow(0 0 0 rgba(249, 198, 0, 0));
    }
    50% {
      filter: drop-shadow(0 0 8px rgba(249, 198, 0, 0.5));
    }
  }

  /* Line animations */
  @keyframes lineDrawing {
    from {
      stroke-dashoffset: 1000;
    }
    to {
      stroke-dashoffset: 0;
    }
  }

  @keyframes pointFadeIn {
    from {
      opacity: 0;
      r: 0;
    }
    to {
      opacity: 1;
      r: 4;
    }
  }

  /* Pie chart animations */
  @keyframes pieSliceRotate {
    from {
      transform: rotate(-90deg);
      opacity: 0;
    }
    to {
      transform: rotate(0deg);
      opacity: 1;
    }
  }

  @keyframes pieLabelSlide {
    from {
      opacity: 0;
      transform: translateX(-10px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  /* Hover effects */
  @keyframes hoverScale {
    from {
      transform: scale(1);
    }
    to {
      transform: scale(1.05);
    }
  }

  @keyframes hoverGlow {
    from {
      filter: drop-shadow(0 0 0 rgba(249, 198, 0, 0));
    }
    to {
      filter: drop-shadow(0 0 12px rgba(249, 198, 0, 0.6));
    }
  }

  /* Loading animations */
  @keyframes skeletonLoading {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }

  @keyframes shimmer {
    0% {
      opacity: 0.6;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0.6;
    }
  }

  /* Legend animations */
  @keyframes legendFadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Grid animations */
  @keyframes gridFadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 0.3;
    }
  }

  /* Axis animations */
  @keyframes axisFadeIn {
    from {
      opacity: 0;
      transform: translateX(-10px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  /* Tooltip positioning animations */
  @keyframes tooltipSlideDown {
    from {
      opacity: 0;
      transform: translateY(-16px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes tooltipSlideUp {
    from {
      opacity: 0;
      transform: translateY(16px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes tooltipSlideLeft {
    from {
      opacity: 0;
      transform: translateX(16px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes tooltipSlideRight {
    from {
      opacity: 0;
      transform: translateX(-16px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  /* Data point animations */
  @keyframes dataPointBounce {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.2);
    }
  }

  @keyframes dataPointPulse {
    0%, 100% {
      r: 4;
      opacity: 1;
    }
    50% {
      r: 6;
      opacity: 0.8;
    }
  }

  /* Value animations */
  @keyframes valueCountUp {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  /* Chart container animations */
  @keyframes chartContainerFadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Responsive animations */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

/**
 * Chart Animation Classes
 * فئات CSS للتأثيرات المتحركة
 */
export const chartAnimationClasses = {
  tooltipFadeIn: 'animate-[tooltipFadeIn_200ms_ease-out]',
  tooltipFadeOut: 'animate-[tooltipFadeOut_200ms_ease-out]',
  barSlideUp: 'animate-[barSlideUp_600ms_ease-out]',
  barPulse: 'animate-[barPulse_2s_ease-in-out_infinite]',
  barGlow: 'animate-[barGlow_2s_ease-in-out_infinite]',
  lineDrawing: 'animate-[lineDrawing_1s_ease-out]',
  pointFadeIn: 'animate-[pointFadeIn_400ms_ease-out]',
  pieSliceRotate: 'animate-[pieSliceRotate_600ms_ease-out]',
  pieLabelSlide: 'animate-[pieLabelSlide_400ms_ease-out]',
  hoverScale: 'hover:animate-[hoverScale_200ms_ease-out]',
  hoverGlow: 'hover:animate-[hoverGlow_200ms_ease-out]',
  skeletonLoading: 'animate-[skeletonLoading_2s_infinite]',
  shimmer: 'animate-[shimmer_1.5s_ease-in-out_infinite]',
  legendFadeIn: 'animate-[legendFadeIn_400ms_ease-out]',
  gridFadeIn: 'animate-[gridFadeIn_300ms_ease-out]',
  axisFadeIn: 'animate-[axisFadeIn_400ms_ease-out]',
  tooltipSlideDown: 'animate-[tooltipSlideDown_200ms_ease-out]',
  tooltipSlideUp: 'animate-[tooltipSlideUp_200ms_ease-out]',
  tooltipSlideLeft: 'animate-[tooltipSlideLeft_200ms_ease-out]',
  tooltipSlideRight: 'animate-[tooltipSlideRight_200ms_ease-out]',
  dataPointBounce: 'animate-[dataPointBounce_600ms_ease-out]',
  dataPointPulse: 'animate-[dataPointPulse_1.5s_ease-in-out_infinite]',
  valueCountUp: 'animate-[valueCountUp_400ms_ease-out]',
  chartContainerFadeIn: 'animate-[chartContainerFadeIn_500ms_ease-out]',
};

/**
 * Animated Chart Container Component
 * حاوية الرسم البياني مع التأثيرات المتحركة
 */
export const AnimatedChartContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
}> = ({ children, className = '', delay = 0 }) => {
  return (
    <div
      className={`${chartAnimationClasses.chartContainerFadeIn} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

/**
 * Animated Bar Component
 * عمود مع تأثير متحرك
 */
export const AnimatedBar: React.FC<{
  children: React.ReactNode;
  delay?: number;
  pulse?: boolean;
  glow?: boolean;
}> = ({ children, delay = 0, pulse = false, glow = false }) => {
  const animations = [chartAnimationClasses.barSlideUp];
  if (pulse) animations.push(chartAnimationClasses.barPulse);
  if (glow) animations.push(chartAnimationClasses.barGlow);

  return (
    <div
      className={animations.join(' ')}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

/**
 * Animated Tooltip Component
 * تلميح مع تأثير متحرك
 */
export const AnimatedTooltip: React.FC<{
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}> = ({ children, position = 'top', delay = 0 }) => {
  const positionAnimations = {
    top: chartAnimationClasses.tooltipSlideDown,
    bottom: chartAnimationClasses.tooltipSlideUp,
    left: chartAnimationClasses.tooltipSlideLeft,
    right: chartAnimationClasses.tooltipSlideRight,
  };

  return (
    <div
      className={`${chartAnimationClasses.tooltipFadeIn} ${positionAnimations[position]}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

/**
 * Animated Data Point Component
 * نقطة بيانات مع تأثير متحرك
 */
export const AnimatedDataPoint: React.FC<{
  children: React.ReactNode;
  delay?: number;
  pulse?: boolean;
  bounce?: boolean;
}> = ({ children, delay = 0, pulse = false, bounce = false }) => {
  const animations = [chartAnimationClasses.pointFadeIn];
  if (pulse) animations.push(chartAnimationClasses.dataPointPulse);
  if (bounce) animations.push(chartAnimationClasses.dataPointBounce);

  return (
    <div
      className={animations.join(' ')}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

/**
 * Animated Legend Component
 * وسيلة إيضاح مع تأثير متحرك
 */
export const AnimatedLegend: React.FC<{
  children: React.ReactNode;
  delay?: number;
}> = ({ children, delay = 0 }) => {
  return (
    <div
      className={chartAnimationClasses.legendFadeIn}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

/**
 * Animated Value Component
 * قيمة مع تأثير عد متحرك
 */
export const AnimatedValue: React.FC<{
  value: number | string;
  className?: string;
  delay?: number;
}> = ({ value, className = '', delay = 0 }) => {
  return (
    <span
      className={`${chartAnimationClasses.valueCountUp} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {value}
    </span>
  );
};

/**
 * Chart Animation Provider
 * مزود التأثيرات المتحركة للرسوم البيانية
 */
export const ChartAnimationProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <>
      <style>{chartAnimationStyles}</style>
      {children}
    </>
  );
};
