/**
 * Images grouped by the screen that needs them.
 * PreloadScene loads TITLE_ASSETS. Later screens add their own lists here
 * instead of hard-coding paths inside a scene.
 *
 * `key` is the name scenes use to draw the image.
 * `url` is the file path relative to index.html.
 */
export const TITLE_ASSETS = [
  { key: 'title-bg', url: 'assets/title/title-bkg.jpg' },
  { key: 'title-logo', url: 'assets/title/title-pstd.png' },
  { key: 'title-press-start', url: 'assets/title/title-pressstart.png' },
];

export function assertUniqueAssets(list, label) {
  if (!Array.isArray(list) || list.length === 0) {
    throw new Error(`${label} is empty.`);
  }

  const seen = new Set();

  for (const entry of list) {
    if (!entry || typeof entry.key !== 'string' || entry.key.length === 0) {
      throw new Error(`${label} has an entry with no key.`);
    }
    if (typeof entry.url !== 'string' || entry.url.length === 0) {
      throw new Error(`${label} entry "${entry.key}" has no url.`);
    }
    if (seen.has(entry.key)) {
      throw new Error(`${label} uses the key "${entry.key}" more than once.`);
    }
    seen.add(entry.key);
  }
}
