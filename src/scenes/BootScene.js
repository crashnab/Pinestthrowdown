const Phaser = globalThis.Phaser;

if (!Phaser) {
  throw new Error(
    'Phaser did not load. Confirm vendor/phaser-3.90.0.min.js is being served and that its script tag stays above the module in index.html.'
  );
}

const VIEW_WIDTH = 1920;
const VIEW_HEIGHT = 1080;

/**
 * First scene. It only proves the 1920×1080 canvas exists.
 * Later it will hand off to a Preload scene. It does not load art.
 */
export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Boot' });
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;
    const sizeOk = width === VIEW_WIDTH && height === VIEW_HEIGHT;

    // Readable from the page so a browser check can confirm boot without guessing.
    document.documentElement.dataset.boot = sizeOk ? 'ok' : 'size-mismatch';
    document.documentElement.dataset.gameWidth = String(width);
    document.documentElement.dataset.gameHeight = String(height);

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

    this.add.text(32, height - 48, 'BOOT OK', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '28px',
      color: '#9a9a9a',
    });
  }
}
