export type Locale = 'ru' | 'en';

type Dict = Record<string, string>;

const ru: Dict = {
  'menu.title': 'Пепел и Кость',
  'menu.subtitle': 'Тёмный пиксельный RPG',
  'menu.play': 'Играть',
  'menu.loading': 'Загрузка…',
  'play.gold': 'Золото',
  'play.hp': 'Жизнь',
  'play.paused': 'Пауза',
  'play.dead': 'Вы пали… Нажмите, чтобы в меню',
  'play.hint': 'WASD / стрелки · касание — идти',
  'play.chest': '+{n} золота',
};

const en: Dict = {
  'menu.title': 'Ash & Bone',
  'menu.subtitle': 'Dark pixel RPG',
  'menu.play': 'Play',
  'menu.loading': 'Loading…',
  'play.gold': 'Gold',
  'play.hp': 'Life',
  'play.paused': 'Paused',
  'play.dead': 'You have fallen… Tap to menu',
  'play.hint': 'WASD / arrows · touch to move',
  'play.chest': '+{n} gold',
};

const catalogs: Record<Locale, Dict> = { ru, en };

let locale: Locale = 'ru';

export function setLocale(next: Locale): void {
  locale = next;
}

export function getLocale(): Locale {
  return locale;
}

export function t(key: string, vars?: Record<string, string | number>): string {
  const dict = catalogs[locale] ?? catalogs.ru;
  let s = dict[key] ?? catalogs.en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replace(`{${k}}`, String(v));
    }
  }
  return s;
}
