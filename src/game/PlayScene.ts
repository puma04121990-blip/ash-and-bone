import Phaser from 'phaser';
import { t } from '../i18n';
import { GameState } from '../state/GameState';
import { saveGameState } from '../platform/saves';
import { AudioBus } from '../audio/AudioBus';
import { createHudText } from '../ui/HudText';

const TILE = 32;
const MAP_W = 20;
const MAP_H = 15;
const HERO_SPEED = 140;
const ENEMY_SPEED = 55;
const CONTACT_DAMAGE = 18;
const INVULN_MS = 700;
const CHEST_GOLD = 25;

type DirKeys = {
  up: Phaser.Input.Keyboard.Key;
  down: Phaser.Input.Keyboard.Key;
  left: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
  w: Phaser.Input.Keyboard.Key;
  a: Phaser.Input.Keyboard.Key;
  s: Phaser.Input.Keyboard.Key;
  d: Phaser.Input.Keyboard.Key;
};

export class PlayScene extends Phaser.Scene {
  private hero!: Phaser.Physics.Arcade.Sprite;
  private enemy!: Phaser.Physics.Arcade.Sprite;
  private chest!: Phaser.Physics.Arcade.Sprite;
  private walls!: Phaser.Physics.Arcade.StaticGroup;
  private cursors!: DirKeys;
  private goldText!: Phaser.GameObjects.Text;
  private hpText!: Phaser.GameObjects.Text;
  private pointerTarget: Phaser.Math.Vector2 | null = null;
  private invulnUntil = 0;
  private dead = false;
  private chestOpened = false;
  private flashRect!: Phaser.GameObjects.Rectangle;
  private hitEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor() {
    super({ key: 'PlayScene' });
  }

