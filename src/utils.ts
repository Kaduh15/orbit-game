// Utility functions for the game

// Convert degrees to radians
export const degToRad = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

// Constant for full circle in radians
export const TAU = Math.PI * 2;

/**
 * Calculate the position of an object on a circular orbit.
 * @param centerX X coordinate of the orbit center
 * @param centerY Y coordinate of the orbit center
 * @param radius Radius of the orbit
 * @param angle Angle in radians (0 is right, PI/2 is down)
 * @returns {x: number, y: number} position
 */
export const getOrbitPosition = (centerX: number, centerY: number, radius: number, angle: number): { x: number; y: number } => {
  return {
    x: centerX + Math.cos(angle) * radius,
    y: centerY + Math.sin(angle) * radius
  };
};

/**
 * Check if two circles collide.
 * @param a First circle with {x: number, y: number, radius: number}
 * @param b Second circle with {x: number, y: number, radius: number}
 * @returns true if they collide
 */
export const circlesCollide = (a: { x: number; y: number; radius: number }, b: { x: number; y: number; radius: number }): boolean => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < (a.radius + b.radius);
};

/**
 * Clamp a value between a minimum and maximum.
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};