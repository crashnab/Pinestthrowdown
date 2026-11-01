# Throw Pine St. Down

A 2D fighting game in the style of 1990s arcade fighters, built with Phaser 3 and ES modules. No bundler.

The game is drawn at **1920×1080** and scales to fit the browser window.

## Run it

ES modules do not load from a `file://` page. From this folder:

```bash
python3 -m http.server 8080
```

Open [http://localhost:8080/](http://localhost:8080/). You should see a black 1920×1080 canvas with a small `BOOT OK` label in the lower left. That label is only a boot check.

## Where the code goes

Only the boot files exist today. The rest of the tree is the plan, so new characters and stages are data instead of new game engines.

```
index.html                  Page shell. Loads Phaser, then src/main.js.
src/main.js                 Phaser config: size, scale, physics, scene list.
src/scenes/BootScene.js     Proves the canvas is alive. Hands off later.
src/scenes/PreloadScene.js  Will load images and atlases, with a progress bar.
src/scenes/TitleScene.js    Title screen. 1-player or 2-player.
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

## Where to put art

Drop files in now. Nothing loads them until the preload step.

Keep each TexturePacker pair together, and do not rename the `.png` unless you also change the image name stored inside its `.json` (`meta.image`). Phaser resolves that name next to the JSON.

```
assets/title/background.png          Title-screen background.
assets/title/logo.png                THROW PINE ST. DOWN, if it is a separate image.

assets/select/background.png         Character-select background.
assets/select/title.png              CHOOSE YOUR FIGHTER, if it is a separate image.
assets/select/portraits/easy-e.png   Large side portrait.
assets/select/portraits/robgob.png
assets/select/thumbnails/            One image per roster member, all 7.

assets/ui/                           Health bar, timer plate, and HUD portraits.

assets/stages/concert/background.png Concert stage. Must be 2400×1200.

assets/characters/easy-e/            easy-e.png + easy-e.json (JSON Hash).
assets/characters/robgob/            robgob.png + robgob.json (JSON Hash).
```

Ids used in code later: `easy-e` (Easy E) and `robgob` (RobGob). Thumbnail filenames for the other five can stay as exported; the roster file will map them.

### Camera on the concert stage

The window is 1920×1080. The background is 2400×1200, so the spare art is:

- 240px on the left and 240px on the right (`2400 − 1920 = 480`)
- 120px across the top (`1200 − 1080 = 120`)

The camera will be allowed to scroll inside that rectangle and no farther. Stage data will store those bounds so the other six stages can reuse the same rig.
