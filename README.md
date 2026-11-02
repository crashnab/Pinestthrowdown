# Throw Pine St. Down

A 2D fighting game in the style of 1990s arcade fighters, built with Phaser 3 and ES modules. No bundler.

The game is drawn at **1920×1080** and scales to fit the browser window.

## Run it

ES modules do not load from a `file://` page. From this folder:

```bash
python3 -m http.server 8080
```

Open [http://localhost:8080/](http://localhost:8080/). Boot checks the canvas size, Preload loads the title and select art, and the title screen appears. Enter, Space, or a click opens character select.

On select, Player 1 starts on Easy E and Player 2 starts on RobGob.

- Player 1: WASD moves, F readies, G backs out
- Player 2: arrow keys move, Enter readies, Backspace backs out

Easy E and RobGob can be readied. The other five can be highlighted, and the card says they are not in this demo yet. When both players are ready, the screen waits. The match scene is next, and it will read `p1Fighter` and `p2Fighter` from the Phaser registry.

## Where the code goes

Boot, preload, the title screen, and character select exist. The rest of the tree is the plan, so new characters and stages are data instead of new game engines.

```
index.html                  Page shell. Loads Phaser, then src/main.js.
src/main.js                 Phaser config: size, scale, physics, scene list.
src/phaser.js                The Phaser global, checked once.
src/scenes/BootScene.js     Checks 1920×1080, then starts Preload.
src/scenes/PreloadScene.js  Loads title and select art, shows progress.
src/scenes/TitleScene.js    Background, logo, blinking Press Start.
src/scenes/SelectScene.js   Two cursors on the roster grid.
src/data/assets.js          File lists for Preload.
src/data/characters.js      Roster order, names, and which fighters are playable.
src/systems/controls.js     Player 1 and Player 2 keys for select.
src/scenes/GameScene.js     One match.
src/scenes/ContinueScene.js Arcade continue countdown (10 seconds).
src/scenes/CreditsScene.js  Shown after arcade ends.
src/entities/Fighter.js     One class shared by every character.
src/data/stages.js          Stage list, art path, and camera bounds.
src/systems/RoundManager.js Best of 3 rounds and the 60-second clock.
vendor/                     Phaser 3.90.0 (MIT). Do not edit.
assets/                     Art. See below.
```

`main.js` is the only place a scene is registered. A scene file that is not listed there never runs.

## Art that is loaded

Preload loads the title files and everything the select screen draws. The roster file points at the tiles, the two large portraits, and the two name plates.

```
assets/title/title-bkg.jpg
assets/title/title-pstd.png
assets/title/title-pressstart.png
assets/select/charselect-bkg.png
assets/select/charselect-chooseyourfighter-text.png
assets/select/portraits/charselect-easye-hero.png
assets/select/portraits/charselect-robgob-hero.png
assets/select/thumbnails/            p1 (pink frame) and p2 (orange frame) for all 7
```

The HUD, concert stage, and both character atlases wait for the match. The atlases are TexturePacker's multi-pack JSON (`textures` array). The fight scene will load them with `this.load.multiatlas`. Keep each `.png` next to its `.json`. The image name inside the JSON is `sprites-erik.png` and `sprites-rob.png`.

### Camera on the concert stage

The window is 1920×1080. The background is 2400×1200, so the spare art is:

- 240px on the left and 240px on the right (`2400 − 1920 = 480`)
- 120px across the top (`1200 − 1080 = 120`)

The camera will be allowed to scroll inside that rectangle and no farther. Stage data will store those bounds so the other six stages can reuse the same rig.
