# ORBIT — Plano de Implementação (v2 — TDD + Modelos)

> **Stack:** TypeScript + Vite + HTML5 Canvas 2D + Vitest
> **Testes:** Vitest (unit) + validação visual manual

---

## 🧠 Alocação de Modelos por Tipo de Tarefa

| Modelo | Tipo | Quando Usar |
|--------|------|-------------|
| `9router/coding` | Código principal | Tasks de implementação (entidades, engine, rendering) |
| `oc/laguna-s-2.1-free` | Código pesado | Refatoração complexa, arquitetura |
| `oc/nemotron-3-ultra-free` | Raciocínio | Decisões de design, debug difícil, revisão |
| `9router/fast` | Tarefas leves | Config, boilerplate, commits |
| `9router/premium` | Revisão final | Code review do projeto completo |

**Regra geral:**
- Scaffolding/config → `9router/fast`
- Implementação de entidades → `9router/coding`
- Testes TDD → `9router/coding` (com prompt de TDD)
- Integração/Engine → `oc/laguna-s-2.1-free`
- Debug/Arquitetura → `oc/nemotron-3-ultra-free`
- Review final → `9router/premium`

---

## 🧪 Estratégia de Testes

### O que testar (e o que NÃO testar)

**TESTAR (lógica pura, sem Canvas):**
- Posição de entidades em orbitas (cálculo trigonométrico)
- Colisão entre entidades (distância euclidiana)
- Estado do jogo (transições title→playing→gameover)
- Score e high score (persistência localStorage)
- Spawn de inimigos/coletáveis (frequência, limites)
- Dificuldade progressiva (velocidade, spawn rate)
- Ship jump (limites de orbitas 0-2)
- Collectible pulse animation (sin wave)

**NÃO testar (requer Canvas/visual):**
- Rendering (será validado visualmente com Playwright)
- Animação frame-a-frame
- Performance em dispositivos reais

### Framework de Testes

```bash
npm install -D vitest
```

```typescript
// vitest.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
```

---

## Plano Detalhado — TDD Rigoroso

### Fase 1: Setup

#### Task 1: Scaffold do projeto

**Modelo:** `9router/fast`
**Objetivo:** Projeto Vite + TS + Vitest funcionando

**Criar:**
- `package.json` (scripts: dev, build, test)
- `tsconfig.json`
- `vite.config.ts`
- `vitest.config.ts`
- `index.html`
- `src/main.ts` (stub)
- `src/__tests__/smoke.test.ts`

**Teste smoke:**
```typescript
// src/__tests__/smoke.test.ts
import { describe, it, expect } from 'vitest';

describe('ORBIT project', () => {
  it('project is bootstrapped', () => {
    expect(true).toBe(true);
  });
});
```

**Verificar:**
```bash
npm test          # 1 test pass
npm run dev       # Abre browser, mostra canvas preto
```

**Commit:** `feat: init vite + ts + vitest project`

---

#### Task 2: Game engine core — TDD

**Modelo:** `9router/coding`
**Objetivo:** Game loop, canvas wrapper, state machine

**Testes PRIMEIRO:**

```typescript
// src/engine/__tests__/Game.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Game, GameState } from '../Game';

describe('Game state machine', () => {
  let game: Game;

  beforeEach(() => {
    // Mock canvas - não depende de DOM
    game = new Game({ width: 375, height: 812 });
  });

  it('starts in title state', () => {
    expect(game.state).toBe('title');
  });

  it('transitions to playing on tap', () => {
    game.handleInput();
    expect(game.state).toBe('playing');
  });

  it('transitions to gameover when lives reach 0', () => {
    game.handleInput(); // playing
    game.lives = 1;
    game.loseLife();
    expect(game.state).toBe('gameover');
  });

  it('resets to title from gameover on tap', () => {
    game.handleInput(); // playing
    game.lives = 0;
    game.loseLife(); // gameover
    game.handleInput();
    expect(game.state).toBe('title');
  });

  it('does not respond to input during playing (except jump)', () => {
    game.handleInput(); // playing
    const prevState = game.state;
    game.handleInput(); // should be jump, not state change
    expect(game.state).toBe(prevState);
  });
});
```

