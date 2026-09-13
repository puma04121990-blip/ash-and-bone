import Phaser from 'phaser';

const UI_TEXT = '#D8D2C8';
const UI_PANEL = '#0E0C12';

export function createHudText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  content: string,
  fontSize = 14,
): Phaser.GameObjects.Text {
  return scene.add
    .text(x, y, content, {
      fontFamily: 'monospace',
      fontSize: `${fontSize}px`,
      color: UI_TEXT,
      backgroundColor: UI_PANEL,
      padding: { x: 6, y: 4 },
    })
    .setScrollFactor(0)
    .setDepth(1000);
}
