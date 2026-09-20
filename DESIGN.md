# chirs.game — Design Direction

## Character

chirs.game should feel like a tiny arcade made by one person: stark, fast, a little hostile, and quietly funny. It should not look like a neutral portfolio template. The games are deliberately generic; the presentation should make that choice feel confident.

The target is an old vector display interpreted with modern restraint. Empty space is useful, but it needs tension: sharp type, bright objects, hard contrast, and motion that reacts immediately to the player.

## Visual Language

Use a near-black brown background rather than pure black. Draw primary game geometry in warm white. Orange-red is the shared accent for selection, danger, thrust, impacts, and the dot in the name.

- Background: `#151311`
- Surface: `#1d1a17`
- Primary: `#f2eadf`
- Muted: `#817a72`
- Accent: `#ff5c35`

IBM Plex Mono is the site typeface and the default for in-game UI. Use uppercase labels, compact sizes, and generous letter spacing. Game names can be large; instructions should stay quiet until needed.

Shapes should be outlined and recognizable. Avoid arbitrary colored blocks when a simple silhouette can explain the object. A ship should point, an asteroid should have an irregular edge, and a projectile should read as a fast spark.

## Motion and Feedback

Input should produce a visible response on the same frame. Thrust gets a flickering flame. Hits get a brief burst of debris. Death gets a larger burst and an immediate restart prompt.

Effects should be short and geometric. A handful of particles is better than a long animation. Screen shake, sound, and music are optional additions after the movement and collisions feel good without them.

## Site Structure

The home screen is an arcade selector. Show the three games as a numbered vertical list with one-line descriptions and controls. Hover, focus, and keyboard selection use the same accent treatment. The selected game should be obvious without panels, thumbnails, or decorative chrome.

Once a game starts, the canvas owns the screen. Score, level, and controls use the same palette and typography as the selector. Game-over UI should be terse, and restarting should take one keypress.

## Working Rule

Add polish where the player acts or something changes. If an element does not clarify the game, strengthen its mood, or improve feedback, leave it out.
