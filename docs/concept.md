# Rainbow Relay - Concept Notes

## Current core

- Pastel visual direction.
- The starting scene is a cloudy/rainy overcast sky.
- The player scrubs/rubs the screen to reveal the blue sky and hidden rainbow.
- Foreground clouds also get pushed in the drag direction and scatter while fading; clouds do not collide with each other at this stage.
- Progress is based on how much of the current rainbow segment has been revealed.
- A stage clears when 90% of the visible rainbow segment has been revealed.
- Clearing does not advance automatically. The player can pause on the cleared screen, then press **OK** to follow the rainbow onward.
- **Restart** always returns to Stage 1 while keeping the current seed.

## Seeded rainbow worlds

- The game now treats a run as a finite **seeded rainbow world**, closer to Minecraft-style world generation than a fixed stage list.
- A random seed is created on first load and shown in a compact Seed input at the bottom.
- The player can replace the seed and press **Go** (or Enter) to regenerate the world.
- Seed text is hashed to a deterministic 32-bit world seed. The same seed text therefore produces the same rainbow world on different clients.
- The world length is also seed-derived and always finite: **minimum 4 screens, maximum 32 screens**.
- Stage 1 remains a conventional semicircular rainbow so the first reveal immediately reads as a normal rainbow. The seed determines whether it is traversed left-to-right or right-to-left.
- Later route direction, edge positions, curve bends/wiggles, rainbow band widths, and band spacing are derived from the world seed instead of `Math.random()` or per-stage data.
- Initial cloud/rain placement is also seeded for the same stage/world position, while the core compatibility promise is specifically that the same seed produces the same rainbow world.
- Branching is not implemented yet. The generator is structured around a world seed and logical coordinates so branching can be added later without replacing the seed model.

## Rainbow trail movement

- Each cleared segment leads into the neighboring logical screen at the segment's outgoing edge.
- Pressing **OK** plays a short directional screen-scroll transition so it feels like the view follows the rainbow into that neighboring cloudy sky.
- Later segments can turn, double back, revisit a previous logical screen, or overlap. Geometric contradictions are acceptable; the intended feeling is closer to following a snake/river than navigating a physically strict world.
- The final generated segment does not continue through another screen edge. Its rainbow ends inside the screen.

## Final overview

- At the seed-generated final screen, pressing **OK** shows an overview of the rainbow trail actually followed by the player.
- The overview is reconstructed from the actual rainbow geometry recorded from cleared screens, rather than drawing a separate pre-authored final rainbow.
- For each cleared stage, the runtime records its logical map position plus the generated band paths and widths.
- Revisited logical screens are intentionally overlaid, so the final trail can cross or contradict itself.
- No screenshots or image files are stored for this reconstruction; only lightweight runtime geometry is kept.
- The overview is intended to create the reveal: "So this is the rainbow I followed."

## Current presentation direction

- The playable view is portrait, including on desktop/Windows.
- The portrait playfield uses a 9:16 frame and is centered inside wider desktop browser windows.
- The upper HUD contains only the title.
- Reveal progress is a compact bar at the bottom.
- A compact Seed field is also kept at the bottom so a world can be shared/replayed by seed without expanding the top HUD.
- At clear, a compact lower dialog says **「僕が見つけた虹です」**. The player presses **OK** when ready to continue, leaving time to take an OS-level screenshot if desired.
- There is no built-in screenshot feature.
- The existing pastel sky, clouds, rain, transparency, gradients, and overall visual direction remain the base presentation.

## Later direction under consideration

- Add rare seeded branching so the same seed exposes the same choices to every player.
- Explore "god seeds" with unusually short/long trails, loops, crossings, or striking overall shapes without hard-coding special seeds.
- A night transition may reveal a unicorn beyond the rainbow / at the end of the trail.
- Online behavior is intentionally undecided. It does not have to be versus or co-op. A preferred direction is an indirect or surprising use where the player thinks: "Wait, THAT is the online part?"

## Important constraints

- The game must remain **offline-first**.
- The final compressed submission must remain within the js13k **13,312-byte** limit.
- Seed generation should remain code-driven rather than storing authored world/stage data.

## Open questions

- What distribution of 4-32 screen world lengths feels best?
- How often should a seeded world branch once branching is added?
- What makes a "god seed" interesting enough to share?
- How should the final overview frame the unicorn reveal?
- What exactly should online presence affect?
