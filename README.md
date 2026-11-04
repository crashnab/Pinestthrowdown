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

Easy E and RobGob can be readied. The other five can be highlighted, and the card says they are not in this demo yet. When both are ready, the concert match starts.

The match is one 60-second round. Walk with the same direction keys. Jump with up. Holding forward and jumping carries you over the other fighter, and both fighters turn to face each other after the cross. Crouch with down. Hold back to block. Toward and away follow whichever side you are on.

- Player 1 attacks: F punch, G kick, H special
- Player 2 attacks: K punch, L kick, ; special

A fighter at 0 health loses. If the clock runs out, the higher health wins. Press Start (or either punch button) after the win card to return to character select.

`?fight=1` skips the title and select screens and starts Easy E versus RobGob. That is only a shortcut for checking the stage.

## Where the code goes

Boot, the title, character select, and one concert round exist. Best of 3, the continue countdown, and the other stages are still ahead. New characters and stages stay data instead of new game engines.

```
index.html                  Page shell. Loads Phaser, then src/main.js.
src/main.js                 Phaser config: size, scale, physics, scene list.
src/phaser.js                The Phaser global, checked once.
src/scenes/BootScene.js     Checks 1920×1080, then starts Preload.
src/scenes/PreloadScene.js  Loads title and select art, shows progress.
src/scenes/TitleScene.js    Background, logo, blinking Press Start.
src/scenes/SelectScene.js   Two cursors on the roster grid.
src/scenes/GameScene.js     One round on the concert stage.
src/entities/Fighter.js     Shared fighter: clips, movement, attacks.
src/entities/frameOrder.js  Plays TexturePacker clips forward.
src/ui/FightHud.js          Health bars, clock, FIGHT and win cards.
src/data/assets.js          File lists for Preload.
src/data/characters.js      Roster, atlases, and which fighters are playable.
src/data/stages.js          Stage size, floor, and camera limits.
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
assets/select/thumbnails/            p1 (pink frame) and p2 (orange frame) for all 7
```

The match loads the HUD, the concert stage, and both character atlases. The atlases are TexturePacker's multi-pack JSON (`textures` array), loaded with `this.load.multiatlas`. Keep each `.png` next to its `.json`. The image name inside the JSON is `sprites-erik.png` and `sprites-rob.png`.

### Camera on the concert stage

The window is 1920×1080. The background is 2400×1200, so the spare art is:

- 240px on the left and 240px on the right (`2400 − 1920 = 480`)
- 120px across the top (`1200 − 1080 = 120`)

The camera scrolls inside that rectangle and no farther. It follows the midpoint of the two fighters, and it pans up only when a jump would leave the screen. `stages.js` stores those bounds so the other six stages can reuse the same rig.
