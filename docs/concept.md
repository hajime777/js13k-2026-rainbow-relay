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

- A run is a finite **seeded rainbow world**, closer to Minecraft-style world generation than a fixed stage list.
- A random numeric seed is created on first load and shown in the Seed input at the bottom.
- Numeric seed text is used directly as the 32-bit world/genome ID. Non-numeric text such as `unicorn` is deterministically hashed to a 32-bit ID.
- The same seed therefore produces the same rainbow world on different clients.
- The world is always finite: **minimum 4 screens, maximum 32 screens**.
- Stage 1 rises from the bottom of the portrait screen and turns about 90 degrees toward either the left or right edge so the first reveal reads immediately as a conventional rainbow.
- Stage 1 keeps regular, even color bands.
- Initial cloud/rain placement is also seeded for the same stage/world position.
- The generated final segment may end inside the sky, at a side edge, or naturally return to the bottom edge. This is derived from mixed seed detail, not from a dedicated ending-shape gene.

## Seed as a compact rainbow genome

The 32-bit seed is not treated only as an opaque PRNG initializer. It also acts as a compact, controllable **rainbow genome**.

The current genome exposes broad tendencies:

- **length**: preferred world length / rarity of a long run.
- **bend**: how strongly later segments curve away from a plain path.
- **width**: how much the rainbow expands/contracts through a segment and its overall later-stage band scale.
- **twist**: center-line wiggle plus relative band displacement through the middle of a segment.
- **color**: how strongly the seven color-band widths differ from one another.
- **turn**: how likely the generated route is to turn instead of continuing straight.
- **branch**: reserved in the genome now for later seeded branching; actual route branching is not implemented yet.
- **detail**: low-level variation used so related genomes can still have different local shapes/routes.

**Important design rule:** the genome must not contain direct shape labels such as `arc`, `classic`, `S-curve`, `ground-return`, or exact route templates. Those would make the mapping obvious and would turn seed discovery into disguised authored stage data.

High-level traits only bias broad statistical behavior. Local routes, exact curves, and ending behavior still emerge from deterministic mixing of the whole seed. This keeps the seed space controllable without making a numeric seed trivially decode into a visible shape.

`seedFromGenes()` can synthesize a numeric seed from requested broad tendencies, and `seedGenes()` decodes those tendencies. Shape-level goals are evaluated only **after generation** as phenotype scores.

## Seed forge development tool

`tools/seed-forge.mjs` is a development-only tool and is not part of the submission ZIP.

Strange-rainbow example:

```powershell
npm run seed:forge -- --length 12:20 --twist high --width high --color high --turn .6 --count 8
```

The forge constructs a small family of genomes matching the requested broad tendencies, varies only a limited detail component, traces those candidates, and ranks them. It deliberately does **not** scan the whole 32-bit seed space.

### Classic-rainbow phenotype search

A conventional "ground -> sky -> ground" rainbow is deliberately **not** represented by a `classic` or `arc` gene.

Instead, the forge can ask for a **classic phenotype**:

```powershell
npm run seed:forge -- --profile classic --length 8 --count 8
```

For this profile the forge uses broadly calm tendencies, evaluates the 32 possible low-level `detail` variants of that one genome family, then ranks the generated results by properties such as:

- ending on the same global ground line where the rainbow began,
- rising meaningfully above that ground,
- having useful horizontal span,
- avoiding excessive revisits/loops,
- keeping the route reasonably simple.

This is an inverse-design helper at the phenotype level, not a hidden shape template. One current regression/example candidate is Seed `2316340504`: its generated eight-screen route returns to the original ground line.

The returned numeric Seed values can be pasted directly into the game.

## Rainbow trail movement

- Each cleared segment leads into the neighboring logical screen at the segment's outgoing edge.
- Pressing **OK** plays a short directional screen-scroll transition so it feels like the view follows the rainbow into that neighboring cloudy sky.
- Shared segment boundaries must line up exactly. The first 90-degree arc and Stage 2 use the same edge anchor, and color-band offsets return to their base positions at screen boundaries.
- The route remains river-like. The genome's **turn** trait changes the straight-vs-turn tendency, while an immediate reversal through the same entry edge is not generated.
- Later curves use the genome's bend/twist traits plus local deterministic detail.
- Later rainbow segments can have different color-band widths, and the band spacing gently expands/contracts and shifts through the middle of a segment.
- Those thickness/twist changes fade back to the common boundary profile near screen edges so adjacent screens still connect cleanly.
- Longer loops, revisits, overlaps, and crossings can still happen.
- The final generated segment does not continue to another screen; its deterministic endpoint may be interior, side, or ground.

## Logic-test strategy

- Logic tests use a small, explicitly selected Seed list rather than brute-forcing many random seeds.
- Override that list with `RAINBOW_TEST_SEEDS` when a newly discovered problematic Seed should become a regression case.
- For each selected Seed, tests verify finite termination, route-entry continuity, geometry touching the declared edges, and seven-band continuity across every screen boundary.
- Additional tests construct low/high broad genome traits directly to verify that twist and color tendencies actually change the intended geometry.
- A fixed classic candidate is tested directly; tests do not search for classic seeds.

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

- Implement the already-reserved **branch** gene as real seeded route branching, so the same seed exposes the same choices to every player.
- Explore whether nearby numeric genomes can be presented as recognizable "families" of related rainbows without making exact visible shapes directly decodable.
- Refine phenotype scores using actual visual/gameplay observations rather than making the score itself the game design.
- A night transition may reveal a unicorn beyond the rainbow / at the end of the trail.
- Online behavior is intentionally undecided. It does not have to be versus or co-op. A preferred direction is an indirect or surprising use where the player thinks: "Wait, THAT is the online part?"

## Important constraints

- The game must remain **offline-first**.
- The final compressed submission must remain within the js13k **13,312-byte** limit.
- Seed generation should remain code-driven rather than storing authored world/stage data.
- Direct visible-shape genes/templates are intentionally avoided.
- The development-only seed forge must stay outside the final ZIP.

## Open questions

- Which broad genome ranges actually produce rainbows that are strange but still visually readable as rainbows?
- How should the branch gene map to real branching without making the route confusing?
- How should phenotype/God Score be calibrated from play/visual feedback?
- How should the final overview frame the unicorn reveal?
- What exactly should online presence affect?
