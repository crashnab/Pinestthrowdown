/**
 * One stage description. The view is 1920×1080. The painting is 2400×1200,
 * so the camera can travel 240px each way and 120px up, and no farther.
 * Later stages are more entries with the same shape.
 */
export const CONCERT_STAGE = {
  id: 'concert',
  key: 'Level-4-Concert-bkg',
  url: 'assets/stages/concert/Level-4-Concert-bkg.jpg',
  worldWidth: 2400,
  worldHeight: 1200,
  viewWidth: 1920,
  viewHeight: 1080,
  floorY: 1096,
  leftBound: 180,
  rightBound: 2220,
};

export function cameraLimits(stage) {
  return {
    maxX: stage.worldWidth - stage.viewWidth,
    maxY: stage.worldHeight - stage.viewHeight,
  };
}
