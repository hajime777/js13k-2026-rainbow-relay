# Rainbow Relay - Concept Notes

## Current core

- Pastel visual direction.
- The starting scene is a cloudy/rainy overcast sky.
- The player scrubs/rubs the screen to reveal the blue sky and hidden rainbow.
- Foreground clouds also get pushed in the drag direction and scatter while fading; clouds do not collide with each other at this stage.
- Progress is based on how much of the current rainbow segment has been revealed.
- A stage clears when 90% of the visible rainbow segment has been revealed.
- Clearing does not advance automatically. The player can pause on the cleared screen, then press **OK** to follow the rainbow onward.
- **Restart** always returns to Stage 1.

## Rainbow trail prototype

- The current test run is **8 stages**. A later full version may extend this to around 16 stages.
- Stage 1 is a conventional semicircular rainbow spanning from the left edge to the right edge, so the first reveal reads immediately as a normal rainbow.
- Each cleared segment leads into the neighboring logical screen at the segment's outgoing edge. Pressing **OK** plays a short directional screen-scroll transition so it feels like the view follows the rainbow into that neighboring cloudy sky.
- The next screen starts cloudy again, so the player repeatedly follows the hidden continuation of one long rainbow.
- Later segments can turn, double back, revisit a previous logical screen, or overlap. Geometric contradictions are acceptable; the intended feeling is closer to following a snake than navigating a physically strict world.
- The route is generated deterministically from the stage number and entry direction rather than stored as per-stage route data.
- Rainbow band width and spacing vary procedurally across later stages.
- The final stage does not continue through another screen edge. Its rainbow ends inside the screen.

## Final overview

- When Stage 8 is cleared, pressing **OK** shows an overview of the whole rainbow trail.
- The overview is reconstructed from the actual rainbow geometry recorded from the stages the player cleared, rather than drawing a separate pre-authored "final rainbow."
- For each cleared stage, the runtime records its logical map position plus the generated band paths, widths, and spacing.
- Revisited logical screens are intentionally overlaid, so the final trail can cross or contradict itself.
- No screenshots or image files are stored for this reconstruction; only lightweight runtime geometry is kept.
- The overview is intended to create the reveal: "So this is the rainbow I followed."

## Current presentation direction

- The playable view is portrait, including on desktop/Windows.
- The portrait playfield uses a 9:16 frame and is centered inside wider desktop browser windows.
- The upper HUD contains only the title.
- Reveal progress is a compact bar at the bottom.
- At clear, a compact lower dialog says **「僕が見つけた虹です」**. The player presses **OK** when ready to continue, leaving time to take an OS-level screenshot if desired.
- There is no built-in screenshot feature.
- The existing pastel sky, clouds, rain, transparency, gradients, and overall visual direction remain the base presentation.

## Later direction under consideration

- Expand the test from 8 stages toward roughly 16 if the trail/overview loop is fun enough.
- A night transition may reveal a unicorn beyond the rainbow / at the end of the trail.
- Online behavior is intentionally undecided. It does not have to be versus or co-op. A preferred direction is an indirect or surprising use where the player thinks: "Wait, THAT is the online part?"

## Important constraint

The game must remain **offline-first**.

The base game must be playable and completable with no network connection. Any online behavior must be additive rather than required for basic play.

## Open questions

- Is following one rainbow across multiple cloudy screens fun enough to sustain 8 stages? 16?
- How much procedural variation should happen before the rainbow stops reading as one continuous object?
- How should the final overview frame the unicorn reveal?
- What exactly should online presence affect?
