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
}

const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({ steps, onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [pulseAnimation, setPulseAnimation] = useState(true);
  const [, forceUpdate] = useState({});
  const overlayRef = useRef<HTMLDivElement>(null);

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

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
        
        // Scroll element into view
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        }, 100);
        
        // Calculate tooltip position
        const updatePosition = () => {
          const rect = element.getBoundingClientRect();
          const tooltipWidth = 320;
          const tooltipHeight = 200;
          const padding = 20;
          
          let top = 0;
          let left = 0;
          
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
    const padding = 8;
    const borderRadius = 12;
    
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
          fill="rgba(0, 0, 0, 0.75)"
          fillRule="evenodd"
        />
      </svg>

      {/* Pulse animation on highlighted element */}
      {targetElement && pulseAnimation && (() => {
        const rect = targetElement.getBoundingClientRect();
        return (
          <div
            className="fixed pointer-events-none animate-ping"
            style={{
              top: rect.top - 4,
              left: rect.left - 4,
              width: rect.width + 8,
              height: rect.height + 8,
              zIndex: 1000,
              border: '3px solid #3b82f6',
              borderRadius: '12px',
            }}
          />
        );
      })()}

      {/* Pointing hand cursor animation */}
      {targetElement && step.waitForAction && (() => {
        const rect = targetElement.getBoundingClientRect();
        return (
          <div
            className="fixed pointer-events-none animate-bounce"
            style={{
              top: rect.top + rect.height / 2 - 12,
              left: rect.right + 20,
              zIndex: 1002,
            }}
          >
            <Hand className="h-8 w-8 text-primary-600 fill-primary-600" />
          </div>
        );
      })()}

      {/* Tooltip */}
      <div
        className="fixed z-[1003] bg-white rounded-2xl shadow-2xl p-6 max-w-sm"
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
          animation: 'fadeIn 0.3s ease-out',
        }}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-primary-100 text-primary-600 text-xs font-semibold rounded-full">
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

        <h3 className="text-xl font-bold text-gray-800 mb-2">{step.title}</h3>
        <p className="text-gray-600 text-sm mb-4 leading-relaxed">{step.description}</p>

        {step.waitForAction ? (
          <div className="flex items-center gap-2 text-primary-600 text-sm font-medium">
            <ArrowDown className="h-4 w-4 animate-bounce" />
            <span>Click the highlighted element to continue</span>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <button
              onClick={handleSkip}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Skip Tutorial
            </button>
            <button
              onClick={handleNext}
              className="px-5 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              {isLastStep ? 'Finish' : 'Next'}
            </button>
          </div>
        )}

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mt-4 pt-4 border-t border-gray-200">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all ${
                index === currentStep
                  ? 'w-6 bg-primary-600'
                  : index < currentStep
                  ? 'w-1.5 bg-primary-300'
                  : 'w-1.5 bg-gray-300'
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
      `}</style>
    </>
  );
};

export default InteractiveTutorial;
