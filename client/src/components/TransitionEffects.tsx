import React from 'react';

interface TransitionEffectsProps {
  children: React.ReactNode;
  type?: 'fade' | 'slide' | 'scale' | 'bounce';
  duration?: number;
  delay?: number;
}

/**
 * Transition Effects component for smooth animations
 * يوفر تأثيرات انتقال سلسة للمكونات
 */
export const TransitionEffects: React.FC<TransitionEffectsProps> = ({
  children,
  type = 'fade',
  duration = 300,
  delay = 0,
}) => {
  const getAnimationClass = () => {
    switch (type) {
      case 'fade':
        return 'animate-fade-in';
      case 'slide':
        return 'animate-slide-in';
      case 'scale':
        return 'animate-scale-in';
      case 'bounce':
        return 'animate-bounce-in';
      default:
        return 'animate-fade-in';
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fadeIn ${duration}ms ease-in-out ${delay}ms forwards;
          opacity: 0;
        }

        .animate-slide-in {
          animation: slideIn ${duration}ms ease-out ${delay}ms forwards;
          opacity: 0;
        }

        .animate-scale-in {
          animation: scaleIn ${duration}ms ease-out ${delay}ms forwards;
          opacity: 0;
        }

        .animate-bounce-in {
          animation: bounceIn ${duration}ms ease-out ${delay}ms forwards;
          opacity: 0;
        }
      `}</style>
      <div className={getAnimationClass()}>{children}</div>
    </>
  );
};

/**
 * Staggered animations for lists
 * تأثيرات متتالية للقوائم
 */
export const StaggeredAnimation: React.FC<{
  children: React.ReactNode[];
  staggerDelay?: number;
  type?: 'fade' | 'slide' | 'scale' | 'bounce';
  duration?: number;
}> = ({ children, staggerDelay = 50, type = 'slide', duration = 300 }) => {
  return (
    <>
      {React.Children.map(children, (child, index) => (
        <TransitionEffects
          key={index}
          type={type}
          duration={duration}
          delay={index * staggerDelay}
        >
          {child}
        </TransitionEffects>
      ))}
    </>
  );
};

/**
 * Hover effects for interactive elements
 * تأثيرات التحويم للعناصر التفاعلية
 */
export const HoverEffects = () => (
  <style>{`
    @keyframes hoverGlow {
      0% {
        box-shadow: 0 0 0 0 rgba(250, 204, 21, 0.4);
      }
      70% {
        box-shadow: 0 0 0 10px rgba(250, 204, 21, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(250, 204, 21, 0);
      }
    }

    .hover-glow:hover {
      animation: hoverGlow 0.6s ease-out;
    }

    .hover-lift:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    }

    .hover-scale:hover {
      transform: scale(1.02);
    }

    .hover-color-shift:hover {
      background-color: rgba(250, 204, 21, 0.1);
    }
  `}</style>
);

/**
 * Loading pulse animation
 * تأثير نبض التحميل
 */
export const LoadingPulse = () => (
  <style>{`
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }

    .animate-pulse-custom {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  `}</style>
);

/**
 * Shimmer effect for skeleton loading
 * تأثير الوميض لـ skeleton loading
 */
export const ShimmerEffect = () => (
  <style>{`
    @keyframes shimmer {
      0% {
        background-position: -1000px 0;
      }
      100% {
        background-position: 1000px 0;
      }
    }

    .animate-shimmer {
      background: linear-gradient(
        90deg,
        #f0f0f0 25%,
        #e0e0e0 50%,
        #f0f0f0 75%
      );
      background-size: 1000px 100%;
      animation: shimmer 2s infinite;
    }
  `}</style>
);

/**
 * Success animation
 * تأثير النجاح
 */
export const SuccessAnimation = () => (
  <style>{`
    @keyframes successPulse {
      0% {
        transform: scale(0.8);
        opacity: 0;
      }
      50% {
        transform: scale(1.1);
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }

    .animate-success {
      animation: successPulse 0.6s ease-out;
    }
  `}</style>
);

/**
 * Error shake animation
 * تأثير الاهتزاز للأخطاء
 */
export const ErrorAnimation = () => (
  <style>{`
    @keyframes shake {
      0%, 100% {
        transform: translateX(0);
      }
      10%, 30%, 50%, 70%, 90% {
        transform: translateX(-5px);
      }
      20%, 40%, 60%, 80% {
        transform: translateX(5px);
      }
    }

    .animate-shake {
      animation: shake 0.5s ease-in-out;
    }
  `}</style>
);
