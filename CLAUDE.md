# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A browser-based polyrhythm visualizer and synthesizer. Nodes orbit a central circle at different beat frequencies (node i has i+2 beats per cycle), producing sound when they "bounce." Built with vanilla TypeScript, Canvas 2D rendering, and Tone.js for audio.

## Commands

- `bun install` — install dependencies
- `bun run dev` — dev server with file watching and auto-rebuild (default port 3000, override with `PORT` env var)
- `bun run build` — production build (minified, linked sourcemaps) to `dist/`

No test framework or linter is configured.

## Build System

Bun is both the runtime and bundler. `build.ts` bundles `src/main.ts` for browser target and copies `index.html` + `styles.css` to `dist/`. `dev-server.ts` does the same with inline sourcemaps, serves from `dist/`, and watches `src/` for changes with a 100ms debounce rebuild.

## Architecture

Single mutable `AppState` object (defined in `state.ts`) is shared across all modules — there is no state management library.

- **main.ts** — entry point; creates AudioEngine, Renderer, binds controls, starts the animation loop
- **types.ts** — all shared types (`AppState`, `AppConfig`, `PolyNode`, `Ripple`, `Trail`, scale/synth/bounce enums)
- **state.ts** — global `state` singleton, `createNodes()` to rebuild nodes from config, HSL color generation
- **audio.ts** — `AudioEngine` class wrapping Tone.js; manages a synth-per-node through a compressor→reverb→destination chain; supports sine/triangle/sawtooth/pluck/fm synth types
- **music.ts** — scale interval definitions and `getNoteForNode()` which maps node index to a note name using MIDI math centered around the middle of the node array
- **controls.ts** — DOM event listeners for all UI controls (play/pause, sliders, selects); mutates `state.config` directly and rebuilds audio/nodes as needed
- **renderer.ts** — `Renderer` class running a `requestAnimationFrame` loop; handles DPR-aware canvas sizing, draws background/circle/trails/ripples/nodes; **bounce detection** happens here (sin wave sign change triggers `onBounce` callback which fires audio)

The animation-to-audio coupling is the core design: `renderer.start()` takes an `onBounce(nodeIndex)` callback. The renderer computes each node's position via sin-based oscillation and detects direction changes (`lastBounceDir`). Two bounce modes exist: "center" (nodes bounce from center outward using `|sin|`) and "edge" (nodes traverse full diameter using a triangle wave).
