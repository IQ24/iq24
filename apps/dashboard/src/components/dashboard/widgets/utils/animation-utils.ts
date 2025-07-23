/**
 * Animation utilities for dashboard widgets
 * Provides smooth transitions and visual enhancements
 */

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" }
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const scaleIn = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { duration: 0.3, ease: "easeOut" }
};

export const slideInFromRight = {
  initial: { x: 50, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  transition: { duration: 0.4, ease: "easeOut" }
};

export const slideInFromLeft = {
  initial: { x: -50, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  transition: { duration: 0.4, ease: "easeOut" }
};

export const pulseAnimation = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: "loop" as const,
      ease: "easeInOut"
    }
  }
};

export const bounceAnimation = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      repeatType: "loop" as const,
      ease: "easeInOut"
    }
  }
};

// CSS-based animations for non-motion components
export const cssAnimations = {
  fadeIn: "animate-in fade-in duration-500",
  slideUp: "animate-in slide-in-from-bottom-4 duration-500",
  slideDown: "animate-in slide-in-from-top-4 duration-500",
  slideLeft: "animate-in slide-in-from-right-4 duration-500",
  slideRight: "animate-in slide-in-from-left-4 duration-500",
  scale: "animate-in zoom-in-95 duration-300",
  spin: "animate-spin",
  pulse: "animate-pulse",
  bounce: "animate-bounce"
};

// Utility function to apply staggered animations
export function createStaggeredAnimation(itemCount: number, baseDelay: number = 0.1) {
  return Array.from({ length: itemCount }, (_, index) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { 
      duration: 0.5, 
      delay: index * baseDelay,
      ease: "easeOut"
    }
  }));
}

// Loading states and skeleton animations
export const shimmerAnimation = {
  animate: {
    backgroundPosition: ["200% 0", "-200% 0"],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: "loop" as const,
      ease: "linear"
    }
  }
};

export const skeletonClass = "animate-pulse bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%]";

// Chart-specific animations
export const barChartAnimation = {
  initial: { scaleY: 0 },
  animate: { scaleY: 1 },
  transition: { duration: 0.8, ease: "easeOut" }
};

export const lineChartAnimation = {
  initial: { pathLength: 0 },
  animate: { pathLength: 1 },
  transition: { duration: 1.2, ease: "easeInOut" }
};

export const pieChartAnimation = {
  initial: { rotate: 0 },
  animate: { rotate: 360 },
  transition: { duration: 1, ease: "easeInOut" }
};

// Hover effects
export const hoverLift = {
  whileHover: {
    y: -2,
    scale: 1.02,
    transition: { duration: 0.2 }
  }
};

export const hoverGlow = {
  whileHover: {
    boxShadow: "0 0 20px rgba(101, 255, 216, 0.3)",
    transition: { duration: 0.2 }
  }
};

// Number counter animation
export function animateNumber(
  start: number,
  end: number,
  duration: number = 1000,
  callback: (value: number) => void
) {
  const startTime = performance.now();
  
  function updateNumber(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function for smooth animation
    const easeOutQuart = 1 - Math.pow(1 - progress, 2);
    const currentValue = start + (end - start) * easeOutQuart;
    
    callback(Math.round(currentValue));
    
    if (progress < 1) {
      requestAnimationFrame(updateNumber);
    }
  }
  
  requestAnimationFrame(updateNumber);
}

// Utility for creating loading states
export function createLoadingState(isLoading: boolean) {
  return {
    className: isLoading ? cssAnimations.pulse : "",
    style: {
      pointerEvents: isLoading ? "none" : "auto",
      opacity: isLoading ? 0.7 : 1
    }
  };
}

