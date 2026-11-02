/**
 * Local two-player keys. Select and the match share this map
 * so they do not invent two different layouts.
 *
 * Names are Phaser key names: A, LEFT, ENTER, BACKSPACE.
 */
export const SELECT_KEYS = {
  p1: {
    left: 'A',
    right: 'D',
    up: 'W',
    down: 'S',
    confirm: 'F',
    cancel: 'G',
  },
  p2: {
    left: 'LEFT',
    right: 'RIGHT',
    up: 'UP',
    down: 'DOWN',
    confirm: 'ENTER',
    cancel: 'BACKSPACE',
  },
};

/**
 * Match keys. Movement matches character select.
 * Player 1 attacks with the left hand. Player 2 attacks with the keys
 * just left of the arrows, so two people can share one keyboard.
 */
export const FIGHT_KEYS = {
  p1: {
    left: 'A',
    right: 'D',
    up: 'W',
    down: 'S',
    punch: 'F',
    kick: 'G',
    special: 'H',
  },
  p2: {
    left: 'LEFT',
    right: 'RIGHT',
    up: 'UP',
    down: 'DOWN',
    punch: 'K',
    kick: 'L',
    special: 'SEMICOLON',
  },
};

export const PLAYER_STYLE = {
  p1: { label: 'PLAYER 1', color: '#ff4fa8', tint: 0xff4fa8 },
  p2: { label: 'PLAYER 2', color: '#ff9a1a', tint: 0xff9a1a },
};
