import Phaser from '../phaser.js';
import { animationFrames } from './frameOrder.js';

const TARGET_HEIGHT = 560;
const MOVE_SPEED = 360;

/**
 * A standing fighter is about 560px tall. The old hop rose ~220px, so
 * nobody could jump over anyone. This launch is fast, and the feet
 * rise about 580px, which is enough to pass over the other fighter.
 * Gravity is paired with it so the jump comes back down quickly. The jump drawing
 * is taller than the idle pose, so the head can touch the top of the
 * stage at the peak.
 */
export const JUMP_VELOCITY = -2940;
export const FIGHTER_GRAVITY = 7000;

const ATTACKS = {
  punch: { anim: 'punch', damage: 10, reach: 240, hitStart: 0.28, hitEnd: 0.62 },
  kick: { anim: 'kick', damage: 14, reach: 290, hitStart: 0.32, hitEnd: 0.68 },
  special: { anim: 'special', damage: 22, reach: 340, hitStart: 0.38, hitEnd: 0.72 },
  'jump-attack': { anim: 'jump-attack', damage: 12, reach: 270, hitStart: 0.25, hitEnd: 0.7 },
};

const CLIP_NAMES = [
  'idle',
  'walk',
  'crouch',
  'jump',
  'jump-attack',
  'punch',
  'kick',
  'special',
  'block',
  'takehit',
  'dead',
  'victory',
];

const LOOPED = new Set(['idle', 'walk']);

/**
 * Reads the idle pose out of a loaded multi-atlas and decides how big
 * the fighter should be. Easy E and RobGob were exported on different
 * sized canvases, so the scale is per character, not one global number.
 */
export function prepareFighter(atlasJson, definition) {
  const frames = atlasJson.textures?.[0]?.frames;
  if (!frames) {
    throw new Error(`${definition.name} atlas has no frames.`);
  }

  const idle = animationFrames(frames, 'idle');
  if (idle.length === 0) {
    throw new Error(`${definition.name} atlas has no idle clip.`);
  }

  const pose = idle[0];
  const trim = pose.spriteSourceSize;
  const source = pose.sourceSize;
  const scale = TARGET_HEIGHT / trim.h;
  const bodyWidth = trim.w * 0.42;
  const bodyHeight = trim.h * 0.92;

  return {
    ...definition,
    frames,
    scale,
    visibleHeight: trim.h * scale,
    footPad: (source.h - (trim.y + trim.h)) * scale,
    idleFrame: pose.filename,
    bodyBox: {
      w: bodyWidth,
      h: bodyHeight,
      x: trim.x + (trim.w - bodyWidth) / 2,
      y: trim.y + trim.h * 0.08,
      sourceW: source.w,
    },
  };
}

export function createFighterAnimations(scene, definition) {
  const rates = {
    idle: 8,
    walk: 12,
    crouch: 14,
    jump: 10,
    'jump-attack': 14,
    punch: 14,
    kick: 14,
    special: 12,
    block: 12,
    takehit: 14,
    dead: 12,
    victory: 12,
  };

  for (const name of CLIP_NAMES) {
    const key = `${definition.id}-${name}`;
    if (scene.anims.exists(key)) {
      continue;
    }
    const frames = animationFrames(definition.frames, name);
    if (frames.length === 0) {
      console.warn(`${definition.name} is missing the ${name} clip.`);
      continue;
    }
    scene.anims.create({
      key,
      frames: frames.map((frame) => ({ key: definition.id, frame: frame.filename })),
      frameRate: rates[name] || 12,
      repeat: LOOPED.has(name) ? -1 : 0,
    });
  }
}

