import Phaser from '../phaser.js';
import { PadReader, padSnapshot } from '../systems/gamepad.js';

const VIEW_WIDTH = 1920;
const VIEW_HEIGHT = 1080;
const BAR_HEIGHT = 150;
const COLUMN_X = { p1: 24, p2: 984 };

// Standard gamepad layout names, with PlayStation labels where they apply.
const BUTTON_NAMES = {
  0: 'X', 1: 'O', 2: 'SQ', 3: 'TRI',
  4: 'L1', 5: 'R1', 6: 'L2', 7: 'R2',
  8: 'SHARE', 9: 'START', 10: 'L3', 11: 'R3',
  12: 'UP', 13: 'DOWN', 14: 'LEFT', 15: 'RIGHT', 16: 'PS',
};

const ACTIONS = [
  'left', 'right', 'up', 'down',
  'confirm', 'cancel', 'punch', 'kick', 'special', 'block', 'start',
];

const TEXT_STYLE = {
  fontFamily: 'ui-monospace, Menlo, monospace',
  fontSize: '24px',
  color: '#e8ffe8',
  lineSpacing: 6,
};

/**
 * Bottom-of-screen readout of live controller input. Runs alongside the game
 * and reads its own copy of the controller state, so it never changes play.
 * Enabled with ?debug=pad in the URL. BootScene launches it.
 */
export default class PadDebugScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PadDebug' });
  }

  create() {
    this.readers = {
      p1: new PadReader(this, 'p1'),
      p2: new PadReader(this, 'p2'),
    };

    const top = VIEW_HEIGHT - BAR_HEIGHT;
    this.add
      .rectangle(0, top, VIEW_WIDTH, BAR_HEIGHT, 0x000000, 0.78)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(1000);

    this.lines = {
      p1: this.add.text(COLUMN_X.p1, top + 16, '', TEXT_STYLE).setScrollFactor(0).setDepth(1001),
      p2: this.add.text(COLUMN_X.p2, top + 16, '', TEXT_STYLE).setScrollFactor(0).setDepth(1001),
    };
  }

  update() {
    for (const id of ['p1', 'p2']) {
      const reader = this.readers[id];
      reader.poll();
      this.lines[id].setText(this.describe(id, reader));
    }
  }

  describe(id, reader) {
    const label = id === 'p1' ? 'P1' : 'P2';
    const pad = reader.pad();
    if (!pad) {
      return `${label}  no controller\nConnect one and press any button.`;
    }

    const snap = padSnapshot(pad);
    const buttons = snap.pressed.map((i) => BUTTON_NAMES[i] || `#${i}`).join(' ') || '-';
    const actions = ACTIONS.filter((action) => reader.held(action)).join(' ') || '-';
    return [
      `${label}  ${snap.id}`,
      `stick   x ${snap.stick.x.toFixed(2)}   y ${snap.stick.y.toFixed(2)}`,
      `buttons ${buttons}`,
      `actions ${actions}`,
    ].join('\n');
  }
}
