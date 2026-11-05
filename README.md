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

Easy E and RobGob can be readied. The other five can be highlighted, and the card says they are not in this demo yet. When both are ready, Player 1 picks the stage. A and D move between Franklin, the apartment, and the rock show. The highlighted thumbnail shows its yellow outline. F starts the match on that stage. Player 2's keys do not move this menu. G returns to character select.

The match is one 60-second round. Walk with the same direction keys. Forward walks toward the other fighter. Back walks away and plays the walk cycle in reverse. Jump with up. Holding forward and jumping carries you over the other fighter, and both fighters turn to face each other after the cross. Crouch with down. Block is its own key, and holding back does not block.

- Player 1: F punch, G kick, H special, E block
- Player 2: K punch, L kick, ; special, / block

A fighter at 0 health loses. If the clock runs out, the higher health wins. Press Start (or either punch button) after the win card to return to character select.

`?fight=1` skips the title, character select, and level select screens and starts Easy E versus RobGob on the concert stage. That is only a shortcut for checking the stage.

## Where the code goes

Boot, the title, character select, level select, and one round exist. Best of 3 and the continue countdown are still ahead. New characters and stages stay data instead of new game engines. Franklin and the apartment share the concert stage's floor and camera until those paintings have their own numbers.

```
index.html                  Page shell. Loads Phaser, then src/main.js.
src/main.js                 Phaser config: size, scale, physics, scene list.
src/phaser.js                The Phaser global, checked once.
src/scenes/BootScene.js     Checks 1920×1080, then starts Preload.
src/scenes/PreloadScene.js  Loads title and select art, shows progress.
src/scenes/TitleScene.js    Background, logo, blinking Press Start.
src/scenes/SelectScene.js   Two cursors on the roster grid.
src/scenes/LevelSelectScene.js  Player 1 picks Franklin, the apartment, or the rock show.
src/scenes/GameScene.js     One round on the chosen stage.
src/entities/Fighter.js     Shared fighter: clips, movement, attacks.
src/entities/frameOrder.js  Plays TexturePacker clips forward.
src/ui/FightHud.js          Health bars, clock, FIGHT and win cards.
src/data/assets.js          File lists for Preload.
src/data/characters.js      Roster, atlases, and which fighters are playable.
src/data/stages.js          Stage size, floor, and camera limits.
src/data/levels.js          Level select art and which background each stage uses.
src/systems/controls.js     Keys for select and the match.
src/systems/RoundManager.js One round: health and the 60-second clock.
src/systems/cameraRig.js    Keeps the view inside the stage painting.
vendor/                     Phaser 3.90.0 (MIT). Do not edit.
assets/                     Art. See below.
```

`main.js` is the only place a scene is registered. A scene file that is not listed there never runs.

## Art that is loaded

Preload loads the title files and everything the select screen draws. The roster file points at the tiles, and at a `-hero.png` portrait and a `-text.png` name for every fighter.

```
assets/title/title-bkg.jpg
assets/title/title-pstd.png
assets/title/title-pressstart.png
assets/select/charselect-bkg.png
assets/select/charselect-chooseyourfighter-text.png
assets/select/portraits/             charselect-<name>-hero.png for all 7
assets/select/charselect-<name>-text.png
assets/select/thumbnails/            charselect-<name>tile.png, tile-p1.png, and tile-p2.png for all 7
```

Level select loads its own pictures when that screen opens. The match then loads the one background that was picked.

```
assets/levels/Choose-your-level.png
assets/levels/levelselect-<stage>-thumbnail.png
assets/levels/levelselect-<stage>-thumbnail-selected.png
assets/levels/levelselect-<stage>-text.png
assets/stages/franklin/Level-1-Franklin-bkg.jpg
assets/stages/apartment/Level-2-Apartment-bkg.jpg
assets/stages/concert/Level-4-Concert-bkg.jpg
```

`<stage>` is `franklin`, `apartment`, or `rockshow`. The selected thumbnail is the same picture with the yellow outline.

The match loads the HUD, the concert stage, and both character atlases. The atlases are TexturePacker's multi-pack JSON (`textures` array), loaded with `this.load.multiatlas`. Keep each `.png` next to its `.json`. The image name inside the JSON is `sprites-erik.png` and `sprites-rob.png`.

### Camera on the concert stage

The window is 1920×1080. The background is 2400×1200, so the spare art is:

- 240px on the left and 240px on the right (`2400 − 1920 = 480`)
- 120px across the top (`1200 − 1080 = 120`)

The camera scrolls inside that rectangle and no farther. It follows the midpoint of the two fighters, and it pans up only when a jump would leave the screen. `stages.js` stores those bounds so the other six stages can reuse the same rig.
