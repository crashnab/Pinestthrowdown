const Phaser = globalThis.Phaser;

if (!Phaser) {
  throw new Error(
    'Phaser did not load. Confirm vendor/phaser-3.90.0.min.js is being served and that its script tag stays above the module in index.html.'
  );
}

export default Phaser;
