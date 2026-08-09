export interface Planet {
  x: number;
  y: number;
  radius: number;
  color: string;
}

export interface Ship {
  orbitIndex: 0 | 1 | 2; // 0=inner, 1=middle, 2=outer
  angle: number; // radians
  jump(): void;
  jumpIn(): void;
  update(dt: number, orbitRadii: number[]): void;
  getPosition(centerX: number, centerY: number, orbitRadii: number[]): { x: number; y: number };
}

export interface Enemy {
  orbitIndex: 0 | 1 | 2;
  angle: number;
  speed: number; // radians per second
  active: boolean;
  radius: number;
  color: string;
}

export interface Collectible {
  orbitIndex: 0 | 1 | 2;
  angle: number;
  speed: number;
  active: boolean;
  radius: number;
  color: string;
  pulse: number; // for pulsing effect
}

// Factory functions
export const createPlanet = (x: number, y: number, radius: number): Planet => {
  return {
    x,
    y,
    radius,
    color: '#6c5ce7' // purple
  };
};

export const createShip = (orbitIndex: number = 1): Ship => {
  return {
    orbitIndex,
    angle: 0,
    jump: function() {
      // jump to next orbit (0->1->2->0)
      if (this.orbitIndex < 2) {
        this.orbitIndex++;
      } else {
        this.orbitIndex = 0;
      }
    },
    jumpIn: function() {
      // jump to previous orbit (0->2->1->0)
      if (this.orbitIndex > 0) {
        this.orbitIndex--;
      } else {
        this.orbitIndex = 2;
      }
    },
    update: function(dt: number, orbitRadii: number[]) {
      // advance angle based on ship speed
      this.angle += 2.5 * dt; // SHIP_SPEED = 2.5 rad/s
      // wrap angle
      if (this.angle >= Math.PI * 2) {
        this.angle -= Math.PI * 2;
      }
    },
    getPosition: function(centerX: number, centerY: number, orbitRadii: number[]) {
      const radius = orbitRadii[this.orbitIndex];
      return {
        x: centerX + Math.cos(this.angle) * radius,
        y: centerY + Math.sin(this.angle) * radius
      };
    }
  };
};

export const createEnemy = (orbitIndex: number): Enemy => {
  return {
    orbitIndex,
    angle: Math.random() * Math.PI * 2,
    speed: 0.5 + Math.random() * 1.0, // 0.5 to 1.5 rad/s
    active: true,
    radius: 6,
    color: '#ff6b6b' // red
  };
};

export const createCollectible = (orbitIndex: number): Collectible => {
  return {
    orbitIndex,
    angle: Math.random() * Math.PI * 2,
    speed: 0.3 + Math.random() * 0.7, // 0.3 to 1.0 rad/s
    active: true,
    radius: 4,
    color: '#00b894', // green
    pulse: 0
  };
};