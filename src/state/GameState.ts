export interface GameStateSnapshot {
  gold: number;
  hp: number;
  maxHp: number;
  chestsOpened: number;
}

const DEFAULT: GameStateSnapshot = {
  gold: 0,
  hp: 100,
  maxHp: 100,
  chestsOpened: 0,
};

/** Mutable runtime game state (singleton). */
class GameStateImpl {
  gold = DEFAULT.gold;
  hp = DEFAULT.hp;
  maxHp = DEFAULT.maxHp;
  chestsOpened = DEFAULT.chestsOpened;

  reset(): void {
    this.gold = DEFAULT.gold;
    this.hp = DEFAULT.hp;
    this.maxHp = DEFAULT.maxHp;
    this.chestsOpened = DEFAULT.chestsOpened;
  }

  apply(snapshot: GameStateSnapshot): void {
    this.gold = snapshot.gold;
    this.hp = snapshot.hp;
    this.maxHp = snapshot.maxHp;
    this.chestsOpened = snapshot.chestsOpened;
  }

  snapshot(): GameStateSnapshot {
    return {
      gold: this.gold,
      hp: this.hp,
      maxHp: this.maxHp,
      chestsOpened: this.chestsOpened,
    };
  }

  addGold(amount: number): void {
    this.gold = Math.max(0, this.gold + amount);
  }

  takeDamage(amount: number): boolean {
    this.hp = Math.max(0, this.hp - amount);
    return this.hp <= 0;
  }

  heal(amount: number): void {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }
}

export const GameState = new GameStateImpl();
