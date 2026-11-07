/**
 * Gamepad input, read alongside the keyboard.
 *
 * Player 1 uses the first connected controller and Player 2 uses the second.
 * Button numbers follow the browser's standard gamepad layout, which is how
 * PlayStation controllers report over Bluetooth in Chrome, Edge, and Safari.
 *
 *   Left stick or D-pad  move (up jumps, down crouches)
 *   Cross (X)            confirm / punch
 *   Circle               cancel / back
 *   Square               kick
 *   Triangle             special
 *   L1 or L2             block (held)
 *   Start (Options)      continue / after the win card
 *
 * Each scene creates one PadReader per player and calls poll() once per
 * frame. held() reads the current state and tapped() reports a press that
 * happened since the last poll, matching how Phaser's JustDown behaves.
 */

const BUTTON = {
  cross: 0,
  circle: 1,
  square: 2,
  triangle: 3,
  l1: 4,
  l2: 6,
  start: 9,
  dUp: 12,
  dDown: 13,
  dLeft: 14,
  dRight: 15,
};

const STICK_DEADZONE = 0.5;

const SLOT_INDEX = { p1: 0, p2: 1 };

function readRaw(pad) {
  const stick = pad.leftStick || { x: 0, y: 0 };
  const down = (index) => pad.isButtonDown(index);
  return {
    left: down(BUTTON.dLeft) || stick.x < -STICK_DEADZONE,
    right: down(BUTTON.dRight) || stick.x > STICK_DEADZONE,
    up: down(BUTTON.dUp) || stick.y < -STICK_DEADZONE,
    down: down(BUTTON.dDown) || stick.y > STICK_DEADZONE,
    confirm: down(BUTTON.cross),
    cancel: down(BUTTON.circle),
    punch: down(BUTTON.cross),
    kick: down(BUTTON.square),
    special: down(BUTTON.triangle),
    block: down(BUTTON.l1) || down(BUTTON.l2),
    start: down(BUTTON.start),
  };
}

const EMPTY = {
  left: false, right: false, up: false, down: false,
  confirm: false, cancel: false, punch: false, kick: false,
  special: false, block: false, start: false,
};

/**
 * Raw view of one controller for the debug overlay: the stick position and
 * the index of every pressed button, before any mapping to actions.
 */
export function padSnapshot(pad) {
  const stick = pad.leftStick || { x: 0, y: 0 };
  const pressed = [];
  const buttons = pad.buttons || [];
  for (let i = 0; i < buttons.length; i += 1) {
    if (buttons[i] && buttons[i].pressed) {
      pressed.push(i);
    }
  }
  return { id: pad.id, stick, pressed };
}

export class PadReader {
  constructor(scene, slot) {
    this.scene = scene;
    this.slot = slot;
    this.current = EMPTY;
    this.previous = EMPTY;
  }

  pad() {
    const gamepad = this.scene.input.gamepad;
    if (!gamepad) {
      return null;
    }
    return gamepad.getPad(SLOT_INDEX[this.slot]) || null;
  }

  /** Call once per frame before reading held() or tapped(). */
  poll() {
    this.previous = this.current;
    const pad = this.pad();
    this.current = pad ? readRaw(pad) : EMPTY;
  }

  held(action) {
    return Boolean(this.current[action]);
  }

  tapped(action) {
    return Boolean(this.current[action]) && !this.previous[action];
  }
}
