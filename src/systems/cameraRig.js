import { cameraLimits } from '../data/stages.js';

/**
 * Horizontal: look at the midpoint of the two fighters.
 * Vertical: sit on the bottom of the painting (scroll 120) unless a
 * jump would put a head through the top of the screen. Then pan up,
 * but never past the top of the painting.
 */
export function cameraScroll(stage, fighters) {
  const limits = cameraLimits(stage);
  const midX = (fighters[0].x + fighters[1].x) / 2;
  const scrollX = clamp(midX - stage.viewWidth / 2, 0, limits.maxX);

  let scrollY = limits.maxY;
  for (const fighter of fighters) {
    const head = fighter.y - fighter.visibleHeight;
    if (head < scrollY + 150) {
      scrollY = head - 150;
    }
  }

  return {
    x: scrollX,
    y: clamp(scrollY, 0, limits.maxY),
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
