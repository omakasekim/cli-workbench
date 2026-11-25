# cli-workbench

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-10B981?style=for-the-badge)](https://omakasekim.github.io/cli-workbench/)
[![CLI Companion](https://img.shields.io/badge/Plugin-Node%20CLI-0EA5E9?style=for-the-badge)](#plugin-installation)
[![License: MIT](https://img.shields.io/badge/License-MIT-8B5CF6?style=for-the-badge)](LICENSE)

> **`ollama` Local VRAM & Quantization Matrix, `ohmyzsh`/`vscode` Startup Flamegraph + Keybinding Collision Radar & `markitdown`/`yt-dlp`/Grid Studio**.

## Target GitHub Ecosystems

| Ecosystem | Capability in `cli-workbench` |
| --- | --- |
| `ollama/ollama` | Model × Quantization × Context Length × GPU/Apple Silicon VRAM & tok/s matrix with ready-to-run CLI flags |
| `ohmyzsh/ohmyzsh` · `microsoft/vscode` | Interactive lazy-load startup flamegraph, keybinding collision detector, and `.zshrc` prompt builder |
| `microsoft/markitdown` · `yt-dlp/yt-dlp` · `twbs/bootstrap` | HTML→Markdown LLM token-savings inspector, visual `yt-dlp` pipeline builder, and 12-col responsive ruler |

## Architecture

```mermaid
flowchart LR
  A[Hardware / Zsh / HTML / Media Inputs] --> B[cliWorkbenchEngine.ts]
  B --> C[Ollama VRAM & Speed Matrix]
  B --> D[Zsh & VS Code Flamegraph]
  B --> E[markitdown · yt-dlp · Grid Studio]
  C & D & E --> F[WorkbenchShell: ⌘K · #state= · SVG/PNG/MD/JSON/.zshrc]
```

## Quickstart

```bash
npm install
npm run dev
```

Run tests and production build:

```bash
npm test && npm run build
```

## Plugin Installation

Run the zero-dependency local diagnostic CLI companion:

```bash
node plugin/cli.mjs --demo
```

## License

[MIT](LICENSE)
