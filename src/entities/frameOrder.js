/**
 * TexturePacker listed these clips last-frame-first (the file prefix
 * 0000 is the end of the clip). Sorting that prefix downward plays them
 * forward: idle, walk, punch, and the rest.
 */
export function animationFrames(frames, anim) {
  const group = frames.filter((frame) => frame.filename.split('/')[1] === anim);
  group.sort((a, b) => framePrefix(b.filename) - framePrefix(a.filename));
  return group;
}

function framePrefix(filename) {
  const file = filename.split('/').pop();
  const match = file.match(/_(\d+)_/);
  return match ? Number(match[1]) : 0;
}
