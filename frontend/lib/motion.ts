/**
 * Unified 120Hz & Adaptive High-Refresh Motion Configurations
 * Optimized for Apple ProMotion (120Hz), high-refresh laptops (120-240Hz),
 * and standard 60Hz displays with fluid cubic-bezier and spring physics.
 */

// Apple ProMotion fluid cubic-bezier curve (instant initial velocity + silky decelerating ease)
export const EASE_120HZ = [0.16, 1, 0.3, 1] as const;

// Responsive spring with high stiffness and balanced damping for zero-judder 120Hz tracking
export const SPRING_120HZ = {
  type: "spring" as const,
  stiffness: 420,
  damping: 32,
  mass: 0.8,
};

// Gentle spring for larger surface areas / modals
export const SPRING_GENTLE_120HZ = {
  type: "spring" as const,
  stiffness: 340,
  damping: 28,
  mass: 0.9,
};

// Standard page enter/exit motion preset
export const PAGE_MOTION = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: {
    duration: 0.22,
    ease: EASE_120HZ,
  },
};

// Modal / Dialog scale & fade motion preset
export const MODAL_MOTION = {
  initial: { opacity: 0, scale: 0.96, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96, y: 8 },
  transition: {
    duration: 0.2,
    ease: EASE_120HZ,
  },
};

// Drawer / Slide-over sheet motion preset
export const DRAWER_MOTION = {
  initial: { x: "100%", opacity: 0.4 },
  animate: { x: 0, opacity: 1 },
  exit: { x: "100%", opacity: 0 },
  transition: SPRING_120HZ,
};