```typescript
// src/engine/__tests__/score.test.ts
describe('Score system', () => {
  it('increases score over time during playing', () => {
    game.handleInput(); // playing
    game.update(1.0); // 1 second
    expect(game.score).toBeGreaterThan(0);
  });

  it('saves high score to localStorage', () => {
    game.handleInput();
    game.score = 500;
    game.loseLife();
    expect(game.highScore).toBe(500);
  });

  it('does not save if current score is lower', () => {
    localStorage.setItem('orbit-highscore', '1000');
    game.handleInput();
    game.score = 100;
    game.loseLife();
    expect(game.highScore).toBe(1000);
  });
});
```

**Verificar (RED):**
```bash
npm test -- src/engine/__tests__/Game.test.ts
# Esperado: FAIL — Game class não existe
```

**Implementar:** `src/engine/Game.ts` + `src/engine/Canvas.ts`

**Verificar (GREEN):**
```bash
npm test
# Todos os tests passam
```

**Commit:** `feat: game engine with state machine and scoring (TDD)`

---

### Fase 2: Entidades Core

#### Task 3: Orbit system — TDD

**Modelo:** `9router/coding`
**Objetivo:** Cálculo de posições orbitais

**Testes PRIMEIRO:**

```typescript
// src/entities/__tests__/orbit.test.ts
import { describe, it, expect } from 'vitest';
import { getOrbitPosition } from '../orbit';

describe('Orbit position calculation', () => {
  const centerX = 187.5; // 375/2
  const centerY = 406;   // 812/2

  it('returns correct position at angle 0 (right)', () => {
    const pos = getOrbitPosition(centerX, centerY, 100, 0);
    expect(pos.x).toBeCloseTo(287.5, 1); // 187.5 + 100
    expect(pos.y).toBeCloseTo(406, 1);
  });

  it('returns correct position at angle PI/2 (bottom)', () => {
    const pos = getOrbitPosition(centerX, centerY, 100, Math.PI / 2);
    expect(pos.x).toBeCloseTo(187.5, 1);
    expect(pos.y).toBeCloseTo(506, 1); // 406 + 100
  });

  it('returns correct position at angle PI (left)', () => {
    const pos = getOrbitPosition(centerX, centerY, 100, Math.PI);
    expect(pos.x).toBeCloseTo(87.5, 1); // 187.5 - 100
    expect(pos.y).toBeCloseTo(406, 1);
  });

  it('returns center when radius is 0', () => {
    const pos = getOrbitPosition(centerX, centerY, 0, 1.5);
    expect(pos.x).toBe(centerX);
    expect(pos.y).toBe(centerY);
  });

  it('handles full rotation (2*PI) wraps correctly', () => {
    const pos1 = getOrbitPosition(centerX, centerY, 100, 0);
    const pos2 = getOrbitPosition(centerX, centerY, 100, Math.PI * 2);
    expect(pos1.x).toBeCloseTo(pos2.x, 5);
    expect(pos1.y).toBeCloseTo(pos2.y, 5);
  });
});

describe('Collision detection', () => {
  it('detects collision when entities overlap', () => {
    // Distance 0 = same position
    expect(checkCollision({x: 100, y: 100}, {x: 100, y: 100}, 10)).toBe(true);
  });

  it('detects collision within threshold', () => {
    expect(checkCollision({x: 100, y: 100}, {x: 105, y: 100}, 10)).toBe(true);
  });

  it('no collision beyond threshold', () => {
    expect(checkCollision({x: 100, y: 100}, {x: 120, y: 100}, 10)).toBe(false);
  });

  it('collision is symmetric', () => {
    const a = {x: 50, y: 50};
    const b = {x: 55, y: 55};
    expect(checkCollision(a, b, 10)).toBe(checkCollision(b, a, 10));
  });
});
```

