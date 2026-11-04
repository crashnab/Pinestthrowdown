import Phaser from '../phaser.js';
import { ROSTER, rosterAssets, rosterIndex } from '../data/characters.js';
import { PLAYER_STYLE, SELECT_KEYS } from '../systems/controls.js';

const CELL_W = 190;
const CELL_H = 224;
// Half the space that used to show between thumbnail edges.
const GAP_X = 9;
const GAP_Y = 12;
const GRID_TOP = 348;
const VIEW_WIDTH = 1920;
const EDGE_PAD = 80;
const PORTRAIT_BOTTOM = 800;
const NAME_GAP = 80;

const DOWN_FROM_TOP = [4, 4, 5, 6];
const UP_FROM_BOTTOM = [0, 2, 3];

const HINT = 'P1  WASD MOVE   F READY   G BACK          P2  ARROWS MOVE   ENTER READY   BACKSPACE BACK';

/**
 * Two local cursors on the roster grid.
 * Player 1 starts on Easy E. Player 2 starts on RobGob.
 * Only fighters marked playable can be readied. When both are ready,
 * the Game scene opens if it exists.
 */
export default class SelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Select' });
  }

  create() {
    document.documentElement.dataset.scene = 'select';
    this.players = {
      p1: { id: 'p1', index: rosterIndex('easy-e'), locked: false },
      p2: { id: 'p2', index: rosterIndex('robgob'), locked: false },
    };

    const required = ['select-bg', 'select-title', ...rosterAssets().map((asset) => asset.key)];
    const missing = required.filter((key) => !this.textures.exists(key));
    if (missing.length > 0) {
      const message = `Select art is missing: ${missing.join(', ')}`;
      console.error(message);
      document.documentElement.dataset.select = 'error';
      this.add
        .text(this.scale.width / 2, this.scale.height / 2, message, {
          fontFamily: 'system-ui, sans-serif',
          fontSize: '28px',
          color: '#ff6666',
          align: 'center',
          wordWrap: { width: this.scale.width - 120 },
        })
        .setOrigin(0.5);
      return;
    }

    this.add.image(this.scale.width / 2, this.scale.height / 2, 'select-bg').setDepth(0);
    this.add.image(960, 156, 'select-title').setDepth(6);

    this.portraits = {
      p1: this.add
        .image(EDGE_PAD, PORTRAIT_BOTTOM, 'easy-e-portrait')
        .setOrigin(0, 1)
        .setFlipX(false)
        .setDepth(1),
      p2: this.add
        .image(VIEW_WIDTH - EDGE_PAD, PORTRAIT_BOTTOM, 'robgob-portrait')
        .setOrigin(1, 1)
        .setFlipX(true)
        .setDepth(1),
    };

    this.slots = this.createSlots();
    this.createNames();

    this.hint = this.add
      .text(960, 1048, HINT, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '20px',
        color: '#d5dced',
      })
      .setOrigin(0.5)
      .setDepth(8);

    this.bindKeys();
    this.refresh();
  }

  createSlots() {
    const slots = [];
    const rows = [4, 3];
    let index = 0;

    rows.forEach((count, row) => {
      const rowWidth = count * CELL_W + (count - 1) * GAP_X;
      const originX = (1920 - rowWidth) / 2;
      const y = GRID_TOP + CELL_H / 2 + row * (CELL_H + GAP_Y);

      for (let col = 0; col < count; col += 1) {
        const fighter = ROSTER[index];
        const x = originX + CELL_W / 2 + col * (CELL_W + GAP_X);
        const image = this.add.image(x, y, `${fighter.id}-thumb-default`).setDepth(4);
        slots.push({ x, y, fighter, image });
        index += 1;
      }
    });

    return slots;
  }

  createNames() {
    this.nameImages = {};
    this.subLabels = {};

    for (const id of ['p1', 'p2']) {
      this.nameImages[id] = this.add
        .image(0, 0, 'easy-e-name')
        .setOrigin(0.5, 0)
        .setFlipX(false)
        .setDepth(7);
      this.subLabels[id] = this.add
        .text(0, 0, PLAYER_STYLE[id].label, {
          fontFamily: 'Impact, "Arial Black", sans-serif',
          fontSize: '28px',
          color: PLAYER_STYLE[id].color,
        })
        .setOrigin(0.5, 0)
        .setDepth(7);
    }
  }

  bindKeys() {
    const keyboard = this.input.keyboard;
    if (!keyboard) {
      console.error('Keyboard input is off, so character select cannot be played.');
      document.documentElement.dataset.select = 'no-keyboard';
      return;
    }

    keyboard.addCapture(['UP', 'DOWN', 'LEFT', 'RIGHT', 'SPACE', 'ENTER', 'BACKSPACE']);
    this.keys = { p1: {}, p2: {} };

    for (const id of ['p1', 'p2']) {
      for (const action of Object.keys(SELECT_KEYS[id])) {
        this.keys[id][action] = keyboard.addKey(SELECT_KEYS[id][action]);
      }
    }
  }

  update() {
    if (!this.keys) {
      return;
    }

    for (const id of ['p1', 'p2']) {
      const player = this.players[id];
      const keys = this.keys[id];
      if (Phaser.Input.Keyboard.JustDown(keys.left)) this.move(player, -1, 0);
      if (Phaser.Input.Keyboard.JustDown(keys.right)) this.move(player, 1, 0);
      if (Phaser.Input.Keyboard.JustDown(keys.up)) this.move(player, 0, -1);
      if (Phaser.Input.Keyboard.JustDown(keys.down)) this.move(player, 0, 1);
      if (Phaser.Input.Keyboard.JustDown(keys.confirm)) this.confirm(player);
      if (Phaser.Input.Keyboard.JustDown(keys.cancel)) this.cancel(player);
    }
  }

  move(player, dx, dy) {
    if (player.locked) {
      return;
    }

    const next = stepCursor(player.index, dx, dy);
    if (next === player.index) {
      return;
    }

    player.index = next;
    this.refresh();
  }

  confirm(player) {
    if (player.locked) {
      return;
    }

    const fighter = ROSTER[player.index];
    if (!fighter.playable) {
      console.info(`${fighter.name} is on the roster, but is not in this demo yet.`);
      this.refresh();
      return;
    }

    player.locked = true;
    this.refresh();

    if (this.players.p1.locked && this.players.p2.locked) {
      this.finish();
    }
  }

  cancel(player) {
    if (!player.locked) {
      return;
    }

    player.locked = false;
    this.hint.setText(HINT);
    this.refresh();
  }

  refresh() {
    const p1Index = this.players.p1.index;
    const p2Index = this.players.p2.index;

    this.slots.forEach((slot, index) => {
      // Both cursors on one thumbnail use Player 1's tile.
      let state = 'default';
      if (index === p1Index) {
        state = 'p1';
      } else if (index === p2Index) {
        state = 'p2';
      }
      const key = `${slot.fighter.id}-thumb-${state}`;
      if (slot.image.texture.key !== key) {
        slot.image.setTexture(key);
      }
    });

    this.showSide('p1');
    this.showSide('p2');
    this.publish();
  }

  showSide(id) {
    const player = this.players[id];
    const fighter = ROSTER[player.index];
    const style = PLAYER_STYLE[id];
    const portrait = this.portraits[id];

    portrait.setTexture(`${fighter.id}-portrait`);
    portrait.setFlipX(id === 'p2');

    const nameImage = this.nameImages[id];
    nameImage.setTexture(`${fighter.id}-name`);
    nameImage.setFlipX(false);
    const half = portrait.displayWidth / 2;
    const centerX = id === 'p1' ? portrait.x + half : portrait.x - half;
    nameImage.setPosition(centerX, portrait.y + NAME_GAP);

    const sub = this.subLabels[id];
    sub.setPosition(centerX, nameImage.y + nameImage.displayHeight + 12);
    if (!fighter.playable) {
      sub.setText('NOT IN THIS DEMO');
      sub.setColor('#c5cede');
    } else if (player.locked) {
      sub.setText('READY');
      sub.setColor(style.color);
    } else {
      sub.setText(style.label);
      sub.setColor(style.color);
    }
  }

  publish() {
    const root = document.documentElement.dataset;
    const p1 = ROSTER[this.players.p1.index];
    const p2 = ROSTER[this.players.p2.index];
    root.scene = 'select';
    root.p1 = p1.id;
    root.p2 = p2.id;
    root.p1Locked = this.players.p1.locked ? 'yes' : 'no';
    root.p2Locked = this.players.p2.locked ? 'yes' : 'no';
    root.tiles = this.slots
      .map((slot) => slot.image.texture.key.replace(`${slot.fighter.id}-thumb-`, ''))
      .join(',');
    root.select = this.players.p1.locked && this.players.p2.locked ? 'ready' : 'choosing';

    this.registry.set('p1Fighter', this.players.p1.locked ? p1.id : '');
    this.registry.set('p2Fighter', this.players.p2.locked ? p2.id : '');
  }

  finish() {
    const p1 = ROSTER[this.players.p1.index].id;
    const p2 = ROSTER[this.players.p2.index].id;
    this.registry.set('p1Fighter', p1);
    this.registry.set('p2Fighter', p2);
    document.documentElement.dataset.select = 'ready';
    this.hint.setText('BOTH FIGHTERS READY');

    if (this.scene.manager.keys.Game) {
      this.scene.start('Game');
    } else {
      console.info(`Both fighters ready: ${p1} vs ${p2}. The match is the next scene.`);
    }
  }
}

function stepCursor(index, dx, dy) {
  const onTop = index < 4;
  const col = onTop ? index : index - 4;

  if (dx === -1) {
    return col === 0 ? index : index - 1;
  }
  if (dx === 1) {
    const last = onTop ? 3 : 6;
    return index === last ? index : index + 1;
  }
  if (dy === 1 && onTop) {
    return DOWN_FROM_TOP[col];
  }
  if (dy === -1 && !onTop) {
    return UP_FROM_BOTTOM[col];
  }
  return index;
}
