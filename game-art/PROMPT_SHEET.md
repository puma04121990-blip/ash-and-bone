# Prompt Sheet — Diablo-dark Pixel RPG
Дата: 2026-09-13 · инструмент пока любой (Grok Imagine быстро / SD+ComfyUI для сида)

Ты клеишь промпт = **STYLE BLOCK** + **SUBJECT** + **NEGATIVES**.
Картинки делает твой инструмент; я потом отберу и проверю по гайду.

## STYLE BLOCK (в начало каждого промпта)
```
top-down pixel art RPG sprite, 32-bit dark fantasy like classic Diablo mood, ash and dried blood palette (#3A3530 #4A3228 #121018 #8B1E1E #B8923A #6B2D8B #C9B89A #4A5568), hard 1px silhouette, weak light from top-left, pale skin, iron and bone, no cute colors, game asset, transparent background, nearest-neighbor pixel perfect, readable on mobile
```

## NEGATIVES (всегда)
```
no background, no white studio floor, no checkerboard, no drop shadow baked in, no watermark, no text, no UI chrome, no blur, no anti-aliased soft outline, no isometric, no side view, no anime eyes, no bright green grass, no cozy farm, no photorealistic, no 3D render
```

## SUBJECTS — P0 batch (по одному кадру / клипу)

### Hero
```
male dark fantasy warrior, pale skin, iron armor, grey-blue cloth cape, holding short sword, idle standing, facing down/camera, full body, feet at bottom center, 64x64 pixel art character sprite
```
```
same warrior walking down, mid stride, locked feet pivot, 64x64 pixel art game sprite
```

### Enemy
```
undead skeleton grunt enemy, crimson eye glow, rusty blade, hunched, facing down, 48x48 pixel art RPG sprite, threatening silhouette
```

### Tiles
```
seamless 32x32 top-down dungeon floor tile, ash grey dirt, subtle cracks, dark fantasy, flat game tile, no objects
```
```
seamless 32x32 top-down stone wall tile, bone-colored masonry, dark grout, dungeon, flat game tile
```

### Prop / UI / FX
```
closed wooden treasure chest, iron bands, cursed gold trim, top-down three-quarter, 32x32 pixel prop, transparent background
```
```
pixel art play button UI, dark panel #0E0C12, cursed gold label area, normal state, 96x32, flat
```
```
pixel hit impact VFX, crimson sparks, 4-frame sheet horizontal, transparent, 32x32 cells
```

## Variation grid (если пачка кривая — меняй ОДНО)
1. Только палитра теплее/холоднее  
2. Только «thicker silhouette / thinner silhouette»  
3. Только «less detail / more cracks»  
4. Только «more blood accents»  
5. Только размер («strict 64x64 canvas, character fits entirely»)

## После генерации
Кинь сюда лучшие кадры — отберу keepers, проверю дрифт, нарежу под атлас.