**Verificar (RED):** `npm test -- src/entities/__tests__/orbit.test.ts` → FAIL

**Implementar:** `src/entities/orbit.ts`

**Verificar (GREEN):** `npm test` → ALL PASS

**Commit:** `feat: orbit position and collision detection (TDD)`

---

#### Task 4: Ship entity — TDD

**Modelo:** `9router/coding`
**Objetivo:** Nave com jump entre orbits

**Testes PRIMEIRO:**

```typescript
// src/entities/__tests__/ship.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { Ship } from '../Ship';

describe('Ship', () => {
  let ship: Ship;

  beforeEach(() => {
    ship = new Ship(1); // começa na orbita do meio
  });

  it('starts on middle orbit', () => {
    expect(ship.orbitIndex).toBe(1);
  });

  it('jumps to outer orbit', () => {
    ship.jump();
    expect(ship.orbitIndex).toBe(2);
  });

  it('does not jump beyond outer orbit', () => {
    ship.jump(); // 2
    ship.jump(); // still 2
    expect(ship.orbitIndex).toBe(2);
  });

  it('jumps to inner orbit', () => {
    ship.jumpIn();
    expect(ship.orbitIndex).toBe(0);
  });

  it('does not jump below inner orbit', () => {
    ship.jumpIn(); // 0
    ship.jumpIn(); // still 0
    expect(ship.orbitIndex).toBe(0);
  });

  it('angle advances over time', () => {
    const initialAngle = ship.angle;
    ship.update(1.0, [80, 140, 200]);
    expect(ship.angle).toBeGreaterThan(initialAngle);
  });

  it('angle wraps around after full rotation', () => {
    ship.angle = Math.PI * 2 - 0.1;
    ship.update(0.2, [80, 140, 200]);
    expect(ship.angle).toBeLessThan(Math.PI);
  });
});
```

**Commit:** `feat: ship entity with orbit jumping (TDD)`

---

#### Task 5: Enemy + Collectible — TDD

**Modelo:** `9router/coding`
**Objetivo:** Inimigos e coletáveis com spawn

**Testes PRIMEIRO:**

```typescript
// src/entities/__tests__/enemies.test.ts
import { describe, it, expect } from 'vitest';
import { SpawnManager } from '../SpawnManager';

describe('SpawnManager', () => {
  it('spawns enemy after interval', () => {
    const sm = new SpawnManager();
    sm.update(2.0); // 2 seconds
    expect(sm.enemies.length).toBeGreaterThan(0);
  });

  it('does not spawn more than max enemies', () => {
    const sm = new SpawnManager();
    sm.maxEnemies = 3;
    sm.update(10.0);
    expect(sm.enemies.length).toBeLessThanOrEqual(3);
  });

  it('spawns collectibles separately', () => {
    const sm = new SpawnManager();
    sm.update(3.0);
    expect(sm.collectibles.length).toBeGreaterThan(0);
  });

  it('removes enemy on deactivation', () => {
    const sm = new SpawnManager();
    sm.update(2.0);
    sm.enemies[0].active = false;
    sm.cleanup();
    expect(sm.enemies.length).toBe(0);
  });
});
```

**Commit:** `feat: enemy and collectible spawn system (TDD)`

---

#### Task 6: Difficulty progression — TDD

**Modelo:** `9router/coding`
**Objetivo:** Jogo fica mais difícil com o tempo

**Testes PRIMEIRO:**

