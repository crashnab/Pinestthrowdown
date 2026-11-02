/**
 * The roster, in select-screen order.
 * Row one is the first four entries. Row two is the last three, centered.
 * A new fighter is a new object. `playable` stays false until that fighter
 * has a portrait and can be taken into a match.
 */
export const ROSTER = [
  {
    id: 'robgob',
    name: 'ROBGOB',
    playable: true,
    thumbP1: 'assets/select/thumbnails/charselect-robgobtile-p1.png',
    thumbP2: 'assets/select/thumbnails/charselect-robgobtile-p2.png',
    portrait: 'assets/select/portraits/charselect-robgob-hero.png',
    nameImage: 'assets/select/charselect-robgob-text.png',
    atlas: 'assets/characters/robgob/sprites-rob.json',
    hudName: 'assets/ui/stage-UIname-robgob.png',
    hudPhotoLeft: 'assets/ui/stage-UIphoto-robgob-left.png',
    hudPhotoRight: 'assets/ui/stage-UIphoto-robgob-right.png',
    winImage: 'assets/ui/stage-robgobwins-text.png',
  },
  {
    id: 'dollabills',
    name: 'DOLLA BILLS',
    playable: false,
    thumbP1: 'assets/select/thumbnails/charselect-dollabills-p1.png',
    thumbP2: 'assets/select/thumbnails/charselect-dollabillstile-p2.png',
  },
  {
    id: 'fluff',
    name: 'FLUFF',
    playable: false,
    thumbP1: 'assets/select/thumbnails/charselect-flufftile-p1.png',
    thumbP2: 'assets/select/thumbnails/charselect-flufftile-p2.png',
  },
  {
    id: 'easy-e',
    name: 'EASY E',
    playable: true,
    thumbP1: 'assets/select/thumbnails/charselect-easyetile-p1.png',
    thumbP2: 'assets/select/thumbnails/charselect-easyetile-p2.png',
    portrait: 'assets/select/portraits/charselect-easye-hero.png',
    nameImage: 'assets/select/charselect-easye-text.png',
    atlas: 'assets/characters/easy-e/sprites-erik.json',
    hudName: 'assets/ui/stage-UIname-easye.png',
    hudPhotoLeft: 'assets/ui/stage-UIphoto-easye-left.png',
    hudPhotoRight: 'assets/ui/stage-UIphoto-easye-right.png',
    winImage: 'assets/ui/stage-easyewins-text.png',
  },
  {
    id: 'hoss',
    name: 'HOSS',
    playable: false,
    thumbP1: 'assets/select/thumbnails/charselect-hosstile-p1.png',
    thumbP2: 'assets/select/thumbnails/charselect-hosstile-p2.png',
  },
  {
    id: 'fels',
    name: 'FELS',
    playable: false,
    thumbP1: 'assets/select/thumbnails/charselect-felstile-p1.png',
    thumbP2: 'assets/select/thumbnails/charselect-felstile-p2.png',
  },
  {
    id: 'naptime',
    name: 'NAPTIME',
    playable: false,
    thumbP1: 'assets/select/thumbnails/charselect-naptimetile-p1.png',
    thumbP2: 'assets/select/thumbnails/charselect-naptimetile-p2.png',
  },
];

const TOP_ROW = 4;

export function rosterIndex(id) {
  const index = ROSTER.findIndex((fighter) => fighter.id === id);
  if (index === -1) {
    throw new Error(`Roster has no fighter "${id}".`);
  }
  return index;
}

export function rosterSlot(index) {
  if (index < 0 || index >= ROSTER.length) {
    throw new Error(`Roster index ${index} is outside 0..${ROSTER.length - 1}.`);
  }
  if (index < TOP_ROW) {
    return { row: 0, col: index };
  }
  return { row: 1, col: index - TOP_ROW };
}

/** Texture keys and file paths for every portrait, name plate, and tile. */
export function rosterAssets() {
  const assets = [];

  for (const fighter of ROSTER) {
    assets.push({ key: `${fighter.id}-thumb-p1`, url: fighter.thumbP1 });
    assets.push({ key: `${fighter.id}-thumb-p2`, url: fighter.thumbP2 });
    if (fighter.portrait) {
      assets.push({ key: `${fighter.id}-portrait`, url: fighter.portrait });
    }
    if (fighter.nameImage) {
      assets.push({ key: `${fighter.id}-name`, url: fighter.nameImage });
    }
  }

  return assets;
}

export function fighterById(id) {
  const fighter = ROSTER.find((entry) => entry.id === id);
  if (!fighter) {
    throw new Error(`Roster has no fighter "${id}".`);
  }
  return fighter;
}

/**
 * Stage UI plus the atlases for the two fighters in this match.
 * The same fighter twice loads one atlas. A fighter with no atlas throws,
 * which is how an unfinished roster entry stays out of a match.
 */
export function fightAssets(ids) {
  const assets = [
    { type: 'image', key: 'health-bg', url: 'assets/ui/stage-UIhealth-bkg.png' },
    { type: 'image', key: 'health-fill', url: 'assets/ui/stage-UIhealth-lifemeter.png' },
    { type: 'image', key: 'fight-text', url: 'assets/ui/stage-fight-text.png' },
  ];
  const seen = new Set(assets.map((asset) => asset.key));

  for (const id of ids) {
    const fighter = fighterById(id);
    if (!fighter.atlas) {
      throw new Error(`${fighter.name} has no fight atlas yet.`);
    }

    if (!seen.has(fighter.id)) {
      const slash = fighter.atlas.lastIndexOf('/') + 1;
      assets.push({
        type: 'atlas',
        key: fighter.id,
        url: fighter.atlas,
        path: fighter.atlas.slice(0, slash),
      });
      seen.add(fighter.id);
    }

    const extras = [
      [`${fighter.id}-hud-name`, fighter.hudName],
      [`${fighter.id}-hud-left`, fighter.hudPhotoLeft],
      [`${fighter.id}-hud-right`, fighter.hudPhotoRight],
      [`win-${fighter.id}`, fighter.winImage],
    ];
    for (const [key, url] of extras) {
      if (!url || seen.has(key)) {
        continue;
      }
      assets.push({ type: 'image', key, url });
      seen.add(key);
    }
  }

  return assets;
}
