# Diablo Pixel RPG

Dark Diablo-mood top-down pixel RPG scaffold.

## Stack

- **TypeScript 5.x** (strict)
- **Phaser 4.2.1** (latest stable Phaser 4 on npm at scaffold time)
- **Vite 6**
- **pnpm**
- No React

> Phaser 4 resolved successfully from npm (`phaser@4.2.1`). No fallback to Phaser 3 was required.

## Quick start

```bash
cd /workspace/diablo-pixel-rpg
pnpm install
pnpm gen:assets   # regenerate placeholder PNGs (already committed under assets/)
pnpm dev          # http://localhost:5173
pnpm build        # typecheck + production bundle → dist/
```

## Playable slice

1. **Menu** → Play (RU default / EN toggle)
2. **WASD / arrows** or **pointer-follow** (hold touch/click)
3. One **skeleton** chases slowly; contact damages with crimson flash / particles
4. **Chest** grants gold → `GameState` + save sync stub
5. **Pause** on `visibilitychange`
6. **AudioBus** silent until first pointer/key; then UI click beep (Web Audio oscillator)

## GamePush

- `Phaser.Game` starts only after `window.onGPInit` **or** ~4.5s **NullGp** fallback
- NullGp: ads no-op, saves via `localStorage`
- Allowed stubs only: player `ready/isLoggedIn/get/set/add/sync/load/logout/enableAutoSync`; ads `showPreloader/showSticky/showFullscreen/showRewardedVideo` + availability flags; `platform.type`
- Env: copy `.env.example` → `.env` and set `VITE_GP_PROJECT_ID`, `VITE_GP_PUBLIC_TOKEN`

## Palette

Ash `#3A3530`, Dirt `#4A3228`, Stone `#6E6558`, Abyss `#121018`, Bone `#C9B89A`, Hero cloth `#4A5568`, Poison `#4F6B3C`, Crimson `#8B1E1E`, Gold `#B8923A`, Arcane `#6B2D8B`, UI panel `#0E0C12`, UI text `#D8D2C8`, Skin `#A89078`, Iron `#5A5E66`.

## Placeholder assets

| File | Size |
|------|------|
| `assets/hero.png` | 64×64 |
| `assets/hero_idle2.png` | 64×64 |
| `assets/floor_ash.png` | 32×32 |
| `assets/wall.png` | 32×32 |
| `assets/skeleton.png` | 48×48 |
| `assets/chest.png` | 32×32 |
| `assets/btn_play.png` | 128×48 |
| `assets/particle_hit.png` | 8×8 |
| `assets/coin.png` | 16×16 |

Generated with pure Node PNG buffers (`pnpm gen:assets`).

## GitHub Pages

Live: https://puma04121990-blip.github.io/ash-and-bone/

Deploy is automatic on push to `main` (workflow **Deploy GitHub Pages**). Open that path — not the account root `*.github.io` without `/ash-and-bone/`.