  create(): void {
    this.dead = false;
    this.chestOpened = false;
    this.invulnUntil = 0;
    this.pointerTarget = null;

    if (GameState.hp <= 0) {
      GameState.hp = GameState.maxHp;
    }

    this.cameras.main.setBackgroundColor('#121018');
    this.physics.world.setBounds(0, 0, MAP_W * TILE, MAP_H * TILE);

    this.walls = this.physics.add.staticGroup();
    this.buildFloor();
    this.placeBorderWalls();
    this.placePillars();

    this.hero = this.physics.add.sprite(TILE * 3 + 16, TILE * 7 + 16, 'hero');
    this.hero.setCollideWorldBounds(true);
    this.hero.setDepth(10);
    this.hero.setSize(28, 40);
    this.hero.setOffset(18, 16);
    this.hero.play('hero-idle');

    this.enemy = this.physics.add.sprite(TILE * 16 + 16, TILE * 7 + 16, 'skeleton');
    this.enemy.setCollideWorldBounds(true);
    this.enemy.setDepth(9);
    this.enemy.setSize(24, 32);
    this.enemy.setOffset(12, 12);

    this.chest = this.physics.add.staticSprite(TILE * 10 + 16, TILE * 4 + 16, 'chest');
    this.chest.setDepth(5);

    this.physics.add.collider(this.hero, this.walls);
    this.physics.add.collider(this.enemy, this.walls);

    this.physics.add.overlap(this.hero, this.enemy, () => this.onEnemyContact());
    this.physics.add.overlap(this.hero, this.chest, () => this.onChest());

    this.cameras.main.setBounds(0, 0, MAP_W * TILE, MAP_H * TILE);
    this.cameras.main.startFollow(this.hero, true, 0.12, 0.12);

    this.flashRect = this.add
      .rectangle(0, 0, this.scale.width * 2, this.scale.height * 2, 0x8b1e1e, 0)
      .setScrollFactor(0)
      .setDepth(2000)
      .setOrigin(0);

    this.hitEmitter = this.add.particles(0, 0, 'particle_hit', {
      speed: { min: 40, max: 120 },
      lifespan: 280,
      quantity: 0,
      scale: { start: 1.2, end: 0 },
      emitting: false,
    });
    this.hitEmitter.setDepth(50);

    this.setupInput();
    this.setupHud();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.pointerTarget = null;
    });
  }

  private buildFloor(): void {
    for (let ty = 0; ty < MAP_H; ty++) {
      for (let tx = 0; tx < MAP_W; tx++) {
        const x = tx * TILE + TILE / 2;
        const y = ty * TILE + TILE / 2;
        this.add.image(x, y, 'floor_ash').setDepth(0);
      }
    }
  }

  private placePillars(): void {
    const pillars: Array<[number, number]> = [
      [6, 5],
      [6, 9],
      [13, 5],
      [13, 9],
      [10, 11],
    ];
    for (const [tx, ty] of pillars) {
      this.addWallTile(tx, ty);
    }
  }

  private placeBorderWalls(): void {
    for (let tx = 0; tx < MAP_W; tx++) {
      this.addWallTile(tx, 0);
      this.addWallTile(tx, MAP_H - 1);
    }
    for (let ty = 1; ty < MAP_H - 1; ty++) {
      this.addWallTile(0, ty);
      this.addWallTile(MAP_W - 1, ty);
    }
  }

  private addWallTile(tx: number, ty: number): void {
    const wall = this.walls.create(
      tx * TILE + TILE / 2,
      ty * TILE + TILE / 2,
      'wall',
    ) as Phaser.Physics.Arcade.Sprite;
    wall.setDepth(2);
    wall.refreshBody();
  }

  private setupInput(): void {
    if (!this.input.keyboard) {
      throw new Error('Keyboard plugin required');
    }
    const kb = this.input.keyboard;
    this.cursors = {
      up: kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      down: kb.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      left: kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      w: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      a: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      s: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      d: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.dead) {
        AudioBus.uiClick();
        this.scene.start('MenuScene');
        return;
      }
      this.pointerTarget = new Phaser.Math.Vector2(pointer.worldX, pointer.worldY);
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown && this.pointerTarget && !this.dead) {
        this.pointerTarget.set(pointer.worldX, pointer.worldY);
      }
    });

    this.input.on('pointerup', () => {
      this.pointerTarget = null;
    });
  }

  private setupHud(): void {
    this.goldText = createHudText(this, 12, 10, '');
    this.hpText = createHudText(this, 12, 36, '');
    createHudText(this, 12, this.scale.height - 28, t('play.hint'), 11);
    this.refreshHud();
  }

  private refreshHud(): void {
    this.goldText.setText(`${t('play.gold')}: ${GameState.gold}`);
    this.hpText.setText(`${t('play.hp')}: ${GameState.hp}/${GameState.maxHp}`);
  }

  private onEnemyContact(): void {
    if (this.dead) return;
    const now = this.time.now;
    if (now < this.invulnUntil) return;
    this.invulnUntil = now + INVULN_MS;

    const killed = GameState.takeDamage(CONTACT_DAMAGE);
    this.refreshHud();
    void saveGameState(GameState.snapshot());

    this.flashRect.setAlpha(0.55);
    this.tweens.add({
      targets: this.flashRect,
      alpha: 0,
      duration: 220,
      ease: 'Quad.easeOut',
    });

    this.hitEmitter.emitParticleAt(this.hero.x, this.hero.y, 8);
    this.hero.setTint(0xff4444);
    this.time.delayedCall(180, () => {
      if (!this.dead) this.hero.clearTint();
    });

    if (killed) {
      this.dead = true;
      this.hero.setVelocity(0, 0);
      this.enemy.setVelocity(0, 0);
      this.hero.setTint(0x441111);
      this.add
        .text(this.scale.width / 2, this.scale.height / 2, t('play.dead'), {
          fontFamily: 'monospace',
          fontSize: '16px',
          color: '#D8D2C8',
          backgroundColor: '#0E0C12',
          padding: { x: 10, y: 8 },
          align: 'center',
        })
        .setScrollFactor(0)
        .setOrigin(0.5)
        .setDepth(3000);
    }
  }

  private onChest(): void {
    if (this.chestOpened || this.dead) return;
    this.chestOpened = true;
    GameState.addGold(CHEST_GOLD);
    GameState.chestsOpened += 1;
    this.refreshHud();
    void saveGameState(GameState.snapshot());
    AudioBus.uiClick();

    this.chest.setTint(0x666666);
    const popup = this.add
      .text(this.chest.x, this.chest.y - 24, t('play.chest', { n: CHEST_GOLD }), {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#B8923A',
      })
      .setOrigin(0.5)
      .setDepth(100);
    this.tweens.add({
      targets: popup,
      y: popup.y - 30,
      alpha: 0,
      duration: 900,
      onComplete: () => popup.destroy(),
    });

    const coin = this.add.image(this.chest.x, this.chest.y, 'coin').setDepth(100);
    this.tweens.add({
      targets: coin,
      y: coin.y - 40,
      alpha: 0,
      duration: 700,
      onComplete: () => coin.destroy(),
    });
  }

  update(_time: number, _delta: number): void {
    if (this.dead) {
      this.hero.setVelocity(0, 0);
      this.enemy.setVelocity(0, 0);
      return;
    }

    this.moveHero();
    this.chaseHero();
  }

  private moveHero(): void {
    let vx = 0;
    let vy = 0;

    if (this.cursors.left.isDown || this.cursors.a.isDown) vx -= 1;
    if (this.cursors.right.isDown || this.cursors.d.isDown) vx += 1;
    if (this.cursors.up.isDown || this.cursors.w.isDown) vy -= 1;
    if (this.cursors.down.isDown || this.cursors.s.isDown) vy += 1;

    if (vx !== 0 || vy !== 0) {
      this.pointerTarget = null;
      const len = Math.hypot(vx, vy) || 1;
      this.hero.setVelocity((vx / len) * HERO_SPEED, (vy / len) * HERO_SPEED);
      if (vx !== 0) this.hero.setFlipX(vx < 0);
      return;
    }

    if (this.pointerTarget) {
      const dx = this.pointerTarget.x - this.hero.x;
      const dy = this.pointerTarget.y - this.hero.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 8) {
        this.hero.setVelocity(0, 0);
        this.pointerTarget = null;
      } else {
        this.hero.setVelocity((dx / dist) * HERO_SPEED, (dy / dist) * HERO_SPEED);
        if (Math.abs(dx) > 2) this.hero.setFlipX(dx < 0);
      }
      return;
    }

    this.hero.setVelocity(0, 0);
  }

  private chaseHero(): void {
    const dx = this.hero.x - this.enemy.x;
    const dy = this.hero.y - this.enemy.y;
    const dist = Math.hypot(dx, dy) || 1;
    this.enemy.setVelocity((dx / dist) * ENEMY_SPEED, (dy / dist) * ENEMY_SPEED);
    if (Math.abs(dx) > 2) this.enemy.setFlipX(dx > 0);
  }
}
