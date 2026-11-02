# Throw Pine St. Down

A 2D fighting game in the style of 1990s arcade fighters, built with Phaser 3 and ES modules. No bundler.

The game is drawn at **1920×1080** and scales to fit the browser window.

## Run it

ES modules do not load from a `file://` page. From this folder:

```bash
python3 -m http.server 8080
```

Open [http://localhost:8080/](http://localhost:8080/). Boot checks the canvas size, Preload loads the title art, and the title screen appears. Press Start blinks. Enter, Space, or a click accepts it. Character select is not built yet, so the title stays up after that press.

## Where the code goes

Boot, preload, and the title screen exist. The rest of the tree is the plan, so new characters and stages are data instead of new game engines.

```
index.html                  Page shell. Loads Phaser, then src/main.js.
src/main.js                 Phaser config: size, scale, physics, scene list.
src/phaser.js                 The Phaser global, checked once.
src/scenes/BootScene.js     Checks 1920×1080, then starts Preload.
src/scenes/PreloadScene.js  Loads TITLE_ASSETS and shows progress.
src/scenes/TitleScene.js    Background, logo, blinking Press Start.
src/data/assets.js          File list for Preload. Title art is the first list.
src/scenes/SelectScene.js   Character select.
src/scenes/GameScene.js     One match.
src/scenes/ContinueScene.js Arcade continue countdown (10 seconds).
src/scenes/CreditsScene.js  Shown after arcade ends.
src/entities/Fighter.js     One class shared by every character.
src/data/characters.js      Roster. A new fighter is a new entry here.
src/data/stages.js          Stage list, art path, and camera bounds.
src/systems/controls.js     Player 1 and Player 2 keyboard layouts.
src/systems/RoundManager.js Best of 3 rounds and the 60-second clock.
vendor/                     Phaser 3.90.0 (MIT). Do not edit.
assets/                     Art. See below.
```

`main.js` is the only place a scene is registered. A scene file that is not listed there never runs.

## Art that is loaded

`src/data/assets.js` lists the title files. Preload asks Phaser for that list and nothing else yet.

```
assets/title/title-bkg.jpg           1920×1080 background
assets/title/title-pstd.png          THROW PINE ST. DOWN logo
assets/title/title-pressstart.png    PRESS START
```

The select screen, HUD, concert stage, and both character atlases are in `assets/` and wait for later scenes. The atlases are TexturePacker's multi-pack JSON (`textures` array). The fight scene will load them with `this.load.multiatlas`, which is the loader that matches that file. Keep each `.png` next to its `.json`. The image name inside the JSON is `sprites-erik.png` and `sprites-rob.png`.

### Camera on the concert stage

The window is 1920×1080. The background is 2400×1200, so the spare art is:

- 240px on the left and 240px on the right (`2400 − 1920 = 480`)
- 120px across the top (`1200 − 1080 = 120`)

The camera will be allowed to scroll inside that rectangle and no farther. Stage data will store those bounds so the other six stages can reuse the same rig.
