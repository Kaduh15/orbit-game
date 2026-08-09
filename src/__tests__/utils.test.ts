import { describe, it, expect } from 'vitest';
import { getOrbitPosition, circlesCollide, TAU } from '../utils';

describe('utils', () => {
  describe('getOrbitPosition', () => {
    it('should return correct position at angle 0', () => {
      const pos = getOrbitPosition(0, 0, 10, 0);
      expect(pos.x).toBe(10);
      expect(pos.y).toBe(0);
    });

    it('should return correct position at angle PI/2', () => {
      const pos = getOrbitPosition(0, 0, 10, Math.PI / 2);
      expect(pos.x).toBeCloseTo(0, 5);
      expect(pos.y).toBe(10);
    });

    it('should wrap angle', () => {
      const pos1 = getOrbitPosition(0, 0, 10, 0);
      const pos2 = getOrbitPosition(0, 0, 10, TAU);
      expect(pos1.x).toBe(pos2.x);
      expect(pos1.y).toBe(pos2.y);
    });
  });

  describe('circlesCollide', () => {
    it('should detect collision when circles overlap', () => {
      const a = { x: 0, y: 0, radius: 5 };
      const b = { x: 0, y: 0, radius: 5 };
      expect(circlesCollide(a, b)).toBe(true);
    });

    it('should detect collision when circles are close', () => {
      const a = { x: 0, y: 0, radius: 5 };
      const b = { x: 3, y: 0, radius: 5 };
      expect(circlesCollide(a, b)).toBe(true);
    });

    it('should not detect collision when circles are far', () => {
      const a = { x: 0, y: 0, radius: 5 };
      const b = { x: 11, y: 0, radius: 5 };
      expect(circlesCollide(a, b)).toBe(false);
    });
  });
});