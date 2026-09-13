import Phaser from 'phaser';
import { t, setLocale, getLocale } from '../i18n';
import { AudioBus } from '../audio/AudioBus';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#121018');

    // subtle vignette panels
    this.add.rectangle(width / 2, height / 2, width, height, 0x121018);
    this.add.rectangle(width / 2, height / 2, width * 0.72, height * 0.62, 0x0e0c12, 0.92)
      .setStrokeStyle(2, 0xb8923a);

    this.add
      .text(width / 2, height * 0.28, t('menu.title'), {
        fontFamily: 'monospace',
        fontSize: '28px',
        color: '#C9B89A',
        stroke: '#8B1E1E',
        strokeThickness: 2,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.36, t('menu.subtitle'), {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#6E6558',
      })
      .setOrigin(0.5);

    const playBtn = this.add
      .image(width / 2, height * 0.55, 'btn_play')
      .setInteractive({ useHandCursor: true })
      .setScale(1.1);

    const playLabel = this.add
      .text(width / 2 + 18, height * 0.55, t('menu.play'), {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#D8D2C8',
      })
      .setOrigin(0.5);

    const start = (): void => {
      AudioBus.uiClick();
      this.scene.start('PlayScene');
    };

    playBtn.on('pointerover', () => {
      playBtn.setTint(0xffcccc);
    });
    playBtn.on('pointerout', () => {
      playBtn.clearTint();
    });
    playBtn.on('pointerdown', start);
    playLabel.setInteractive({ useHandCursor: true }).on('pointerdown', start);

    // locale toggle
    const locLabel = this.add
      .text(width / 2, height * 0.72, getLocale() === 'ru' ? 'RU | en' : 'ru | EN', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#6B2D8B',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    locLabel.on('pointerdown', () => {
      AudioBus.uiClick();
      setLocale(getLocale() === 'ru' ? 'en' : 'ru');
      this.scene.restart();
    });
  }
}
