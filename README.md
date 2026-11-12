# Bridge Blitz — 3D Math Army Gate-Runner

A 60 FPS, zero-asset procedural 3D browser & mobile-ready math army gate-runner built with **TypeScript (`strict: true`)**, **Vite**, **Three.js (`InstancedMesh`)**, **Web Audio API**, and **Vitest**.

## Play on Android (Google Pixel 10 XL)

1. **Native Android APK (Capacitor + Native Linear Haptics)**:
   - Download **[`BridgeBlitz-Pixel10XL.apk`](https://github.com/CraigT22/bridge-blitz/releases/latest/download/BridgeBlitz-Pixel10XL.apk)** from [GitHub Releases](https://github.com/CraigT22/bridge-blitz/releases).
   - Tap to install on your Pixel 10 XL (if Google Play Protect asks about an unverified developer debug build, tap **More details → Install anyway**).
   - Runs locked to portrait `20:9` with native edge-to-edge display, Screen Wake Lock, `@capacitor/haptics` linear actuator feedback, and 100% offline Airplane Mode support.
2. **Instant Chrome WebAPK (PWA)**:
   - Open **`https://craigt22.github.io/bridge-blitz/`** in Chrome on your Pixel 10 XL and tap **⋮ → Add to Home screen → Install**.

## Key Engineering Highlights

- **Zero External Assets**: All 3D soldier squads, tiered weapons, Boss Mechs, padlocks, ocean water GLSL shaders, dynamic `CanvasTexture` gate panels, and Web Audio synthesizer SFX are procedurally generated in code.
- **Strict Zero-GC Frame Loop**: Struct-of-Arrays `BulletPool` (`1,200` instances) and `ParticlePool` (`900` instances) use `O(1)` swap-remove deactivation backed by `THREE.InstancedMesh` batches and module-scoped scratch vectors/matrices.
- **Capped Visuals, Unbounded Math**: Logical squad counts scale up to `9,999+` while capping rendered soldier instances at `150` and scaling projectile damage proportionally.
- **Anti-Frustration Weapon Lock**: Breaking a lower- or equal-tier weapon tire stack never downgrades an equipped weapon; instead, it awards an instant **`+50 COINS` & `+3 SQUAD`** bonus.
- **10 Handcrafted Campaign Stages + Endless Bridge Mode**: Saved automatically via versioned `localStorage` (`bridge_blitz_save_v1`) with JSON export and safe reset.

## Commands

```bash
# Install dependencies
npm install

# Run unit tests (Vitest)
npm test

# Start local development server (http://localhost:5173)
npm run dev

# Typecheck & build production bundle
npm run build
```

## Controls

- **Start Run**: Tap/click the bridge or press `Space`, `A`/`D`, or `ArrowLeft`/`ArrowRight`.
- **Steer Squad**: 1:1 touch drag, mouse hold-and-drag, `A`/`D`, `ArrowLeft`/`ArrowRight`, or Web Gamepad left stick / D-pad.
- **Pre-Run Upgrades**: Click cards or press `1` (Fire Rate), `2` (Bullet Power), `3` (Starting Squad), `4` (War Chest).
