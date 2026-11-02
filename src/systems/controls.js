/**
 * Local two-player keys. The match will import this same map later
 * so select and the fight do not invent two different layouts.
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

export const PLAYER_STYLE = {
  p1: { label: 'PLAYER 1', color: '#ff4fa8', tint: 0xff4fa8 },
  p2: { label: 'PLAYER 2', color: '#ff9a1a', tint: 0xff9a1a },
};
