import Phaser from '../phaser.js';
import { preloadAssets, assertUniqueAssets } from '../data/assets.js';

const BAR_WIDTH = 720;
const BAR_HEIGHT = 18;

/**
 * Loads the title and character-select art, shows a progress bar, then
 * opens the title screen. A missing file stays on this scene with the file name.
 */
export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Preload' });
  }

  preload() {
    document.documentElement.dataset.scene = 'preload';
    this.failed = [];
    this.failMessage = '';

    let assets = [];
    try {
      assets = preloadAssets();
      assertUniqueAssets(assets, 'preload assets');
    } catch (error) {
      this.failMessage = error instanceof Error ? error.message : String(error);
      console.error(this.failMessage);
      return;
    }

    this.createBar();

    this.load.on('progress', (value) => {
      this.drawBar(value);
    });

    this.load.on('loaderror', (file) => {
      const label = `${file.key} (${file.url})`;
      this.failed.push(label);
      console.error(`Could not load ${label}`);
    });

    for (const asset of assets) {
      this.load.image(asset.key, asset.url);
    }
  }

  create() {
    if (this.failMessage || this.failed.length > 0) {
      this.children.removeAll(true);
      const detail = this.failMessage || `Could not load:\n${this.failed.join('\n')}`;
      document.documentElement.dataset.preload = 'error';
      this.showMessage(detail, '#ff6666');
      return;
    }

    document.documentElement.dataset.preload = 'ok';
    this.scene.start('Title');
  }

  createBar() {
    const { width, height } = this.scale;
    const x = (width - BAR_WIDTH) / 2;
    const y = height / 2;

    this.add
      .text(width / 2, y - 48, 'LOADING', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '32px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.add.rectangle(width / 2, y, BAR_WIDTH + 8, BAR_HEIGHT + 8, 0xffffff);
    this.add.rectangle(width / 2, y, BAR_WIDTH, BAR_HEIGHT, 0x141414);

    this.barFill = this.add.graphics();
    this.barX = x;
    this.barY = y - BAR_HEIGHT / 2;
    this.percent = this.add
      .text(width / 2, y + 40, '0%', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '24px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.drawBar(0);
  }

  drawBar(value) {
    const amount = Phaser.Math.Clamp(value, 0, 1);
    this.barFill.clear();
    this.barFill.fillStyle(0xff8a1a, 1);
    this.barFill.fillRect(this.barX, this.barY, BAR_WIDTH * amount, BAR_HEIGHT);
    if (this.percent) {
      this.percent.setText(`${Math.round(amount * 100)}%`);
    }
  }

  showMessage(message, color) {
    const { width, height } = this.scale;
    this.add
      .text(width / 2, height / 2, message, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '28px',
        color,
        align: 'center',
        wordWrap: { width: width - 120 },
      })
      .setOrigin(0.5);
  }
}
