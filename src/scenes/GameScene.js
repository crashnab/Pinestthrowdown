import Phaser from '../phaser.js';
import { CONCERT_STAGE } from '../data/stages.js';
import { fighterById, fightAssets } from '../data/characters.js';
import { FIGHT_KEYS } from '../systems/controls.js';
import RoundManager from '../systems/RoundManager.js';
import { cameraScroll } from '../systems/cameraRig.js';
import Fighter, { FIGHTER_GRAVITY, createFighterAnimations, prepareFighter } from '../entities/Fighter.js';
import FightHud from '../ui/FightHud.js';

const SEPARATION = 100;

/**
 * One match on the concert stage.
 * Character select stores p1Fighter and p2Fighter on the registry.
 * This scene reads those ids. ?fight=1 from the boot scene uses the same path.
 */
export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Game' });
  }

  init() {
    this.ids = {
      p1: this.readFighterId('p1', 'easy-e'),
      p2: this.readFighterId('p2', 'robgob'),
    };
    this.failed = [];
    this.failMessage = '';
    this.resultShown = false;
  }

  preload() {
    document.documentElement.dataset.scene = 'game';
    let assets = [];
    try {
      assets = fightAssets([this.ids.p1, this.ids.p2]);
    } catch (error) {
      this.failMessage = error instanceof Error ? error.message : String(error);
      console.error(this.failMessage);
      return;
    }

    this.load.on('loaderror', (file) => {
      const label = `${file.key} (${file.url})`;
      this.failed.push(label);
      console.error(`Could not load ${label}`);
    });

    this.load.image(CONCERT_STAGE.key, CONCERT_STAGE.url);
    for (const asset of assets) {
      if (asset.type === 'atlas') {
        this.load.json(`${asset.key}-data`, asset.url);
        this.load.multiatlas(asset.key, asset.url, asset.path);
      } else {
        this.load.image(asset.key, asset.url);
      }
    }
  }

  create() {
    if (this.failMessage || this.failed.length > 0) {
      const detail = this.failMessage || `Could not load:\n${this.failed.join('\n')}`;
      document.documentElement.dataset.round = 'error';
      this.showMessage(detail);
      return;
    }

    let p1Def;
    let p2Def;
    try {
      p1Def = prepareFighter(this.cache.json.get(`${this.ids.p1}-data`), fighterById(this.ids.p1));
      p2Def = prepareFighter(this.cache.json.get(`${this.ids.p2}-data`), fighterById(this.ids.p2));
      createFighterAnimations(this, p1Def);
      createFighterAnimations(this, p2Def);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      console.error(detail);
      document.documentElement.dataset.round = 'error';
      this.showMessage(detail);
      return;
    }

    this.physics.world.gravity.y = FIGHTER_GRAVITY;
    this.physics.world.setBounds(0, 0, CONCERT_STAGE.worldWidth, CONCERT_STAGE.worldHeight);
    if (new URLSearchParams(window.location.search).get('debug') === '1') {
      this.physics.world.createDebugGraphic();
    }

    this.add.image(0, 0, CONCERT_STAGE.key).setOrigin(0, 0).setDepth(0);

    this.p1 = new Fighter(this, 760, CONCERT_STAGE.floorY, p1Def, 'p1');
    this.p2 = new Fighter(this, 1640, CONCERT_STAGE.floorY, p2Def, 'p2');
    this.p1.setOpponent(this.p2);
    this.p2.setOpponent(this.p1);
    this.p1.syncBodyOffset();
    this.p2.syncBodyOffset();
    this.physics.world.on('worldstep', () => {
      this.land(this.p1);
      this.land(this.p2);
      this.separateFighters();
      this.keepOnStage(this.p1);
      this.keepOnStage(this.p2);
      this.followFighters();
    });

    this.cameras.main.setBounds(0, 0, CONCERT_STAGE.worldWidth, CONCERT_STAGE.worldHeight);
    this.cameras.main.scrollX = 240;
    this.cameras.main.scrollY = 120;

    this.round = new RoundManager();
    this.hud = new FightHud(this, p1Def, p2Def);
    this.hud.showFight();
    this.hint = this.add
      .text(960, 1044, 'P1  F PUNCH   G KICK   H SPECIAL          P2  K PUNCH   L KICK   ; SPECIAL', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '20px',
        color: '#f3ecdf',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(30);

    this.bindKeys();
    this.publish();
  }

  update(time, delta) {
    if (!this.round) {
      return;
    }

    this.round.tick(delta);
    const fighting = this.round.phase === 'fight';
    const input = {
      p1: this.readInput('p1'),
      p2: this.readInput('p2'),
    };

    if (this.round.phase === 'over') {
      this.presentResult();
      if (this.continuePressed(input)) {
        this.returnToSelect();
        return;
      }
    } else if (this.round.phase === 'fight' && this.hud.banner.visible) {
      this.hud.hideIntro();
    }

    this.faceEachOther();
    this.p1.handleInput(input.p1, fighting);
    this.p2.handleInput(input.p2, fighting);
    this.resolveHits(input);
    this.hud.setHealth('p1', this.round.health.p1 / this.round.maxHealth);
    this.hud.setHealth('p2', this.round.health.p2 / this.round.maxHealth);
    this.hud.setTime(this.round.timeLeft);
    this.publish();
  }

  readFighterId(slot, fallback) {
    const id = this.registry.get(`${slot}Fighter`);
    return typeof id === 'string' && id.length > 0 ? id : fallback;
  }

  bindKeys() {
    const keyboard = this.input.keyboard;
    if (!keyboard) {
      console.error('Keyboard input is off, so the match cannot be played.');
      document.documentElement.dataset.round = 'no-keyboard';
      return;
    }
    keyboard.addCapture(['UP', 'DOWN', 'LEFT', 'RIGHT', 'SPACE', 'ENTER', 'BACKSPACE']);
    this.keys = { p1: {}, p2: {} };
    for (const id of ['p1', 'p2']) {
      for (const action of Object.keys(FIGHT_KEYS[id])) {
        this.keys[id][action] = keyboard.addKey(FIGHT_KEYS[id][action]);
      }
    }
    this.continueKey = keyboard.addKey('SPACE');
  }

  readInput(id) {
    if (!this.keys) {
      return { left: false, right: false, jump: false, crouch: false, punch: false, kick: false, special: false };
    }
    const keys = this.keys[id];
    const held = (key) => Boolean(key && key.isDown);
    const tapped = (key) => Boolean(key && Phaser.Input.Keyboard.JustDown(key));
    return {
      left: held(keys.left),
      right: held(keys.right),
      jump: tapped(keys.up),
      crouch: held(keys.down),
      punch: tapped(keys.punch),
      kick: tapped(keys.kick),
      special: tapped(keys.special),
    };
  }

  continuePressed(input) {
    return input.p1.punch || input.p2.punch || (this.continueKey && Phaser.Input.Keyboard.JustDown(this.continueKey));
  }

  resolveHits(input) {
    if (this.round.phase !== 'fight') {
      return;
    }
    this.applyHit(this.p1, this.p2, input.p2);
    this.applyHit(this.p2, this.p1, input.p1);
  }

  applyHit(attacker, defender, defenderInput) {
    const attack = attacker.activeAttack();
    if (!attack || defender.state === 'dead' || defender.state === 'hit') {
      return;
    }
    if (!attacker.reaches(defender, attack.reach)) {
      return;
    }

    const blocking = defender.state === 'block' || (defender.onFloor() && defender.isHoldingBack(defenderInput) && defender.state !== 'attack');
    const damage = blocking ? Math.max(1, Math.round(attack.damage * 0.2)) : attack.damage;
    attacker.markAttackHit();
    const killed = this.round.hurt(defender.playerId, damage);
    if (killed) {
      defender.ko();
      return;
    }
    if (blocking) {
      defender.state = 'block';
      defender.playAnim('block', true);
      defender.body.setVelocityX(attacker.facing() * 140);
      return;
    }
    defender.takeHit(attacker.x < defender.x);
  }

  land(fighter) {
    const floor = CONCERT_STAGE.floorY;
    const bottom = fighter.body.bottom;
    // A real jump leaves the floor quickly. A walk frame can lift the
    // body by a few pixels, and that should not turn into an air attack.
    if (fighter.body.velocity.y < -40 || bottom < floor - 12) {
      fighter.grounded = false;
      return;
    }

    const drop = bottom - floor;
    fighter.y -= drop;
    fighter.body.y -= drop;
    fighter.body.velocity.y = 0;
    fighter.grounded = true;
  }

  /**
   * Compare the two foot positions every update. The fighter on the
   * right faces left, and the fighter on the left faces right, so a
   * jump that crosses behind the opponent turns both of them around.
   */
  faceEachOther() {
    const p1OnRight = this.p1.x > this.p2.x;
    this.p1.turnTo(p1OnRight);
    this.p2.turnTo(!p1OnRight);
  }

  separateFighters() {
    if (this.p1.state === 'dead' || this.p2.state === 'dead') {
      return;
    }
    if (this.passesOver(this.p1, this.p2) || this.passesOver(this.p2, this.p1)) {
      return;
    }
    const gap = this.p2.x - this.p1.x;
    const distance = Math.abs(gap);
    if (distance >= SEPARATION) {
      return;
    }
    const push = (SEPARATION - distance) / 2;
    const direction = gap >= 0 ? 1 : -1;
    this.p1.x -= push * direction;
    this.p2.x += push * direction;
  }

  /** True when `jumper`'s feet are above the other fighter's shoulders. */
  passesOver(jumper, other) {
    if (jumper.grounded === true) {
      return false;
    }
    const shoulders = other.y - other.visibleHeight * 0.72;
    return jumper.y < shoulders;
  }

  keepOnStage(fighter) {
    fighter.x = Math.min(CONCERT_STAGE.rightBound, Math.max(CONCERT_STAGE.leftBound, fighter.x));
  }

  followFighters() {
    const target = cameraScroll(CONCERT_STAGE, [this.p1, this.p2]);
    const camera = this.cameras.main;
    camera.scrollX += (target.x - camera.scrollX) * 0.14;
    camera.scrollY += (target.y - camera.scrollY) * 0.14;
  }

  presentResult() {
    if (this.resultShown) {
      return;
    }
    this.resultShown = true;
    this.hint.setVisible(false);
    const winnerId = this.round.winner === 'p1' ? this.p1.def.id : this.round.winner === 'p2' ? this.p2.def.id : null;
    if (this.round.reason === 'ko') {
      (this.round.winner === 'p1' ? this.p1 : this.p2).victory();
    } else if (winnerId) {
      (this.round.winner === 'p1' ? this.p1 : this.p2).victory();
    }
    this.hud.showResult(this.round, winnerId);
  }

  returnToSelect() {
    if (this.textures.exists('select-bg')) {
      this.scene.start('Select');
      return;
    }
    this.scene.start('Preload');
  }

  publish() {
    const root = document.documentElement.dataset;
    const camera = this.cameras.main;
    root.scene = 'game';
    root.round = this.round.phase;
    root.p1 = this.p1.def.id;
    root.p2 = this.p2.def.id;
    root.p1Health = String(this.round.health.p1);
    root.p2Health = String(this.round.health.p2);
    root.timeLeft = String(Math.ceil(this.round.timeLeft));
    root.winner = this.round.winner || '';
    root.cameraX = String(Math.round(camera.scrollX));
    root.cameraY = String(Math.round(camera.scrollY));
    root.bodyW = String(Math.round(this.p1.body.width));
    root.p1X = String(Math.round(this.p1.x));
    root.p2X = String(Math.round(this.p2.x));
    root.p1Y = String(Math.round(this.p1.y));
    root.p1Bottom = String(Math.round(this.p1.body.bottom));
    root.p1State = this.p1.state;
    root.p2State = this.p2.state;
    root.p1Flip = this.p1.flipX ? '1' : '0';
    root.p2Flip = this.p2.flipX ? '1' : '0';
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
