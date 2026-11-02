/**
 * One round. Both fighters start at full health. The clock runs only
 * after the FIGHT banner. A fighter at 0 health loses. If the clock
 * hits 0 first, the higher health wins.
 */
export default class RoundManager {
  constructor({ seconds = 60, health = 100, intro = 1.15 } = {}) {
    this.seconds = seconds;
    this.maxHealth = health;
    this.timeLeft = seconds;
    this.health = { p1: health, p2: health };
    this.phase = 'intro';
    this.winner = null;
    this.reason = null;
    this.introLeft = intro;
  }

  tick(deltaMs) {
    const delta = deltaMs / 1000;
    if (this.phase === 'intro') {
      this.introLeft -= delta;
      if (this.introLeft <= 0) {
        this.phase = 'fight';
      }
      return;
    }
    if (this.phase !== 'fight') {
      return;
    }

    this.timeLeft = Math.max(0, this.timeLeft - delta);
    if (this.timeLeft === 0) {
      this.finishByTime();
    }
  }

  /**
   * Returns true when this hit ends the round.
   * Chip damage from a block can still KO.
   */
  hurt(id, amount) {
    if (this.phase !== 'fight') {
      return false;
    }
    if (id !== 'p1' && id !== 'p2') {
      throw new Error(`RoundManager has no fighter "${id}".`);
    }

    this.health[id] = Math.max(0, this.health[id] - amount);
    if (this.health[id] > 0) {
      return false;
    }

    this.phase = 'over';
    this.winner = id === 'p1' ? 'p2' : 'p1';
    this.reason = 'ko';
    return true;
  }

  finishByTime() {
    this.phase = 'over';
    this.timeLeft = 0;
    if (this.health.p1 === this.health.p2) {
      this.winner = 'draw';
      this.reason = 'time';
      return;
    }
    this.winner = this.health.p1 > this.health.p2 ? 'p1' : 'p2';
    this.reason = 'time';
  }
}