```typescript
// src/engine/__tests__/difficulty.test.ts
describe('Difficulty progression', () => {
  it('increases level every 500 points', () => {
    game.handleInput();
    game.score = 499;
    game.update(0);
    expect(game.level).toBe(1);
    game.score = 500;
    game.update(0);
    expect(game.level).toBe(2);
  });

  it('increases enemy spawn rate with level', () => {
    game.handleInput();
    game.level = 1;
    const rate1 = game.getEnemySpawnRate();
    game.level = 5;
    const rate5 = game.getEnemySpawnRate();
    expect(rate5).toBeLessThan(rate1); // faster = smaller interval
  });

  it('increases orbit speed with level', () => {
    game.handleInput();
    game.level = 1;
    const speed1 = game.getOrbitSpeed();
    game.level = 3;
    const speed3 = game.getOrbitSpeed();
    expect(speed3).toBeGreaterThan(speed1);
  });
});
```

**Commit:** `feat: difficulty progression system (TDD)`

---

### Fase 3: Rendering + Visual

#### Task 7: Planet rendering

**Modelo:** `9router/coding`
**Objetivo:** Planeta com glow (visual)

**Teste:** Validação visual via Playwright
```bash
# Renderizar e screenshot para validação
npx playwright screenshot http://localhost:5173 /tmp/orbit-render-planet.png
```

**Commit:** `feat: planet rendering with glow effect`

---

#### Task 8: Full game rendering

**Modelo:** `9router/coding`
**Objetivo:** Orbits, ship, enemies, HUD

**Commit:** `feat: full game rendering`

---

#### Task 9: Title screen + Game Over

**Modelo:** `9router/coding`
**Objetivo:** Telas de início e fim

**Commit:** `feat: title screen and game over`

---

### Fase 4: Polish + Mobile

#### Task 10: Touch controls + mobile viewport

**Modelo:** `9router/fast`

**Testes:**
```typescript
// src/engine/__tests__/input.test.ts
describe('Input handling', () => {
  it('tap during playing triggers ship jump', () => {
    game.handleInput(); // playing
    const prevOrbit = game.ship.orbitIndex;
    game.handleInput(); // jump
    expect(game.ship.orbitIndex).toBe(prevOrbit + 1);
  });
});
```

**Commit:** `feat: mobile touch controls`

---

#### Task 11: Starfield background

**Modelo:** `9router/coding`

**Commit:** `feat: animated starfield background`

---

#### Task 12: PWA + deploy

**Modelo:** `9router/fast`

**Commit:** `feat: PWA manifest + deploy config`

---

#### Task 13: Code review final

**Modelo:** `9router/premium`
**Objetivo:** Revisar todo o código, qualidade, performance

**Commit:** `chore: code review fixes`

---

## Ordem de Execução

```
Task  1 (fast)     → Scaffold
Task  2 (coding)   → Engine + State Machine + Score [TDD]
Task  3 (coding)   → Orbit system + Collision [TDD]
Task  4 (coding)   → Ship [TDD]
Task  5 (coding)   → Enemies + Collectibles [TDD]
Task  6 (coding)   → Difficulty [TDD]
Task  7 (coding)   → Planet rendering (visual)
Task  8 (coding)   → Full rendering (visual)
Task  9 (coding)   → Title + GameOver (visual)
Task 10 (fast)     → Touch + Mobile [TDD input]
Task 11 (coding)   → Starfield
Task 12 (fast)     → PWA
Task 13 (premium)  → Review final
```

## Comandos OpenCode por Task

```bash
# Task 1
opencode run 'Create Vite + TypeScript + Vitest project scaffold...' --model 9router/fast

# Task 2
opencode run 'Implement Game engine with TDD. Write tests first...' --model 9router/coding

# Task 3
opencode run 'Implement orbit position calculation with TDD...' --model 9router/coding

# Tasks 4-6 (similar pattern com --model 9router/coding)
# Task 13 (review)
opencode run 'Review entire codebase for quality...' --model 9router/premium
```

## Tempo Estimado

| Fase | Tempo |
|------|-------|
| Setup | 5 min |
| Core (TDD) | 25 min |
| Rendering | 15 min |
| Polish | 10 min |
| **Total** | **~55 min** |
