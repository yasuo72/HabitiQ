// src/utils/animations.js
import { useEffect } from 'react';

// Animation variants for Framer Motion
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

export const slideUp = {
  hidden: { y: 50, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 30,
      duration: 0.5 
    }
  }
};

export const slideIn = (direction = "left", delay = 0) => {
  return {
    hidden: { 
      x: direction === "left" ? -50 : direction === "right" ? 50 : 0,
      y: direction === "up" ? 50 : direction === "down" ? -50 : 0,
      opacity: 0 
    },
    visible: { 
      x: 0,
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        delay,
        duration: 0.5
      }
    }
  };
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const pulseAnimation = {
  scale: [1, 1.05, 1],
  transition: { 
    duration: 1.5, 
    repeat: Infinity,
    ease: "easeInOut" 
  }
};

export const progressAnimation = (value) => {
  return {
    width: 0,
    transition: { duration: 0 },
    animate: {
      width: `${value}%`,
      transition: { duration: 1, ease: "easeOut" }
    }
  };
};

export const rotateAnimation = {
  rotate: [0, 360],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "linear"
  }
};

export const breatheAnimation = {
  scale: [1, 1.1, 1],
  opacity: [0.8, 1, 0.8],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

// Custom hook for scroll-triggered animations
export const useScrollAnimation = (ref, threshold = 0.1) => {
  useEffect(() => {
    if (typeof window === 'undefined' || !ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          ref.current.classList.add('animate-in');
        }
      },
      { threshold }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, threshold]);
};

// Animation presets for different components
export const cardAnimations = {
  initial: { y: 30, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -30, opacity: 0 },
  transition: { duration: 0.3 }
};

export const chartAnimations = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: "easeOut" }
};

export const buttonAnimations = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: { duration: 0.2 }
};

export const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 }
};

// Animated gradient backgrounds
export const gradientAnimation = {
  backgroundSize: "200% 200%",
  backgroundPosition: ["0% 0%", "100% 100%"],
  transition: {
    duration: 5,
    repeat: Infinity,
    repeatType: "reverse",
    ease: "easeInOut"
  }
};

// Loading animation
export const loadingAnimation = {
  scale: [1, 0.9, 1],
  opacity: [0.5, 1, 0.5],
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: "easeInOut"
  }
};
