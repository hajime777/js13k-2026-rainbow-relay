# Rainbow Relay - Concept Notes

## Current core

- Pastel visual direction.
- The starting scene is a cloudy/rainy overcast sky.
- A completed rainbow and blue sky already exist behind the overcast layer.
- The player scrubs/rubs the screen to clear the overcast layer locally.
- Cleared areas reveal the blue sky and hidden rainbow.
- Foreground clouds also get pushed in the drag direction and scatter while fading; clouds do not collide with each other at this stage.
- Foreground clouds may remain; the goal is not to delete every cloud.
- Progress is based on how much of the rainbow has been revealed.
- A stage clears when 90% of the visible rainbow has been revealed.
- Stage 1 uses the normal circular rainbow arc with the original band balance.
- Stage 2 and later generate increasingly unusual rainbow paths procedurally from the stage number; no per-stage rainbow shape data is stored.
- Early variants include a warped arc, an inverted arc, a horizontal straight rainbow, an S-like wave, a diagonal wave, and a sideways arc. The shape families repeat with stage-dependent variation.
- Stage 2 and later also vary rainbow band thickness and spacing procedurally; no per-stage band layout data is stored.
- After a clear, the completed sky remains visible with a small bottom confirmation reading `僕が見つけた虹です`. The next stage starts only after the player presses `OK`.
- Restart always returns the game to Stage 1 rather than restarting the current stage.

## Current presentation direction

- The playable view is portrait, including on desktop/Windows.
- The portrait playfield uses a 9:16 frame and is centered inside wider desktop browser windows.
- The underlying sky composition is still treated like the previous 16:9 landscape scene and then cropped into the portrait frame.
- The rainbow keeps the same scale it had in the landscape composition instead of shrinking to fit the portrait width.
- The crop shows either the left or right side of that wider composition, so part of the rainbow naturally continues off-screen.
- Foreground clouds are denser and use more rounded lobes for a fluffier silhouette, while preserving the existing colors, transparency, gradients, and overall visual style.
- The top UI is intentionally minimal and shows only the title.
- Reveal progress is a compact bar at the bottom.
- The clear confirmation is also kept at the bottom so the revealed rainbow remains easy to view or capture with an external screenshot tool; the game itself does not provide screenshot functionality.

## Later direction under consideration

- The playable sky may expand as the game progresses and become harder to clear.
- A night transition may reveal a unicorn constellation.
- The size or richness of the constellation may reflect accumulated activity.
- Online behavior is intentionally undecided. It does not have to be versus or co-op. A preferred direction is an indirect or surprising use where the player thinks: "Wait, THAT is the online part?"

## Important constraint

The game must remain **offline-first**.

The base game must be playable and completable with no network connection. Any online behavior must be additive rather than required for basic play.

## Open questions

- What makes repeated play genuinely fun rather than only visually pleasant?
- How should difficulty increase as the sky/world expands?
- What exactly should online presence affect?
- When and how should the unicorn constellation appear?
