/**
 * The three stages on the level select screen, left to right.
 * The menu art lives in assets/levels/. Each stage background is one
 * flat image. The match loads only the background for the stage that
 * was picked.
 *
 * Franklin and the apartment use the same floor, walls, and camera as
 * the concert painting until those stages have their own numbers.
 */
export const LEVEL_HEADER = {
  key: 'Choose-your-level',
  url: 'assets/levels/Choose-your-level.png',
};

export const LEVELS = [
  {
    id: 'franklin',
    background: 'Level-1-Franklin-bkg',
    backgroundUrl: 'assets/stages/franklin/Level-1-Franklin-bkg.jpg',
    thumb: 'levelselect-franklin-thumbnail',
    thumbUrl: 'assets/levels/levelselect-franklin-thumbnail.png',
    thumbSelected: 'levelselect-franklin-thumbnail-selected',
    thumbSelectedUrl: 'assets/levels/levelselect-franklin-thumbnail-selected.png',
    name: 'levelselect-franklin-text',
    nameUrl: 'assets/levels/levelselect-franklin-text.png',
  },
  {
    id: 'apartment',
    background: 'Level-2-Apartment-bkg',
    backgroundUrl: 'assets/stages/apartment/Level-2-Apartment-bkg.jpg',
    thumb: 'levelselect-apartment-thumbnail',
    thumbUrl: 'assets/levels/levelselect-apartment-thumbnail.png',
    thumbSelected: 'levelselect-apartment-thumbnail-selected',
    thumbSelectedUrl: 'assets/levels/levelselect-apartment-thumbnail-selected.png',
    name: 'levelselect-apartment-text',
    nameUrl: 'assets/levels/levelselect-apartment-text.png',
  },
  {
    id: 'rockshow',
    background: 'Level-4-Concert-bkg',
    backgroundUrl: 'assets/stages/concert/Level-4-Concert-bkg.jpg',
    thumb: 'levelselect-rockshow-thumbnail',
    thumbUrl: 'assets/levels/levelselect-rockshow-thumbnail.png',
    thumbSelected: 'levelselect-rockshow-thumbnail-selected',
    thumbSelectedUrl: 'assets/levels/levelselect-rockshow-thumbnail-selected.png',
    name: 'levelselect-rockshow-text',
    nameUrl: 'assets/levels/levelselect-rockshow-text.png',
  },
];

export const DEFAULT_BACKGROUND = 'Level-4-Concert-bkg';

/** Header, plain thumbnails, yellow-outline thumbnails, and the name graphics. */
export function levelSelectAssets() {
  const assets = [{ key: LEVEL_HEADER.key, url: LEVEL_HEADER.url }];

  for (const level of LEVELS) {
    assets.push({ key: level.thumb, url: level.thumbUrl });
    assets.push({ key: level.thumbSelected, url: level.thumbSelectedUrl });
    assets.push({ key: level.name, url: level.nameUrl });
  }

  return assets;
}

export function levelByBackground(key) {
  const level = LEVELS.find((entry) => entry.background === key);
  if (!level) {
    throw new Error(`No level uses the background "${key}".`);
  }
  return level;
}
