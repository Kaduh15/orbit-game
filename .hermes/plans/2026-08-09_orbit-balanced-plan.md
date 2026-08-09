# ORBIT — Balanced Implementation Plan (Senior-Approved)

> **Goal:** Build a maintainable, performant, and fun prototype matching the Penpot designs—structured enough to scale, simple enough to ship fast.
> 
> **Core Principles (from a tired senior who’s seen it all):**
> - � ✅ **Modular but not microscopic:** 6-8 core files max. No god objects, no 200-file microservices for a circle.
> - � ✅ **Tested where it counts:** Unit tests for pure logic (math, state). Zero tests for rendering (your eyes are the validator).
> - � ✅ **TypeScript where it pays off:** Strict typing for game state/entities. Skip for trivial DOM glue.
> - � ✅ **Performant by design:** Avoid GC spikes, minimize trig in render loop, target 60fps on mid-tier mobile.
> - � ✅ **Fun first:** Ship jump must feel *snappy*. Enemy speed should make you grin when you dodge.
> 
> **Hard Limits (to prevent over-engineering):**
> - �� 🚫 No ECS/RxJS/state machines unless absolutely proven necessary (spoiler: it’s not for this scope)
> - �� 🚫 No test file per function (1 test file per concern is enough)
> - �� 🚫 No build optimization beyond Vite defaults (we’re not shipping to Chrome Web Store yet)
> - �� 🚫 No assets beyond primitives (we draw circles/lines/text—no PNGs needed)

