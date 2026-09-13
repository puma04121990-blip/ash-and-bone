import Phaser from 'phaser';
import { t } from '../i18n';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    const { width, height } = this.scale;
    const barW = Math.min(280, width * 0.6);
    const barH = 12;
    const cx = width / 2;
    const cy = height / 2;

    const label = this.add
      .text(cx, cy - 28, t('menu.loading'), {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#D8D2C8',
      })
      .setOrigin(0.5);

    const track = this.add.rectangle(cx, cy, barW, barH, 0x0e0c12).setStrokeStyle(1, 0xb8923a);
    const fill = this.add.rectangle(cx - barW / 2 + 2, cy, 4, barH - 4, 0x8b1e1e).setOrigin(0, 0.5);

    this.load.on('progress', (value: number) => {
      fill.width = Math.max(4, (barW - 4) * value);
      label.setText(t('menu.loading'));
    });

    this.load.on('complete', () => {
      track.destroy();
      fill.destroy();
      label.destroy();
    });

    this.load.image('floor_ash', 'assets/floor_ash.png');
    this.load.image('wall', 'assets/wall.png');
    this.load.image('hero', 'assets/hero.png');
    this.load.image('hero_idle2', 'assets/hero_idle2.png');
    this.load.image('skeleton', 'assets/skeleton.png');
    this.load.image('chest', 'assets/chest.png');
    this.load.image('btn_play', 'assets/btn_play.png');
    this.load.image('particle_hit', 'assets/particle_hit.png');
    this.load.image('coin', 'assets/coin.png');
  }

  create(): void {
    if (!this.anims.exists('hero-idle')) {
      this.anims.create({
        key: 'hero-idle',
        frames: [{ key: 'hero' }, { key: 'hero_idle2' }],
        frameRate: 2,
        repeat: -1,
      });
    }
    this.scene.start('MenuScene');
  }
}
