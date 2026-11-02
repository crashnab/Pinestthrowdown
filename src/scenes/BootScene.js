import Phaser from '../phaser.js';

const VIEW_WIDTH = 1920;
const VIEW_HEIGHT = 1080;

/**
 * Checks the canvas size, then hands off to Preload.
 * Art is not loaded here. If the size is wrong, the game stops on this scene.
 */
export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Boot' });
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;
    const sizeOk = width === VIEW_WIDTH && height === VIEW_HEIGHT;

    document.documentElement.dataset.boot = sizeOk ? 'ok' : 'size-mismatch';
    document.documentElement.dataset.gameWidth = String(width);
    document.documentElement.dataset.gameHeight = String(height);
    document.documentElement.dataset.scene = 'boot';

    if (!sizeOk) {
      const message = `Expected a ${VIEW_WIDTH}×${VIEW_HEIGHT} game, but this scene is ${width}×${height}.`;
      console.error(message);
      this.add
        .text(width / 2, height / 2, message, {
          fontFamily: 'system-ui, sans-serif',
          fontSize: '32px',
          color: '#ff5555',
          align: 'center',
          wordWrap: { width: Math.max(200, width - 80) },
        })
        .setOrigin(0.5);
      return;
    }

    console.info(`BootScene ready (${width}×${height}).`);
    this.scene.start('Preload');
  }
}
