# Sprite & Tile Spec — Pixel RPG (Phaser / GamePush)

**Locked for now:** top-down · Diablo-dark · tiles `32×32` · hero canvas `64×64` · nearest filter

## Grid
| Параметр | Значение |
|---|---|
| Tile | `32×32` |
| Hero / elite enemy canvas | `64×64` |
| Small enemy / NPC | `48×48` (центр на тайле) |
| Prop (chest, torch) | `32×32` или `32×48` |
| UI icon | `32×32` |
| VFX cell | `32×32` или `48×48` |
| Atlas max | `2048×2048`, padding `2` px, extrude `1` |
| Pivot героя | центр низа (ноги): `(32, 64)` на холсте 64 |
| Pivot тайла | top-left `(0,0)` в tilemap |
| Pivot UI | центр |

Phaser camera: zoom целый (`2` или `3`), чтобы пиксель не мылился. `pixelArt: true` / `roundPixels: true`.

## Анимации героя (`hero_*`, canvas 64×64)
Стартовые цифры — можно крутить после первого билда.

| State | Frames | FPS | Loop | Имена файлов | Notes |
|---|---|---|---|---|---|
| idle | 4 | 6 | yes | `hero_idle_00`…`03` | дыхание, оружие опущено |
| walk | 6 | 10 | yes | `hero_walk_00`…`05` | 4 направления: `_down/_up/_left/_right` |
| run | 8 | 12 | yes | `hero_run_00`…`07` | те же 4 направления |
| attack | 5 | 12 | once | `hero_attack_00`…`04` | hit на кадре `02` |
| hit | 2 | 10 | once | `hero_hit_00`…`01` | flash ок |
| death | 6 | 8 | once | `hero_death_00`…`05` | конец на земле |
| cast | 4 | 10 | once | `hero_cast_00`…`03` | фиолет `#6B2D8B` на руках |

**Направления walk/run:** для top-down RPG — 4 dir минимум. Pivot одинаковый во всех кадрах (locked feet).

Код анимаций Phaser: ключи `hero/idle`, `hero/walk_down`, `hero/attack_down`, …

## Враг: skeleton grunt (`enemy_skel_*`, 48×48)
| State | Frames | FPS | Loop |
|---|---|---|---|
| idle | 4 | 5 | yes |
| walk | 6 | 8 | yes |
| attack | 4 | 10 | once |
| hit | 2 | 10 | once |
| death | 5 | 8 | once |

Маркер угрозы: глаза/лезвие `#8B1E1E`. Pivot: центр низа `(24, 48)`.

## Тайлы (`tile_*`, 32×32)
Базовый набор (blob-autotile 47 позже; сейчас **16-edge** достаточно для вертикального среза):

| ID | Файл | Notes |
|---|---|---|
| ash floor | `tile_ash_00`…`03` | вариации пепла |
| blood dirt path | `tile_path_00`…`03` | тропа |
| bone stone wall | `tile_wall_00` + edges `tile_wall_n/e/s/w`… | бесшовный верх |
| pit / abyss | `tile_pit_00` | `#121018` |
| iron grate | `tile_grate_00` | dungeon accent |

**Seam:** соседние тайлы без яркой линии; extrude 1 px в атласе. Без «милой» травы.

## Props
| Asset | Canvas | Frames |
|---|---|---|
| `prop_chest_closed` / `open` | 32×32 | 1 + open anim 3 |
| `prop_torch` | 32×48 | 4 loop, `#B8923A` + `#8B1E1E` |
| `prop_bones_01` | 32×32 | 1 |
| `prop_barrel` | 32×32 | 1 |

## UI
`ui_btn_play_normal/pressed/disabled` · `ui_btn_claim_*` · `ui_panel` · `ui_heart` · `ui_mana`  
CTA = `#B8923A`, danger = `#8B1E1E`, panel = `#0E0C12`.

## VFX
| Key | Frames | Цвет |
|---|---|---|
| `fx_hit` | 4 | crimson |
| `fx_blood` | 4 | crimson |
| `fx_loot` | 4 | cursed gold |
| `fx_cast` | 6 | arcane purple |

## Naming
`subject_state_direction_frame` · lower case · zero-pad 2 · English only  
Пример: `hero_walk_down_00.png`

## Phaser import
- Texture atlas JSON Hash (TexturePacker / free-tex-packer)
- `magFilter/minFilter: NEAREST`
- Animations создаются один раз в `PreloadScene` / `Boot`
- Pool для `enemy_skel`, `fx_*`

## Shot list — вертикальный срез (P0)
1. `hero_idle` 4к + `hero_walk_down` 6к  
2. `tile_ash` ×4 + `tile_wall` + edge  
3. `enemy_skel_idle` + `walk` + `death`  
4. `prop_chest` closed/open  
5. `ui_btn_play` normal/pressed  
6. `fx_hit` + `fx_loot`  

P1 после: остальные направления героя, attack/cast, torch, полный wall blob, UI hearts/mana.
