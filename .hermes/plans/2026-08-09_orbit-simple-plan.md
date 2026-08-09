# ORBIT — Simplified Implementation Plan

> **Goal:** Create a playable prototype matching the Penpot designs as quickly as possible using the simplest effective solutions.
> 
> **Core Principle:** "Make it work first, then make it good if time allows." Prioritize visible gameplay over perfect code structure.

## ���� �� �� 🎯 What We Will Build (MVP)
A playable web game where:
1. Title screen shows planet, "ORBIT" title, PLAY button
2. Tap PLAY → gameplay screen
3. Gameplay shows:
   - Central purple planet
   - 3 orbit rings (visual only)
   - Player ship (cyan circle) that jumps orbits on tap
   - 2-3 enemy red circles moving on orbits
   - Score counter increasing over time
   - Simple collision: touching enemy → GAME OVER
4. GAME OVER screen shows final score + tap to restart

**Explicitly NOT building (to avoid complexity):**
- High score persistence (we'll use localStorage but won't optimize it)
- Particle effects, glows, highlights
- Sound effects
- Collectibles/power-ups
- Multiple levels or difficulty progression
- Complex enemy behaviors (they'll just move at fixed speed)
- Responsive design beyond basic mobile meta tag
- Automated testing beyond one smoke test
- Abstract architectures (ECS, state machines, etc.)

## ���� �� �� 🛠������️ Stack: The Bare Minimum
- **Language:** Plain JavaScript (ES6) — no TypeScript compile step
- **Builder:** Vite (just for dev server + hot reload — zero config needed)
- **Rendering:** Native HTML5 Canvas 2D API (no libraries)
- **State:** Single plain JavaScript object
- **Input:** pointerdown events (works on mobile + desktop)

## ���� �� �� 📋 4-Task Simple Plan (50-60 Minutes Total)

### Task 1: Project Setup + Title Screen (10 min)
**Model:** `9router/fast`  
**Files to create/modify:**
- `index.html` — basic structure with canvas
- `main.js` — entry point
- `title.js` — title screen rendering logic

**What to do:**
1. `npm create vite@latest orbit-game -- --template vanilla`
2. Replace `index.html` with:
   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
     <title>ORBIT</title>
     <style>
       * { margin: 0; padding: 0; box-sizing: border-box; }
       html, body { width: 100%; height: 100%; overflow: hidden; background: #0a0a2e; }
       canvas { display: block; width: 100%; height: 100%; }
     </style>
   </head>
   <body>
     <canvas id="game"></canvas>
     <script type="module" src="/src/main.js"></script>
   </body>
   </html>
   ```
3. Create `src/main.js`:
   ```javascript
   import { TitleScreen } from './title.js';
   
   const canvas = document.getElementById('game');
   const ctx = canvas.getContext('2d');
   
   function resize() {
     canvas.width = window.innerWidth;
     canvas.height = window.innerHeight;
   }
   
   window.addEventListener('resize', resize);
   resize();
   
   const title = new TitleScreen(ctx, canvas.width, canvas.height);
   
   let animationFrame;
   function loop() {
     ctx.clearRect(0, 0, canvas.width, canvas.height);
     title.render();
     animationFrame = requestAnimationFrame(loop);
   }
   
   canvas.addEventListener('pointerdown', () => {
     // TODO: transition to gameplay
   });
   
   loop();
   ```
4. Create `src/title.js` with:
   - Draw dark background
   - Draw purple planet (circle) at left
   - Draw simple orbit ring (ellipse)
   - Draw "ORBIT" text
   - Draw "Best: 0" text
   - Draw purple PLAY button

**Verification:**  
Open `http://localhost:5173` — should see title screen matching Penpot design.  
Tap/click → should transition to gameplay (we'll stub this next).

### Task 2: Core Gameplay Rendering (15 min)
**Model:** `9router/coding`  
**Files:**
- `game.js` — core game state and loop
- `renderer.js` — all canvas drawing functions
- `entities.js` — simple entity constructors (planet, ship, enemy)

**What to do:**
1. Replace `main.js` stub with:
   ```javascript
   import { Game } from './game.js';
   
   const game = new Game(document.getElementById('game'));
   game.start();
   ```
2. Create `src/game.js`:
   - Simple state: `{ state: 'title'|'playing'|'gameover', score: 0 }`
   - Game loop with `requestAnimationFrame`
   - Input handler: tap → if playing: ship.jump(); if title/go: reset/start
   - Update score over time
3. Create `src/renderer.js` with functions like:
   ```javascript
   export function drawPlanet(ctx, x, y, radius) {
     ctx.fillStyle = '#6c5ce7';
     ctx.beginPath();
     ctx.arc(x, y, radius, 0, Math.PI * 2);
     ctx.fill();
   }
   
   export function drawOrbit(ctx, cx, cy, radius) {
     ctx.strokeStyle = '#6c5ce7';
     ctx.lineWidth = 1;
     ctx.beginPath();
     ctx.arc(cx, cy, radius, 0, Math.PI * 2);
     ctx.stroke();
   }
   ```
4. Create `src/entities.js` with ultra-simple constructors:
   ```javascript
   export function createPlanet(x, y, radius) {
     return { x, y, radius, color: '#6c5ce7' };
   }
   
   export function createShip(orbitIndex = 1) {
     return { orbitIndex, angle: 0 };
   }
   
   export function createEnemy(orbitIndex) {
     return { 
       orbitIndex, 
       angle: Math.random() * Math.PI * 2,
       speed: 0.5 + Math.random() 
     };
   }
   ```
5. In game loop:
   - Clear screen
   - Draw background
   - Draw planet (center)
   - Draw 3 orbits (radii: 60, 100, 140)
   - Draw ship on current orbit
   - Draw enemies on their orbits
   - Draw score in top-center

**Verification:**  
- Title screen → tap → gameplay screen appears
- Ship is visible on middle orbit
- Enemies visible and slowly moving
- Score number increases in top-center
- Tap makes ship jump to next orbit (visual change)

### Task 3: Collision & Game Over (15 min)
**Model:** `9router/coding`  
**Files:**
- Update `game.js`
- Update `entities.js` (add collision helper)

**What to do:**
1. Add to `entities.js`:
   ```javascript
   export function circlesCollide(a, b) {
     const dx = a.x - b.x;
     const dy = a.y - b.y;
     const distance = Math.sqrt(dx*dx + dy*dy);
     return distance < (a.radius + b.radius);
   }
   ```
2. In `game.js` update loop:
   - After updating enemy positions, check ship vs each enemy
   - If collision: set state = 'gameover', save score if high
3. Add game over rendering:
   - Dark background
   - "GAME OVER" text
   - "Score: {score}" text
   - "High: {highScore}" text
   - "Tap to restart" text
   - Optional: small replay icon

**Verification:**  
- Gameplay screen visible
- Ship jumps orbits on tap
- Enemies move continuously
- When ship touches enemy: screen changes to GAME OVER
- GAME OVER shows score and high score
- Tap from GAME OVER restarts game

### Task 4: Polish & Ship (10 min)
**Model:** `9router/fast`  
**Files:**
- Update `entities.js` (ship rendering)
- Update `renderer.js` (HUD elements)
- Add `manifest.json` for PWA basics

**What to do:**
1. Make ship more visible:
   - Slightly larger radius
   - Optional: add a simple glow (second circle with lower opacity)
2. Add simple HUD elements:
   - 3 hearts in top-left (lives — we'll hardcode to 3 for now)
   - Pause button in top-right (just a rect, no function yet)
   - "Level 1" in top-center (hardcoded)
3. Create `public/manifest.json`:
   ```json
   {
     "name": "ORBIT",
     "short_name": "ORBIT",
     "start_url": ".",
     "display": "standalone",
     "background_color": "#0a0a2e",
     "theme_color": "#0a0a2e",
     "icons": [
       {
         "src": "icon-192.png",
         "sizes": "192x192",
         "type": "image/png"
       },
       {
         "src": "icon-512.png",
         "sizes": "512x512",
         "type": "image/png"
       }
     ]
   }
   ```
4. Add `<link rel="manifest" href="/manifest.json">` to index.html
5. Generate simple 192x192 and 512x512 icons (just solid purple circles for now)

**Verification:**  
- Ship is clearly visible (cyan with optional glow)
- Hearts, score, level, pause button visible in corners
- Game still plays correctly
- Built version works (`npm run build` then `serve dist`)
- Manifest shows in dev tools Application tab

## ���� �� �� 🚫 What We're NOT Building (Reiterated for Clarity)
- �� ❌ No TypeScript (JS only — faster iteration)
- �� ❌ No physics engine (simple position updates)
- �� ❌ No entity-component system (plain objects)
- �� ❌ No persistence abstraction (direct localStorage access)
- �� ❌ No sound (Howler.js would be extra dependency)
- �� ❌ No complex particle effects (just basic shapes)
- �� ❌ No level progression (hardcoded difficulty)
- �� ❌ No automated test suite (relying on manual verification)
- �� ❌ No build optimization beyond Vite defaults
- �� ❌ No code splitting or lazy loading

## ���� �� �� 📂 Final File Structure
```
orbit-game/
├── index.html
├── main.js
├── game.js
├── renderer.js
├── entities.js
├── vite.config.js
├── package.json
├── public/
│   ├── manifest.json
│   ├── icon-192.png
│   └── icon-512.png
�└── src/
    └── (all .js files above)
```

## ���� �� �� ⏱������️ Realistic Time Estimates
- Task 1 (Setup + Title): 10-15 min
- Task 2 (Core Gameplay): 15-20 min  
- Task 3 (Collision + GO): 10-15 min
- Task 4 (Polish + PWA): 5-10 min
- **Total:** 40-60 minutes (not hours)

## ���� �� �� 💡 Simplicity Tips
1. **Draw first, refactor later:** If you need a planet, draw it. Only make a function if you draw it 2+ places.
2. **Hardcode values:** Use magic numbers for orbits, speeds — tweak until it feels right.
3. **Copy-paste is OK:** Similar enemy/ship code can be duplicated initially.
4. **Global state is fine:** One `gameState` object is simpler than stores.
5. **Focus on the feel:** Does tapping feel responsive? Is avoiding enemies challenging but fun? That's the goal.

This plan gets you to a playable prototype in under an hour. If you have extra time after, then you can refactor or add features — but the core game will be working fast.

Plan saved. Ready to implement with the simplest approach possible.