export default class Fighter extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, floorY, definition, playerId) {
    super(scene, x, floorY, definition.id, definition.idleFrame);
    this.def = definition;
    this.playerId = playerId;
    this.opponent = null;
    this.state = 'idle';
    this.attack = null;
    this.attackHit = false;
    this.visibleHeight = definition.visibleHeight;
    this.footPad = definition.footPad;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5, 1);
    this.setScale(definition.scale);
    this.y = floorY + definition.footPad;
    this.body.setSize(definition.bodyBox.w, definition.bodyBox.h);
    this.body.setOffset(definition.bodyBox.x, definition.bodyBox.y);
    this.body.setMaxVelocity(900, 3400);
    this.playAnim('idle', true);

    this.on('animationcomplete', (anim) => this.onClipComplete(anim));
  }

  setOpponent(opponent) {
    this.opponent = opponent;
  }

  /**
   * Play a clip once when the pose changes.
   * `play(key, true)` is Phaser's ignoreIfPlaying flag, so the update
   * loop can ask for the same pose every frame without restarting it.
   * A finished one-shot (jump, punch, hit, block) stays on its last
   * frame until a different pose is requested.
   */
  playAnim(name, restart = false, reverse = false) {
    const key = `${this.def.id}-${name}`;
    if (!this.scene.anims.exists(key)) {
      return;
    }
    const anims = this.anims;
    const sameClip = anims.currentAnim?.key === key;
    const sameDir = anims.inReverse === reverse;
    // ignoreIfPlaying does not cover a clip that already finished.
    // Hold that last frame until a different pose is requested.
    if (!restart && sameClip && sameDir && !anims.isPlaying) {
      return;
    }
    if (reverse) {
      anims.playReverse(key, !restart && sameDir);
      return;
    }
    anims.play(key, !restart && sameDir);
  }

  onFloor() {
    return this.grounded === true;
  }

  handleInput(input, allow) {
    if (!allow || this.state === 'dead' || this.state === 'victory' || this.state === 'hit') {
      return;
    }
    if (this.state === 'attack') {
      return;
    }

    if (input.punch || input.kick || input.special) {
      let name = 'punch';
      if (!this.onFloor()) {
        name = 'jump-attack';
      } else if (input.special) {
        name = 'special';
      } else if (input.kick) {
        name = 'kick';
      }
      this.startAttack(name);
      return;
    }

    if (input.jump && this.onFloor()) {
      this.body.setVelocityY(JUMP_VELOCITY);
      this.body.setVelocityX(this.groundSpeed(input));
      this.state = 'jump';
      this.playAnim('jump', true);
      return;
    }

    if (input.block && this.onFloor()) {
      this.state = 'block';
      this.playAnim('block');
      this.body.setVelocityX(0);
      return;
    }

    if (input.crouch && this.onFloor()) {
      this.state = 'crouch';
      this.body.setVelocityX(0);
      this.playAnim('crouch');
      return;
    }

    if (!this.onFloor()) {
      this.state = 'jump';
      // Left and right stay screen directions in the air, so holding
      // the jump-in key keeps carrying you over. The jump clip is
      // started once, above, and is not replayed on the way down.
      if (input.left !== input.right) {
        this.body.setVelocityX(input.left ? -MOVE_SPEED : MOVE_SPEED);
      }
      return;
    }

    this.body.setVelocityX(this.groundSpeed(input));
    const backward = this.isHoldingBack(input);
    if (input.left !== input.right) {
      this.state = 'walk';
      this.playAnim('walk', false, backward);
      return;
    }
    this.state = 'idle';
    this.playAnim('idle');
  }

  /**
   * 1 when the opponent is to the right, -1 when they are to the left.
   * Crossing behind them flips this, and forward/back follow it.
   */
  forwardSign() {
    if (!this.opponent || this.opponent.x === this.x) {
      return this.flipX ? -1 : 1;
    }
    return this.opponent.x > this.x ? 1 : -1;
  }

  /** Ground speed. Toward the opponent is forward. Away walks backward. */
  groundSpeed(input) {
    if (this.holdingToward(input)) {
      return this.forwardSign() * MOVE_SPEED;
    }
    if (this.isHoldingBack(input)) {
      return -this.forwardSign() * MOVE_SPEED;
    }
    return 0;
  }

  holdingToward(input) {
    const forward = this.forwardSign();
    return forward === 1 ? input.right && !input.left : input.left && !input.right;
  }

  startAttack(name) {
    const attack = ATTACKS[name];
    if (!attack || !this.scene.anims.exists(`${this.def.id}-${attack.anim}`)) {
      return;
    }
    this.state = 'attack';
    this.attack = attack;
    this.attackHit = false;
    this.body.setVelocityX(0);
    this.playAnim(attack.anim, true);
  }

  /** The live hit, or null when this fighter cannot hit right now. */
  activeAttack() {
    if (this.state !== 'attack' || !this.attack || this.attackHit) {
      return null;
    }
    const progress = this.anims.getProgress();
    if (progress < this.attack.hitStart || progress > this.attack.hitEnd) {
      return null;
    }
    return this.attack;
  }

  markAttackHit() {
    this.attackHit = true;
  }

  /**
   * Face left when `faceLeft` is true. Called every update from the
   * x comparison, including while a fighter is jumping over the other.
   */
  turnTo(faceLeft) {
    if (this.state === 'dead' || this.flipX === faceLeft) {
      return;
    }
    this.setFlipX(faceLeft);
    this.syncBodyOffset();
  }

  facing() {
    return this.flipX ? -1 : 1;
  }

  syncBodyOffset() {
    const box = this.def.bodyBox;
    const x = this.flipX ? box.sourceW - box.x - box.w : box.x;
    this.body.setOffset(x, box.y);
  }

  isHoldingBack(input) {
    if (!this.opponent) {
      return false;
    }
    const forward = this.forwardSign();
    return forward === 1 ? input.left && !input.right : input.right && !input.left;
  }

  takeHit(fromLeft) {
    if (this.state === 'dead' || this.state === 'victory') {
      return;
    }
    this.state = 'hit';
    this.attack = null;
    this.playAnim('takehit', true);
    this.body.setVelocity((fromLeft ? 1 : -1) * 380, -880);
  }

  ko() {
    this.state = 'dead';
    this.attack = null;
    this.body.setVelocity(0, 0);
    this.playAnim('dead', true);
  }

  victory() {
    if (this.state === 'dead') {
      return;
    }
    this.state = 'victory';
    this.attack = null;
    this.body.setVelocityX(0);
    this.playAnim('victory', true);
  }

  onClipComplete(anim) {
    const key = anim.key;
    if (this.state === 'attack' && key === `${this.def.id}-${this.attack?.anim}`) {
      this.attack = null;
      this.attackHit = false;
      this.state = this.onFloor() ? 'idle' : 'jump';
      return;
    }
    if (this.state === 'hit' && key.endsWith('-takehit')) {
      this.state = this.onFloor() ? 'idle' : 'jump';
      this.body.setVelocityX(0);
    }
  }

  /**
   * True when `other` is in front of this fighter and inside the attack reach.
   * `x` is the foot position, so reach is measured from the feet, not the canvas.
   */
  reaches(other, reach) {
    const ahead = this.facing() === 1 ? other.x >= this.x - 40 : other.x <= this.x + 40;
    const dx = Math.abs(other.x - this.x);
    const dy = Math.abs(other.y - this.y);
    return ahead && dx <= reach && dy <= 260;
  }
}
