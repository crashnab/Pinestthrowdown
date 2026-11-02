import BootScene from './scenes/BootScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import TitleScene from './scenes/TitleScene.js';
import SelectScene from './scenes/SelectScene.js';

export const GAME_WIDTH = 1920;
export const GAME_HEIGHT = 1080;

function getPhaser() {
  const Phaser = globalThis.Phaser;

  if (!Phaser) {
    throw new Error(
      'Phaser did not load. Confirm vendor/phaser-3.90.0.min.js is being served and that its script tag stays above the module in index.html.'
    );
  }

  return Phaser;
}

/**
 * One config object for the whole game. New scenes get added to `scene`.
 * Only the first scene runs on startup. Boot starts Preload, which starts Title.
 * Title starts Select.
 */
export function createGameConfig() {
  const Phaser = getPhaser();

  return {
    type: Phaser.AUTO,
    parent: 'game',
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#000000',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    // The mockups are illustrated art, not chunky pixels.
    render: {
      pixelArt: false,
      antialias: true,
    },
    // The match will use Arcade physics. Gravity stays off until a fighter jumps.
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false,
      },
    },
    scene: [BootScene, PreloadScene, TitleScene, SelectScene],
    banner: false,
  };
}

export function startGame() {
  const Phaser = getPhaser();
  const container = document.getElementById('game');

  if (!container) {
    throw new Error('index.html is missing the <div id="game"> container.');
  }

  return new Phaser.Game(createGameConfig());
}

startGame();