## ������ ���� ���� �� ���� �� �� 🎯 What We Will Build (The Fun Part)
A playable web game where:
1. **Title Screen:** Planet, "ORBIT" title, PLAY button (matches Penpot colors/shapes)
2. **Gameplay Screen:** 
   - Central purple planet (#6c5ce7)
   - 3 static orbit rings (visual guides)
   - Player ship (cyan circle) that **jumps orbits on tap/click** (responsive!)
   - 2-3 enemy red circles moving at fixed speed on orbits
   - Score counter (top-left) increasing over time
   - Simple lives counter (top-right: � ♥♥♥)
3. **Collision:** Ship touches enemy → GAME OVER screen
4. **GAME OVER:** Final score, high score (localStorage), "TAP TO RESTART"

**What We’re NOT Building (To Stay Sane):**
- �� 🚫 Particle effects, glows, highlights (we’ll fake glow with alpha if trivial)
- �� 🚫 Sound effects (save for v2—focus on core loop)
- �� 🚫 Collectibles/power-ups (core loop first)
- �� 🚫 Multiple levels/difficulty progression (fixed speed is fine for prototype)
- �� 🚫 Complex enemy behaviors (they just orbit—no AI needed)
- �� 🚫 Responsive design beyond `width=device-width, user-scalable=no` (we assume portrait mobile)
- �� 🚫 Test suite for rendering (if it looks right, it is right)
- �� 🚫 Abstract factories, dependency injection, or ceremony

## ������ ���� ���� �� ���� �� �� 🛠��������������️ Stack: The "Just Enough" Stack
| Layer | Choice | Why |
|-------|--------|-----|
| **Language** | TypeScript | Catches state/entity bugs early. Worth the trivial setup cost. |
| **Builder** | Vite | Zero-config dev server + HMR. `npm create vite@latest` and forget. |
| **Rendering** | HTML5 Canvas 2D API | Native, fast, no abstraction tax. |
| **State** | Plain TS interfaces + game loop | No Redux/MobX—just a `gameState` object we mutate. |
| **Input** | Pointer events (pointerdown) | Works on mobile + desktop. No hammer.js. |
| **Persistence** | localStorage | For high score—simple and effective. |
| **Build Target** | ES2020 | Modern browsers only—no polyfill bloat. |

## ������ ���� ���� �� ���� �� �� 📂 File Structure (The "Holy Shit This Is Simple" Structure)
```
orbit-game/
├── index.html           ← Structure + meta tags (15 lines)
├── main.ts              ← Bootstrap game loop (10 lines)
├── game.ts              ← State machine + update logic (~60 lines)
├── renderer.ts          ← ALL canvas.draw*() calls (~80 lines)
├── entities.ts          ← Entity interfaces + factories (~40 lines)
├── utils.ts             ← Pure math: orbit pos, collision (~25 lines)
├── vite.config.ts       ← Barely configured Vite (10 lines)
├─�└─ public/
   └── manifest.json     ← PWA basics (name/icons—20 lines)
```
**Total:** 8 files. **Average size:** <40 lines/file.  
*If any file exceeds 60 lines, we split it—but we won’t need to.*

## ������ ���� ���� �� ���� �� �� 🧪 Testing Strategy (The "Enough to Sleep Well" Approach)
We test **only what breaks silently and hurts to debug manually**:
- � ✅ **Unit tests (Vitest) for:**
  - Orbit position calculation (`utils.ts`)
  - Collision detection (`utils.ts`)
  - Game state transitions (`game.ts`: title→playing, playing→gameover, etc.)
  - Score/high score logic (`game.ts`)
- �� ❌ **NO tests for:**
  - Rendering (is the circle in the right place? Look at it.)
  - Input handling (does tap make ship jump? Try it.)
  - Asset loading (we have none)
  - CSS (we have almost none)

**Test file structure:**
```
├─�└─ src/
   ├─�└─ __tests__/
      ├─ utils.test.ts          ← Orbit math + collision
      └─ game.test.ts           ← State machine + score logic
```
**Why this works:** 
- If orbit math is wrong, ships/jumps will look broken *immediately* in dev.
- If state transitions are broken, you’ll see it in <2 clicks.
- Rendering bugs are visual—you’ll spot them faster than writing a test.

## ������ ���� ���� �� ���� �� �� ⏱��������������️ Realistic Time Estimates (Based on Sad Experience)
| Task | Time | Model | Notes |
|------|------|-------|-------|
| **1. Project Scaffold** | 5 min | `9router/fast` | `npm create vite@latest orbit-game -- --template vanilla-ts` + basic HTML |
| **2. Core Loop + Title Screen** | 15 min | `9router/coding` | Game state machine, title screen render, tap-to-start |
| **3. Gameplay Rendering** | 15 min | `9router/coding` | Planet, orbits, ship, enemies, score/lives HUD |
| **4. Input + Collision** | 10 min | `9router/coding` | Tap → ship jump, enemy movement, ship-enemy collision → game over |
| **5. Polish + Ship Feel** | 10 min | `9router/fast` | Ship size/glow, lives hearts, pause button (stubbed), high score |
| **6. PWA Basics** | 5 min | `9router/fast` | `manifest.json` + icons (solid purple circles) |
| **7. Final Smoke Test** | 5 min | Manual | Play 3 rounds: does it feel *fun*? Ship responsive? Enemies threatening? |
| **TOTAL** | **60-70 min** | | (Yes, under 90 minutes for a playable prototype) |

## ������ ���� ���� �� ���� �� �� 🚀 Implementation Notes (From the Trenches)
### �� 🔑 Where We Spend Our "Complexity Tokens"
1. **TypeScript Interfaces (entities.ts):**  
   ```ts
   export interface Ship { 
     orbitIndex: 0 | 1 | 2; 
     angle: number; 
     jump(): void; 
     jumpIn(): void; 
     update(dt: number, radii: number[]): void; 
     getPosition(cx: number, cy: number, radii: number[]): {x: number, y: number}; 
   }
   ```
   *Why?* Prevents `ship.orbitIndex = 5` bugs. Cost: 2 minutes. Value: infinite.

2. **Render Loop Optimization (game.ts):**  
   ```ts
   // PRE-CALCULATE THESE ONCE (not per frame!)
   private readonly ORBIT_RADII = [60, 100, 140]; 
   private readonly SHIP_SPEED = 2.5; // rad/s 
   private readonly ENEMY_SPEED_RANGE = [0.8, 1.2]; 
   
   update(dt: number) {
     // ... update ship/enemies using PRE-CALC values
     // NO Math.PI * 2 in hot path—use TAU constant if needed
   }
   ```
   *Why?* Avoids re-creating arrays/objects every 16ms. Free performance.

3. **Enemy Spawning (game.ts):**  
   ```ts
   private spawnTimer = 0;
   private readonly SPAWN_INTERVAL = 2.0; // seconds
   
   update(dt: number) {
     this.spawnTimer -= dt;
     if (this.spawnTimer <= 0) {
       this.spawnEnemy();
       this.spawnTimer = this.SPAWN_INTERVAL + Math.random() * 1.0; // slight randomness
     }
   }
   ```
   *Why?* Predictable but not robotic spawns. Feels "alive."

### �� 🎯 The "Feel" Checklist (Non-Negotiable for Fun)
Before moving to next task, verify:
- [ ] **Ship jump is snappy:** Tap → immediate orbit change (no lag)
- [ ] **Enemies are threatening but fair:** You can dodge with skill
- [ ] **Score rises meaningfully:** ~10 pts/sec feels rewarding
- [ ] **Game Over is clear:** Big text, shows score, invites retry
- [ ] **Title screen invites play:** PLAY button looks tappable

## ������ ���� ���� �� ���� �� �� 🚫 What We’re Absolutely Not Doing (The "Sénior Cansado" Veto List)
- �� 🚫 **No physics engine:** We’re not simulating gravity—we’re faking orbits with trig. *Good enough.*
- �� 🚫 **No asset loader:** `ctx.arc(x,y,r,0,Math.PI*2)` is faster than loading a 1KB PNG.
- �� 🚫 **No abstract factory for entities:** `createShip()`, `createEnemy()`—done.
- �� 🚫 **No state machine library:** A `switch (state)` in `game.ts` update loop is plenty.
- �� 🚫 **No ECS:** For 3 entity types? Overkill. Plain objects win.
- �� 🚫 **No build optimization:** `vite build` is fine for now. We’ll worry about bundle size when we have users.
- �� 🚫 **No test for `drawPlanet()`:** If the planet’s in the wrong spot, you’ll see it. Write code, not tests for the obvious.

## ������ ���� ���� �� ���� �� �� 💡 Why This Won’t Become Legacy Garbage
- **Types catch refactoring errors:** Change `Ship.orbitIndex` to `number`? TS screams if you miss a spot.
- **Small files = low cognitive load:** Open `renderer.ts` — see *all* canvas calls in one place.
- **Pure functions in `utils.ts`:** Orbit math and collision are trivial to test and reuse.
- **Game state is explicit:** `game.ts` has `{ state, score, ship, enemies [...], lives }`—no hidden state.
- **Input is decoupled:** `input.ts` (if we split it later) turns pointer events → game actions (`JUMP`, `RESTART`).

## ������ ���� ���� �� ���� �� �� 📈 If We Have Extra Time (After Core Works)
1. **Ship glow:** Second circle with `rgba(0,206,201,0.2)`
2. **Enemy variety:** Slow red, fast pink (different speeds/sizes)
3. **Pause button:** Actually pause the game (toggle `isPaused`)
4. **High score persistence:** Already in plan—just needs `localStorage` hook
5. **Sound effects:** *Only* if we have Howler.js already in another project (skip if not)

This plan gives you a **maintainable foundation** that you can actually extend in 2026 without wanting to burn your laptop. The core loop will be evident in <60 minutes of work.  

**Ready to begin?** The file structure above is your contract—we stay within those lines (literally).  