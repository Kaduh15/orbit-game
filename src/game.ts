import { Planet, Ship, Enemy, Collectible } from './entities';
import { getOrbitPosition, circlesCollide, TAU } from './utils';

export type GameState = 'title' | 'playing' | 'gameover';

export class Game {
  private canvas: HTMLDivElement;
  private ctx: CanvasRenderingContext2D | null = null;
  private canvasElement: HTMLCanvasElement | null = null;
  private state: GameState = 'title';
  private score: number = 0;
  private highScore: number = 0;
  private lives: number = 3;
  private level: number = 1;
  private animationFrame: number | null = null;
  private lastTime: number = 0;
  private planet: Planet;
  private ship: Ship;
  private enemies: Enemy[] = [];
  private collectibles: Collectible[] = [];
  private spawnTimer: number = 0;
  private readonly SPAWN_INTERVAL = 2.0;
  private readonly ENEMY_SPAWN_CHANCE = 0.7;
  private readonly COLLECTIBLE_SPAWN_CHANCE = 0.3;
  private readonly ORBIT_RADII = [60, 100, 140];
  private readonly SHIP_SPEED = 2.5;
  private readonly BASE_ENEMY_SPEED = 0.8;
  private readonly BASE_COLLECTIBLE_SPEED = 0.5;

  constructor(canvasElement: HTMLDivElement) {
    this.canvas = canvasElement;
    this.loadHighScore();
    this.bindEvents();
    this.planet = { x: 0, y: 0, radius: 20, color: '#6c5ce7' };
    this.ship = { orbitIndex: 1, angle: 0, jump: () => { if (this.ship.orbitIndex < 2) this.ship.orbitIndex++; else this.ship.orbitIndex = 0; }, jumpIn: () => { if (this.ship.orbitIndex > 0) this.ship.orbitIndex--; else this.ship.orbitIndex = 2; }, update: (dt: number, radii: number[]) => { this.ship.angle += this.SHIP_SPEED * dt; if (this.ship.angle >= TAU) this.ship.angle -= TAU; }, getPosition: (cx: number, cy: number, radii: number[]) => { const r = radii[this.ship.orbitIndex]; return { x: cx + Math.cos(this.ship.angle) * r, y: cy + Math.sin(this.ship.angle) * r }; } };
  }

  private loadHighScore(): void {
    const saved = localStorage.getItem('orbit-highscore');
    if (saved) {
      this.highScore = parseInt(saved, 10);
    }
  }

