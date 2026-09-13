import { getGp } from './gp';
import type { GameStateSnapshot } from '../state/GameState';

const SAVE_KEY = 'gameState';

export async function loadGameState(): Promise<GameStateSnapshot | null> {
  const gp = getGp();
  await gp.player.load();
  const raw = gp.player.get(SAVE_KEY);
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as Record<string, unknown>;
  if (typeof s.gold !== 'number' || typeof s.hp !== 'number') return null;
  return {
    gold: s.gold,
    hp: s.hp,
    maxHp: typeof s.maxHp === 'number' ? s.maxHp : 100,
    chestsOpened: typeof s.chestsOpened === 'number' ? s.chestsOpened : 0,
  };
}

export async function saveGameState(snapshot: GameStateSnapshot): Promise<void> {
  const gp = getGp();
  gp.player.set(SAVE_KEY, snapshot);
  await gp.player.sync();
}
