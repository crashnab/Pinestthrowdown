import Phaser from '../phaser.js';
import { LEVELS, LEVEL_HEADER, levelSelectAssets } from '../data/levels.js';
import { SELECT_KEYS } from '../systems/controls.js';
import { PadReader } from '../systems/gamepad.js';

const VIEW_WIDTH = 1920;
// Placed to match the level mockup: title above the row, names just under the pictures.
const HEADER_Y = 224;
const THUMB_Y = 565;
const THUMB_GAP = 40;
const NAME_GAP = 41;
const SIDE_MARGIN = 80;
const HINT_Y = 1048;
const HINT = 'P1  A D MOVE   F READY   G BACK';

/**
 * Player 1 picks the stage after both fighters are locked.
 * Left and right move across the three levels. The highlighted
 * thumbnail uses its yellow-outline picture. F starts the match.
 * Player 2's keys do nothing on this screen.
 */
export default class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelSelect' });
  }

  init(data) {
    const payload = data && typeof data === 'object' ? data : {};
    this.p1Id = payload.p1 || this.registry.get('p1Fighter') || '';
    this.p2Id = payload.p2 || this.registry.get('p2Fighter') || '';
    this.index = 0;
    this.failed = [];
  }

  preload() {
    document.documentElement.dataset.scene = 'level';
    const missing = levelSelectAssets().filter((asset) => !this.textures.exists(asset.key));
    if (missing.length === 0) {
      return;
    }

    const onError = (file) => {
      const label = `${file.key} (${file.url})`;
      this.failed.push(label);
      console.error(`Could not load ${label}`);
    };
    this.load.on('loaderror', onError);
    this.load.once('complete', () => {
      this.load.off('loaderror', onError);
    });

    for (const asset of missing) {
      this.load.image(asset.key, asset.url);
    }
  }

  create() {
    document.documentElement.dataset.scene = 'level';

    const required = ['select-bg', ...levelSelectAssets().map((asset) => asset.key)];
    const missing = required.filter((key) => !this.textures.exists(key));
    if (this.failed.length > 0 || missing.length > 0) {
      const detail = this.failed.length > 0
        ? `Could not load:\n${this.failed.join('\n')}`
        : `Level art is missing: ${missing.join(', ')}`;
      console.error(detail);
      document.documentElement.dataset.level = 'error';
      this.showMessage(detail);
      return;
    }

    this.add.image(this.scale.width / 2, this.scale.height / 2, 'select-bg').setDepth(0);
    this.add.image(VIEW_WIDTH / 2, HEADER_Y, LEVEL_HEADER.key).setDepth(6);

    this.slots = LEVELS.map((level) => ({
      level,
      thumb: this.add.image(0, 0, level.thumb).setDepth(4),
      name: this.add.image(0, 0, level.name).setDepth(5),
    }));
    this.layout();

    this.hint = this.add
      .text(VIEW_WIDTH / 2, HINT_Y, HINT, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '20px',
        color: '#d5dced',
      })
      .setOrigin(0.5)
      .setDepth(8);

    this.bindKeys();
    this.refresh();
  }

  layout() {
    const thumbs = this.slots.map((slot) => slot.thumb);
    const widths = thumbs.map((thumb) => thumb.displayWidth);
    const thumbHeight = Math.max(...thumbs.map((thumb) => thumb.displayHeight));
    const nameHeight = Math.max(...this.slots.map((slot) => slot.name.displayHeight));
    let gap = THUMB_GAP;
    let row = widths.reduce((sum, width) => sum + width, 0) + gap * (thumbs.length - 1);
    const maxRow = VIEW_WIDTH - SIDE_MARGIN * 2;
    if (row > maxRow) {
      gap = Math.max(16, Math.floor((maxRow - widths.reduce((sum, width) => sum + width, 0)) / (thumbs.length - 1)));
      row = widths.reduce((sum, width) => sum + width, 0) + gap * (thumbs.length - 1);
    }

    const nameY = THUMB_Y + thumbHeight / 2 + NAME_GAP + nameHeight / 2;
    let x = (VIEW_WIDTH - row) / 2;
    this.slots.forEach((slot, index) => {
      const center = x + widths[index] / 2;
      slot.thumb.setPosition(center, THUMB_Y);
      slot.name.setPosition(center, nameY);
      x += widths[index] + gap;
    });
  }

  bindKeys() {
    this.pad = new PadReader(this, 'p1');
    const keyboard = this.input.keyboard;
    if (!keyboard) {
      console.error('Keyboard input is off, so level select cannot be played.');
      document.documentElement.dataset.level = 'no-keyboard';
      return;
    }

    const keys = SELECT_KEYS.p1;
    keyboard.addCapture([keys.left, keys.right, keys.confirm, keys.cancel]);
    this.keys = {
      left: keyboard.addKey(keys.left),
      right: keyboard.addKey(keys.right),
      confirm: keyboard.addKey(keys.confirm),
      cancel: keyboard.addKey(keys.cancel),
    };
  }

  update() {
    if (!this.keys) {
      return;
    }

    this.pad.poll();
    const tapped = (key, action) => Phaser.Input.Keyboard.JustDown(key) || this.pad.tapped(action);

    if (tapped(this.keys.left, 'left')) {
      this.move(-1);
    }
    if (tapped(this.keys.right, 'right')) {
      this.move(1);
    }
    if (tapped(this.keys.confirm, 'confirm')) {
      this.confirm();
    }
    if (tapped(this.keys.cancel, 'cancel')) {
      this.scene.start('Select');
    }
  }

  move(direction) {
    const next = Phaser.Math.Clamp(this.index + direction, 0, LEVELS.length - 1);
    if (next === this.index) {
      return;
    }
    this.index = next;
    this.refresh();
  }

  confirm() {
    const level = LEVELS[this.index];
    this.registry.set('p1Fighter', this.p1Id);
    this.registry.set('p2Fighter', this.p2Id);
    this.registry.set('levelBackground', level.background);
    document.documentElement.dataset.level = 'ready';
    this.scene.start('Game', {
      p1: this.p1Id,
      p2: this.p2Id,
      background: level.background,
    });
  }

  refresh() {
    this.slots.forEach((slot, index) => {
      const key = index === this.index ? slot.level.thumbSelected : slot.level.thumb;
      if (slot.thumb.texture.key !== key) {
        slot.thumb.setTexture(key);
      }
    });
    this.publish();
  }

  publish() {
    const root = document.documentElement.dataset;
    const level = LEVELS[this.index];
    root.scene = 'level';
    root.level = level.id;
    root.background = level.background;
    root.p1 = this.p1Id;
    root.p2 = this.p2Id;
    root.thumbs = this.slots
      .map((slot) => (slot.thumb.texture.key.endsWith('-selected') ? 'selected' : 'default'))
      .join(',');
    root.levelSelect = 'choosing';
  }

  showMessage(message) {
    this.add
      .text(this.scale.width / 2, this.scale.height / 2, message, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '28px',
        color: '#ff6666',
        align: 'center',
        wordWrap: { width: this.scale.width - 120 },
      })
      .setOrigin(0.5);
  }
}
