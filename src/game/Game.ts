import Phaser from 'phaser';
import { BootScene } from './BootScene';
import { PreloadScene } from './PreloadScene';
import { MenuScene } from './MenuScene';
import { PlayScene } from './PlayScene';
import { bindPauseOnVisibility } from '../platform/pause';
import { AudioBus } from '../audio/AudioBus';
import { loadGameState } from '../platform/saves';
import { GameState } from '../state/GameState';

export async function createGame(parent: string | HTMLElement): Promise<Phaser.Game> {
  const saved = await loadGameState();
  if (saved) {
    GameState.apply(saved);
  }

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent,
    width: 640,
    height: 480,
    backgroundColor: '#121018',
    pixelArt: true,
    roundPixels: true,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [BootScene, PreloadScene, MenuScene, PlayScene],
  };

  const game = new Phaser.Game(config);
  bindPauseOnVisibility(game);
  AudioBus.bindUnlock();
  return game;
}
