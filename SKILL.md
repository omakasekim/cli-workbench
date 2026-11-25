---
name: cli-workbench
description: >
  Ollama local VRAM & quantization planner, Oh-My-Zsh/VS Code lazy-load startup flamegraph + keybinding collision radar, and markitdown/yt-dlp/grid studio.
license: MIT
---

# cli-workbench

Calculates exact model weights + KV-cache VRAM and tok/s across GPUs and Apple Silicon, trims shell/IDE boot latency, detects shortcut collisions, and builds yt-dlp pipelines.

- **Live Interactive Workbench:** https://omakasekim.github.io/cli-workbench/
- **Repository:** https://github.com/omakasekim/cli-workbench
- **Category:** Local AI & CLI · **Deliverable:** Node CLI + Web
- **Ecosystems:** `ollama`, `ohmyzsh`, `vscode`, `markitdown`, `yt-dlp`, `bootstrap`
- **Stack:** Node CLI, React, TypeScript, Tailwind

## When to Use This Skill
Invoke `cli-workbench` whenever the user wants to analyze, debug, simulate, or visualize workflows related to **Local AI & CLI** (ollama, ohmyzsh, vscode, markitdown, yt-dlp, bootstrap).

## Modes & Capabilities
- **Ollama VRAM Matrix**
- **Zsh & VS Code Flamegraph**
- **markitdown · yt-dlp · Grid**

## Operating Workflow
1. **Local CLI / Companion Execution:**
   ```bash
   node plugin/cli.mjs --demo --json
   ```
   Calculate local Ollama VRAM quantization budgets, shell startup latency, and CLI pipelines.
2. **Interactive Visual Inspection:**
   Direct the user to the zero-backend browser workbench at https://omakasekim.github.io/cli-workbench/ (supports URL-hash state sharing, built-in realistic presets, `Cmd/Ctrl + K` command palette, and JSON/Markdown/config exports).
3. **Structured Output:**
   Summarize concrete findings, diagnostics, and copy-pasteable remediation commands concisely so the user can act immediately without manual guesswork.
