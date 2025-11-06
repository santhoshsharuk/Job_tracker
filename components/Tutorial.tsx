import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowDown, Hand } from 'lucide-react';

interface InteractiveTutorialStep {
  target: string; // CSS selector for the element to highlight
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: 'click' | 'hover' | 'type';
  skipButton?: boolean; // Allow skipping this step
  waitForAction?: boolean; // Wait for user to perform action
}

interface InteractiveTutorialProps {
  steps: InteractiveTutorialStep[];
  onComplete: () => void;
  onSkip: () => void;
  onStepChange?: (step: number) => void;
}

const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({ steps, onComplete, onSkip, onStepChange }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [pulseAnimation, setPulseAnimation] = useState(true);
  const [, forceUpdate] = useState({});
  const overlayRef = useRef<HTMLDivElement>(null);

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  // Notify parent when step changes
  useEffect(() => {
    if (onStepChange) {
      onStepChange(currentStep);
    }
  }, [currentStep, onStepChange]);

  // Prevent body scroll on mobile when tutorial is active
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, []);

  // Handle window resize to reposition tooltip
  useEffect(() => {
    const handleResize = () => {
      forceUpdate({});
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 20;
    let cleanupFn: (() => void) | null = null;

    // Wait for DOM to be ready
    const findElement = () => {
      const element = document.querySelector(step.target) as HTMLElement;
      
      if (element) {
        setTargetElement(element);
        
        // Scroll element into view - different behavior for mobile
        setTimeout(() => {
          const isMobile = window.innerWidth < 768;
          if (isMobile) {
            // On mobile, scroll with more top space to accommodate tooltip
            element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'center' });
            // Add extra scroll to give space for tooltip
            window.scrollBy({ top: -100, behavior: 'smooth' });
          } else {
            element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
          }
        }, 100);
        
        // Calculate tooltip position
        const updatePosition = () => {
          const rect = element.getBoundingClientRect();
          const isMobile = window.innerWidth < 768;
          const tooltipWidth = isMobile ? Math.min(window.innerWidth - 32, 320) : 320;
          const tooltipHeight = isMobile ? 220 : 200;
          const padding = isMobile ? 16 : 20;
          
          let top = 0;
          let left = 0;
          
          // On mobile, always position at bottom or top for better UX
          if (isMobile) {
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            
            if (spaceBelow > tooltipHeight + padding) {
              // Position below
              top = rect.bottom + padding;
              left = padding;
            } else if (spaceAbove > tooltipHeight + padding) {
              // Position above
              top = rect.top - tooltipHeight - padding;
              left = padding;
            } else {
              // Position at bottom if element is near top, otherwise at top
              if (rect.top < window.innerHeight / 2) {
                top = rect.bottom + padding;
              } else {
                top = Math.max(padding, window.innerHeight - tooltipHeight - padding);
              }
              left = padding;
            }
          } else {
            // Desktop positioning logic
            switch (step.position) {
              case 'bottom':
                top = rect.bottom + padding;
                left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
                break;
              case 'top':
                top = rect.top - tooltipHeight - padding;
                left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
                break;
              case 'right':
                top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
                left = rect.right + padding;
                break;
              case 'left':
                top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
                left = rect.left - tooltipWidth - padding;
                break;
              default:
                top = rect.bottom + padding;
                left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
            }
            
            // Keep tooltip within viewport
            if (left < padding) left = padding;
            if (left + tooltipWidth > window.innerWidth - padding) {
              left = window.innerWidth - tooltipWidth - padding;
            }
            if (top < padding) top = rect.bottom + padding;
            if (top + tooltipHeight > window.innerHeight - padding) {
              top = window.innerHeight - tooltipHeight - padding;
            }
          }
          
          setTooltipPosition({ top, left });
        };

        setTimeout(updatePosition, 200);
        
        // Add highlighting and pulse
        element.style.position = 'relative';
        element.style.zIndex = '1001';
        element.style.transition = 'all 0.3s ease';
        
        // Listen for user interaction if waitForAction is true
        if (step.waitForAction) {
          const handleInteraction = (e: Event) => {
            setPulseAnimation(false);
            setTimeout(() => handleNext(), 300);
          };
          
          if (step.action === 'click') {
            element.addEventListener('click', handleInteraction, { once: true });
            cleanupFn = () => element.removeEventListener('click', handleInteraction);
          }
        }
      } else if (retryCount < maxRetries) {
        // Retry finding element after a delay
        retryCount++;
        const retryTimer = setTimeout(findElement, 150);
        cleanupFn = () => clearTimeout(retryTimer);
      } else {
        console.warn(`Tutorial: Could not find element ${step.target} after ${maxRetries} retries`);
      }
    };
    
    const timer = setTimeout(findElement, 100);
    
    return () => {
      clearTimeout(timer);
      if (cleanupFn) cleanupFn();
      if (targetElement) {
        targetElement.style.zIndex = '';
      }
    };
  }, [currentStep, step]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setPulseAnimation(true);
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  // Create spotlight cutout effect
  const getSpotlightPath = () => {
    if (!targetElement) return '';
    
    const rect = targetElement.getBoundingClientRect();
    const isMobile = window.innerWidth < 768;
    const padding = isMobile ? 12 : 8; // More padding on mobile for better touch targets
    const borderRadius = isMobile ? 16 : 12; // Larger radius on mobile
    
    const x = Math.max(0, rect.left - padding);
    const y = Math.max(0, rect.top - padding);
    const width = Math.min(rect.width + (padding * 2), window.innerWidth - x);
    const height = Math.min(rect.height + (padding * 2), window.innerHeight - y);
    
    // SVG path for rounded rectangle cutout
    return `
      M 0 0 
      L ${window.innerWidth} 0 
      L ${window.innerWidth} ${window.innerHeight} 
      L 0 ${window.innerHeight} 
      Z
      M ${x + borderRadius} ${y}
      L ${x + width - borderRadius} ${y}
      Q ${x + width} ${y} ${x + width} ${y + borderRadius}
      L ${x + width} ${y + height - borderRadius}
      Q ${x + width} ${y + height} ${x + width - borderRadius} ${y + height}
      L ${x + borderRadius} ${y + height}
      Q ${x} ${y + height} ${x} ${y + height - borderRadius}
      L ${x} ${y + borderRadius}
      Q ${x} ${y} ${x + borderRadius} ${y}
      Z
    `;
  };

  return (
    <>
      {/* Overlay with spotlight cutout */}
      <svg
        ref={overlayRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 999 }}
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <path
          d={getSpotlightPath()}
          fill={window.innerWidth < 768 ? "rgba(0, 0, 0, 0.85)" : "rgba(0, 0, 0, 0.75)"}
          fillRule="evenodd"
        />
      </svg>

      {/* Pulse animation on highlighted element */}
      {targetElement && pulseAnimation && (() => {
        const rect = targetElement.getBoundingClientRect();
        const isMobile = window.innerWidth < 768;
        return (
          <>
            {/* Primary pulse ring */}
            <div
              className="fixed pointer-events-none animate-ping"
              style={{
                top: rect.top - 4,
                left: rect.left - 4,
                width: rect.width + 8,
                height: rect.height + 8,
                zIndex: 1000,
                border: isMobile ? '2px solid #3b82f6' : '3px solid #3b82f6',
                borderRadius: '12px',
                animationDuration: '1.5s',
              }}
            />
            {/* Solid highlight border */}
            <div
              className="fixed pointer-events-none"
              style={{
                top: rect.top - 4,
                left: rect.left - 4,
                width: rect.width + 8,
                height: rect.height + 8,
                zIndex: 1000,
                border: isMobile ? '2px solid #3b82f6' : '3px solid #3b82f6',
                borderRadius: '12px',
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
              }}
            />
          </>
        );
      })()}

      {/* Pointing hand cursor animation */}
      {targetElement && step.waitForAction && (() => {
        const rect = targetElement.getBoundingClientRect();
        const isMobile = window.innerWidth < 768;
        
        // On mobile, position hand above the element, on desktop to the right
        const handTop = isMobile 
          ? rect.top - 40 
          : rect.top + rect.height / 2 - 12;
        const handLeft = isMobile 
          ? rect.left + rect.width / 2 - 12 
          : Math.min(rect.right + 20, window.innerWidth - 50);
        
        return (
          <div
            className="fixed pointer-events-none animate-bounce"
            style={{
              top: handTop,
              left: handLeft,
              zIndex: 1002,
            }}
          >
            <Hand 
              className={`h-8 w-8 text-primary-600 fill-primary-600 ${isMobile ? 'rotate-90' : ''}`}
            />
          </div>
        );
      })()}

      {/* Tooltip */}
      <div
        className="fixed z-[1003] bg-white rounded-2xl shadow-2xl p-4 sm:p-6 max-w-sm mx-4 sm:mx-0"
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
          animation: 'fadeIn 0.3s ease-out',
          width: window.innerWidth < 768 ? `${window.innerWidth - 32}px` : 'auto',
        }}
      >
        <div className="flex justify-between items-start mb-2 sm:mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2 sm:px-3 py-1 bg-primary-100 text-primary-600 text-xs font-semibold rounded-full">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <button
            onClick={handleSkip}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Skip tutorial"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">{step.title}</h3>
        <p className="text-gray-600 text-sm mb-3 sm:mb-4 leading-relaxed">{step.description}</p>

        {step.waitForAction ? (
          <div className="flex items-center gap-2 text-primary-600 text-sm font-medium">
            <ArrowDown className="h-4 w-4 animate-bounce" />
            <span className="text-xs sm:text-sm">Tap the highlighted element to continue</span>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 sm:gap-0">
            <button
              onClick={handleSkip}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors order-2 sm:order-1"
            >
              Skip Tutorial
            </button>
            <button
              onClick={handleNext}
              className="px-5 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors order-1 sm:order-2"
            >
              {isLastStep ? 'Finish' : 'Next'}
            </button>
          </div>
        )}

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 sm:h-1.5 rounded-full transition-all ${
                index === currentStep
                  ? 'w-8 sm:w-6 bg-primary-600'
                  : index < currentStep
                  ? 'w-2 sm:w-1.5 bg-primary-300'
                  : 'w-2 sm:w-1.5 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes touchRipple {
          0% {
            transform: scale(0.8);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.4;
          }
          100% {
            transform: scale(0.8);
            opacity: 0.8;
          }
        }
        
        @media (max-width: 768px) {
          /* Prevent zoom on double tap for tutorial elements */
          [data-tutorial] {
            touch-action: manipulation;
          }
          
          /* Make tutorial more readable on mobile */
          .tutorial-text {
            font-size: 14px;
            line-height: 1.5;
          }
        }
      `}</style>
    </>
  );
};

export default InteractiveTutorial;