  private saveHighScore(): void {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('orbit-highscore', this.highScore.toString());
    }
  }

  private bindEvents(): void {
    this.canvas.addEventListener('pointerdown', () => this.handleInput());
  }

  private handleInput(): void {
    switch (this.state) {
      case 'title':
        this.state = 'playing';
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.enemies = [];
        this.collectibles = [];
        this.spawnTimer = 0;
        this.ship = { orbitIndex: 1, angle: 0, jump: () => { if (this.ship.orbitIndex < 2) this.ship.orbitIndex++; else this.ship.orbitIndex = 0; }, jumpIn: () => { if (this.ship.orbitIndex > 0) this.ship.orbitIndex--; else this.ship.orbitIndex = 2; }, update: (dt: number, radii: number[]) => { this.ship.angle += this.SHIP_SPEED * dt; if (this.ship.angle >= TAU) this.ship.angle -= TAU; }, getPosition: (cx: number, cy: number, radii: number[]) => { const r = radii[this.ship.orbitIndex]; return { x: cx + Math.cos(this.ship.angle) * r, y: cy + Math.sin(this.ship.angle) * r }; } };
        break;
      case 'gameover':
        this.state = 'title';
        break;
      case 'playing':
        this.ship.jump();
        break;
    }
  }

  private update(dt: number): void {
    this.ship.update(dt, this.ORBIT_RADII);
    for (const enemy of this.enemies) {
      if (enemy.active) {
        enemy.angle += enemy.speed * dt;
        if (enemy.angle >= TAU) enemy.angle -= TAU;
      }
    }
    for (const collectible of this.collectibles) {
      if (collectible.active) {
        collectible.angle += collectible.speed * dt;
        if (collectible.angle >= TAU) collectible.angle -= TAU;
        collectible.pulse += dt * 5;
      }
    }
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = this.SPAWN_INTERVAL + Math.random() * 1.0;
      if (Math.random() < this.ENEMY_SPAWN_CHANCE) {
        this.spawnEnemy();
      }
      if (Math.random() < this.COLLECTIBLE_SPAWN_CHANCE) {
        this.spawnCollectible();
      }
    }
    if (this.canvasElement) {
      this.checkCollisions();
    }
  }

  private spawnEnemy(): void {
    const orbitIndex = Math.floor(Math.random() * this.ORBIT_RADII.length);
    const enemy: Enemy = { orbitIndex, angle: Math.random() * TAU, speed: this.BASE_ENEMY_SPEED + (this.level - 1) * 0.2, active: true, radius: 6, color: '#ff6b6b' };
    this.enemies.push(enemy);
  }

  private spawnCollectible(): void {
    const orbitIndex = Math.floor(Math.random() * this.ORBIT_RADII.length);
    const collectible: Collectible = { orbitIndex, angle: Math.random() * TAU, speed: this.BASE_COLLECTIBLE_SPEED + (this.level - 1) * 0.1, active: true, radius: 4, color: '#00b894', pulse: 0 };
    this.collectibles.push(collectible);
  }

  private checkCollisions(): void {
    if (!this.canvasElement) return;
    const centerX = this.canvasElement.width / 2;
    const centerY = this.canvasElement.height / 2;
    const shipPos = this.ship.getPosition(centerX, centerY, this.ORBIT_RADII);
    for (const enemy of this.enemies) {
      if (!enemy.active) continue;
      const enemyPos = getOrbitPosition(centerX, centerY, this.ORBIT_RADII[enemy.orbitIndex], enemy.angle);
      if (circlesCollide({ x: shipPos.x, y: shipPos.y, radius: 8 }, { x: enemyPos.x, y: enemyPos.y, radius: enemy.radius })) {
        this.lives--;
        enemy.active = false;
        if (this.lives <= 0) {
          this.state = 'gameover';
          this.saveHighScore();
        }
      }
    }
    for (const collectible of this.collectibles) {
      if (!collectible.active) continue;
      const collectiblePos = getOrbitPosition(centerX, centerY, this.ORBIT_RADII[collectible.orbitIndex], collectible.angle);
      if (circlesCollide({ x: shipPos.x, y: shipPos.y, radius: 8 }, { x: collectiblePos.x, y: collectiblePos.y, radius: collectible.radius })) {
        this.score += 10;
        collectible.active = false;
        this.level = 1 + Math.floor(this.score / 200);
      }
    }
  }

  private render(): void {
    if (!this.canvas) return;
    if (!this.canvasElement) {
      this.canvasElement = document.createElement('canvas');
      this.canvas.appendChild(this.canvasElement);
    }
    this.ctx = this.canvasElement.getContext('2d');
    if (!this.ctx) return;
    const rect = this.canvas.getBoundingClientRect();
    this.canvasElement.width = rect.width;
    this.canvasElement.height = rect.height;
    this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
    this.ctx.fillStyle = '#0a0a2e';
    this.ctx.fillRect(0, 0, this.canvasElement.width, this.canvasElement.height);
    if (this.state === 'title') {
      this.renderTitle();
    } else if (this.state === 'playing') {
      this.renderPlaying();
    } else if (this.state === 'gameover') {
      this.renderGameOver();
    }
  }

  private renderTitle(): void {
    if (!this.ctx) return;
    const width = this.canvasElement.width;
    const height = this.canvasElement.height;
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 64px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('ORBIT', width / 2, height / 2 - 20);
    this.ctx.fillStyle = '#a29bfe';
    this.ctx.font = '16px sans-serif';
    this.ctx.fillText('Tap to play', width / 2, height / 2 + 20);
    this.ctx.fillStyle = '#636e72';
    this.ctx.font = '14px sans-serif';
    this.ctx.fillText(`Best: ${this.highScore}`, width / 2, height / 2 + 50);
  }

  private renderPlaying(): void {
    if (!this.ctx) return;
    const width = this.canvasElement.width;
    const height = this.canvasElement.height;
    const centerX = width / 2;
    const centerY = height / 2;
    this.ctx.strokeStyle = '#6c5ce7';
    this.ctx.lineWidth = 1;
    for (const radius of this.ORBIT_RADII) {
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, radius, 0, TAU);
      this.ctx.stroke();
    }
    this.ctx.fillStyle = this.planet.color;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, this.planet.radius, 0, TAU);
    this.ctx.fill();
    const shipPos = this.ship.getPosition(centerX, centerY, this.ORBIT_RADII);
    this.ctx.fillStyle = '#00cec9';
    this.ctx.beginPath();
    this.ctx.arc(shipPos.x, shipPos.y, 7, 0, TAU);
    this.ctx.fill();
    this.ctx.fillStyle = 'rgba(0,206,201,0.2)';
    this.ctx.beginPath();
    this.ctx.arc(shipPos.x, shipPos.y, 12, 0, TAU);
    this.ctx.fill();
    for (const enemy of this.enemies) {
      if (!enemy.active) continue;
      const pos = getOrbitPosition(centerX, centerY, this.ORBIT_RADII[enemy.orbitIndex], enemy.angle);
      this.ctx.fillStyle = enemy.color;
      this.ctx.beginPath();
      this.ctx.arc(pos.x, pos.y, enemy.radius, 0, TAU);
      this.ctx.fill();
    }
    for (const collectible of this.collectibles) {
      if (!collectible.active) continue;
      const pos = getOrbitPosition(centerX, centerY, this.ORBIT_RADII[collectible.orbitIndex], collectible.angle);
      const pulse = 1 + Math.sin(collectible.pulse) * 0.2;
      this.ctx.fillStyle = collectible.color;
      this.ctx.beginPath();
      this.ctx.arc(pos.x, pos.y, collectible.radius * pulse, 0, TAU);
      this.ctx.fill();
    }
    // HUD
    this.ctx.fillStyle = '#ff6b6b';
    this.ctx.font = '20px sans-serif';
    for (let i = 0; i < this.lives; i++) {
      this.ctx.fillText('♥', 20 + i * 25, 40);
    }
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 24px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`Score: ${Math.floor(this.score)}`, width / 2, 40);
    this.ctx.fillStyle = '#a29bfe';
    this.ctx.font = '18px sans-serif';
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`Level: ${this.level}`, width - 20, 40);
  }

  private renderGameOver(): void {
    if (!this.ctx) return;
    const width = this.canvasElement.width;
    const height = this.canvasElement.height;
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 48px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GAME OVER', width / 2, height / 2 - 30);
    this.ctx.fillStyle = '#636e72';
    this.ctx.font = '20px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`Score: ${Math.floor(this.score)}`, width / 2, height / 2 + 10);
    this.ctx.fillStyle = '#a29bfe';
    this.ctx.font = '16px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`High: ${this.highScore}`, width / 2, height / 2 + 40);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '18px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Tap to restart', width / 2, height / 2 + 80);
  }

  private loop(timestamp: number): void {
    if (!this.lastTime) {
      this.lastTime = timestamp;
    }
    const dt = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;
    this.update(dt);
    this.render();
    this.animationFrame = requestAnimationFrame((ts) => this.loop(ts));
  }

  public start(): void {
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  public stop(): void {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }
}