// Enhanced micro-animations
export const microAnimations = {
  // Subtle hover effects
  subtleHover: {
    whileHover: {
      scale: 1.02,
      transition: { duration: 0.15, ease: "easeOut" }
    }
  },
  
  // Button press effect
  buttonPress: {
    whileTap: {
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  },
  
  // Card entrance animation
  cardEntrance: {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { duration: 0.4, ease: "easeOut" }
  },
  
  // Floating effect for important elements
  float: {
    animate: {
      y: [-2, 2, -2],
      transition: {
        duration: 3,
        repeat: Infinity,
        repeatType: "loop" as const,
        ease: "easeInOut"
      }
    }
  },
  
  // Glow effect for accent elements
  accentGlow: {
    animate: {
      boxShadow: [
        "0 0 5px rgba(101, 255, 216, 0.2)",
        "0 0 20px rgba(101, 255, 216, 0.4)",
        "0 0 5px rgba(101, 255, 216, 0.2)"
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "loop" as const,
        ease: "easeInOut"
      }
    }
  },
  
  // Loading shimmer effect
  shimmer: {
    animate: {
      backgroundPosition: ["200% 0", "-200% 0"],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        repeatType: "loop" as const,
        ease: "linear"
      }
    }
  },
  
  // Stagger children animation
  staggerChildren: (delay: number = 0.1) => ({
    animate: {
      transition: {
        staggerChildren: delay,
        delayChildren: 0.1
      }
    }
  }),
  
  // Modal/overlay entrance
  modalEntrance: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.2, ease: "easeOut" }
  },
  
  // Tab switching animation
  tabSwitch: {
    initial: { opacity: 0, x: 10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -10 },
    transition: { duration: 0.2, ease: "easeInOut" }
  },
  
  // Progress bar animation
  progressBar: (progress: number) => ({
    initial: { width: "0%" },
    animate: { width: `${progress}%` },
    transition: { duration: 0.8, ease: "easeOut" }
  }),
  
  // Icon rotation on hover
  iconRotate: {
    whileHover: {
      rotate: 5,
      transition: { duration: 0.2 }
    }
  },
  
  // Badge notification animation
  badgeNotification: {
    animate: {
      scale: [1, 1.2, 1],
      rotate: [0, -5, 5, 0],
      transition: {
        duration: 0.6,
        ease: "easeInOut"
      }
    }
  },
  
  // Chart bar growth animation
  barGrowth: (delay: number = 0) => ({
    initial: { scaleY: 0, opacity: 0 },
    animate: { scaleY: 1, opacity: 1 },
    transition: { 
      duration: 0.6, 
      delay,
      ease: "easeOut",
      type: "spring",
      stiffness: 100
    }
  }),
  
  // Tooltip appearance
  tooltip: {
    initial: { opacity: 0, scale: 0.8, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.8, y: 10 },
    transition: { duration: 0.15, ease: "easeOut" }
  }
};

// Enhanced easing functions
export const easingFunctions = {
  easeOutQuart: [0.25, 1, 0.5, 1],
  easeInOutCubic: [0.65, 0, 0.35, 1],
  easeOutElastic: [0.25, 0.46, 0.45, 0.94],
  easeInOutBack: [0.68, -0.55, 0.265, 1.55],
  bouncy: [0.68, -0.6, 0.32, 1.6]
};

// Enhanced intersection observer hook for scroll animations
export function useScrollAnimation() {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  return { ref, isVisible };
}

// Gesture-based interactions
export const gestureAnimations = {
  swipeLeft: {
    x: -100,
    opacity: 0,
    transition: { duration: 0.3, ease: "easeOut" }
  },
  
  swipeRight: {
    x: 100,
    opacity: 0,
    transition: { duration: 0.3, ease: "easeOut" }
  },
  
  dragConstraints: {
    left: -50,
    right: 50,
    top: -50,
    bottom: 50
  }
};

// Loading state animations
export const loadingAnimations = {
  skeleton: "animate-pulse bg-gradient-to-r from-numora-gray-800 via-numora-gray-700 to-numora-gray-800 bg-[length:200%_100%]",
  
  dots: {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.3, 1, 0.3],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        repeatType: "loop" as const,
        ease: "easeInOut"
      }
    }
  },
  
  spinner: {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        repeatType: "loop" as const,
        ease: "linear"
      }
    }
  }
};