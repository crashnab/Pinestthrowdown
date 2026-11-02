import Phaser from '../phaser.js';

const REQUIRED = ['title-bg', 'title-logo', 'title-press-start'];

// Placed to match the title mockup: logo over the street, prompt in the fog.
const LOGO = { x: 960, y: 470 };
const PRESS_START = { x: 960, y: 860 };

/**
 * Title screen. Press Start blinks until Enter, Space, or a click.
 * When the Select scene exists, that input opens it.
 */
export default class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Title' });
  }

  create() {
    document.documentElement.dataset.scene = 'title';
    document.documentElement.dataset.title = 'ready';
    this.started = false;

    const missing = REQUIRED.filter((key) => !this.textures.exists(key));
    if (missing.length > 0) {
      const message = `Title art is missing: ${missing.join(', ')}`;
      console.error(message);
      document.documentElement.dataset.title = 'error';
      this.add
        .text(this.scale.width / 2, this.scale.height / 2, message, {
          fontFamily: 'system-ui, sans-serif',
          fontSize: '32px',
          color: '#ff5555',
          align: 'center',
          wordWrap: { width: this.scale.width - 120 },
        })
        .setOrigin(0.5);
      return;
    }

    this.add.image(this.scale.width / 2, this.scale.height / 2, 'title-bg');
    this.add.image(LOGO.x, LOGO.y, 'title-logo');
    this.pressStartImage = this.add.image(PRESS_START.x, PRESS_START.y, 'title-press-start');

    this.blink = this.tweens.add({
      targets: this.pressStartImage,
      alpha: { from: 1, to: 0.2 },
      duration: 450,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.bindStartInput();
  }

  bindStartInput() {
    const start = () => this.onPressStart();

    if (!this.input.keyboard) {
      console.error('Keyboard input is off, so Enter and Space cannot start the game.');
    } else {
      this.input.keyboard.addCapture(['SPACE', 'ENTER']);
      this.input.keyboard.once('keydown-ENTER', start);
      this.input.keyboard.once('keydown-SPACE', start);
    }

    this.input.once('pointerdown', start);
  }

  onPressStart() {
    if (this.started) {
      return;
    }

    this.started = true;
    this.blink.stop();
    this.pressStartImage.setAlpha(1);
    document.documentElement.dataset.title = 'start-pressed';

    if (this.scene.manager.keys.Select) {
      this.scene.start('Select');
      return;
    }

    console.info('Press Start received. Character select is the next scene.');
  }
}
