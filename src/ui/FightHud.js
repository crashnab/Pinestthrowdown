const VIEW_WIDTH = 1920;

/**
 * Health, names, portraits, the clock, and the FIGHT / win banner.
 * Everything here is pinned to the camera, so the stage can scroll
 * underneath it.
 */
export default class FightHud {
  constructor(scene, p1, p2) {
    this.scene = scene;
    this.bars = {
      p1: this.createBar(p1, 'left'),
      p2: this.createBar(p2, 'right'),
    };

    this.timer = scene.add
      .text(VIEW_WIDTH / 2, 58, '60', {
        fontFamily: 'Impact, "Arial Black", sans-serif',
        fontSize: '72px',
        color: '#ffb000',
        stroke: '#1a1208',
        strokeThickness: 8,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(30);

    this.banner = scene.add
      .image(VIEW_WIDTH / 2, 470, 'fight-text')
      .setScrollFactor(0)
      .setDepth(40)
      .setVisible(false);

    this.caption = scene.add
      .text(VIEW_WIDTH / 2, 680, '', {
        fontFamily: 'Impact, "Arial Black", sans-serif',
        fontSize: '42px',
        color: '#ffffff',
        stroke: '#1a1208',
        strokeThickness: 6,
        align: 'center',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(40)
      .setVisible(false);
  }

  createBar(definition, side) {
    const scene = this.scene;
    const photoKey = side === 'left' ? `${definition.id}-hud-left` : `${definition.id}-hud-right`;
    const photoX = side === 'left' ? 28 : VIEW_WIDTH - 28;
    const photo = scene.add
      .image(photoX, 28, photoKey)
      .setOrigin(side === 'left' ? 0 : 1, 0)
      .setScrollFactor(0)
      .setDepth(30);

    const barX = side === 'left' ? 176 : VIEW_WIDTH - 176;
    const name = scene.add
      .image(barX, 30, `${definition.id}-hud-name`)
      .setOrigin(side === 'left' ? 0 : 1, 0)
      .setScrollFactor(0)
      .setDepth(30);

    const bg = scene.add
      .image(barX, 96, 'health-bg')
      .setOrigin(side === 'left' ? 0 : 1, 0.5)
      .setScrollFactor(0)
      .setDepth(30);

    const fill = scene.add
      .image(bg.x + (side === 'left' ? 5 : -5), bg.y, 'health-fill')
      .setOrigin(side === 'left' ? 0 : 1, 0.5)
      .setScrollFactor(0)
      .setDepth(31);

    return {
      photo,
      name,
      bg,
      fill,
      side,
      fullWidth: fill.width,
      fullHeight: fill.height,
    };
  }

  setHealth(id, percent) {
    const bar = this.bars[id];
    const amount = Math.max(0, Math.min(1, percent));
    const width = bar.fullWidth * amount;
    if (bar.side === 'left') {
      bar.fill.setCrop(0, 0, width, bar.fullHeight);
    } else {
      bar.fill.setCrop(bar.fullWidth - width, 0, width, bar.fullHeight);
    }
  }

  setTime(seconds) {
    const shown = Math.min(60, Math.max(0, Math.ceil(seconds)));
    this.timer.setText(String(shown));
  }

  showFight() {
    this.banner.setTexture('fight-text').setVisible(true);
    this.caption.setVisible(false);
  }

  showResult(round, winnerId) {
    this.banner.setVisible(false);
    if (round.winner === 'draw') {
      this.caption.setText('TIME UP\nDRAW').setVisible(true);
      return;
    }

    const winKey = `win-${winnerId}`;
    if (this.scene.textures.exists(winKey)) {
      this.banner.setTexture(winKey).setVisible(true);
    }
    const line = round.reason === 'time' ? 'TIME UP' : 'K.O.';
    this.caption.setText(`${line}\nPRESS START`).setVisible(true);
  }

  hideIntro() {
    this.banner.setVisible(false);
  }
}
