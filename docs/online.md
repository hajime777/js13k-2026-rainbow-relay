# Online Design Guardrails

## Offline-first is non-negotiable

The core game must run, be understandable, and be completable with no network connection.

Online behavior must be optional enhancement only.

## Current design preference

Do not assume the final online feature is versus or co-op.

A more interesting target may be an indirect effect where another player's existence changes the world in a subtle way and the player later realizes that the effect was online-driven.

Examples to explore later, not decisions yet:

- another player's activity briefly affects light, stars, cloud gaps, or rainbow color
- current room population changes ambience without changing win/loss conditions
- transient traces from other players appear and fade
- a unicorn constellation becomes richer while other people are present

## Failure behavior

If the relay is unavailable or the user is offline:

- no blocking error screen
- no login requirement
- no missing core mechanic
- continue as a normal solo game

## Persistence assumption

Do not design around permanent server storage. Treat online room state as transient unless the contest rules explicitly provide otherwise.

This transience may become part of the work's identity: a shared sky can exist only while somebody is still there.
