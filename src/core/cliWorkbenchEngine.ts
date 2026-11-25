export type Quantization = "Q4_K_M" | "Q5_K_M" | "Q8_0" | "FP16";

export interface OllamaModelSpec {
  id: string;
  tag: string;
  name: string;
  paramsB: number;
  layers: number;
  kvHeads: number;
  headDim: number;
}

export interface HardwareSpec {
  id: string;
  name: string;
  vramGb: number;
  bandwidthGbS: number;
  kind: "GPU" | "Unified Memory";
}

export const OLLAMA_MODELS: OllamaModelSpec[] = [
  { id: "qwen2.5-coder:14b", tag: "qwen2.5-coder:14b", name: "Qwen 2.5 Coder 14B", paramsB: 14.7, layers: 48, kvHeads: 8, headDim: 128 },
  { id: "gemma3:27b", tag: "gemma3:27b", name: "Gemma 3 27B", paramsB: 27.4, layers: 62, kvHeads: 16, headDim: 128 },
  { id: "qwen2.5-coder:32b", tag: "qwen2.5-coder:32b", name: "Qwen 2.5 Coder 32B", paramsB: 32.5, layers: 64, kvHeads: 8, headDim: 128 },
  { id: "llama3.3:70b", tag: "llama3.3:70b", name: "Llama 3.3 70B", paramsB: 70.6, layers: 80, kvHeads: 8, headDim: 128 },
  { id: "deepseek-r1:8b", tag: "deepseek-r1:8b", name: "DeepSeek-R1 Distill 8B", paramsB: 8.0, layers: 32, kvHeads: 8, headDim: 128 },
];

export const HARDWARE_TARGETS: HardwareSpec[] = [
  { id: "rtx3060-12", name: "NVIDIA RTX 3060 (12 GB)", vramGb: 12, bandwidthGbS: 360, kind: "GPU" },
  { id: "rtx4090-24", name: "NVIDIA RTX 4090 (24 GB)", vramGb: 24, bandwidthGbS: 1008, kind: "GPU" },
  { id: "m4-pro-24", name: "Apple M4 Pro (24 GB Unified)", vramGb: 18, bandwidthGbS: 273, kind: "Unified Memory" },
  { id: "m4-max-64", name: "Apple M4 Max (64 GB Unified)", vramGb: 48, bandwidthGbS: 546, kind: "Unified Memory" },
  { id: "m2-ultra-192", name: "Apple M2 Ultra (192 GB Unified)", vramGb: 144, bandwidthGbS: 800, kind: "Unified Memory" },
];

const BYTES_PER_PARAM: Record<Quantization, number> = {
  Q4_K_M: 0.62,
  Q5_K_M: 0.74,
  Q8_0: 1.08,
  FP16: 2.0,
};

export interface VramEstimate {
  weightsGb: number;
  kvCacheGb: number;
  overheadGb: number;
  totalGb: number;
  headroomGb: number;
  fit: "FULL_GPU" | "PARTIAL_OFFLOAD" | "OOM";
  estTokPerSec: number;
  command: string;
}

export function calculateOllamaVram(
  modelId: string,
  quant: Quantization,
  contextTokens: number,
  hardwareId: string,
  flashAttn = true
): VramEstimate {
  const model = OLLAMA_MODELS.find((m) => m.id === modelId) ?? OLLAMA_MODELS[0];
  const hw = HARDWARE_TARGETS.find((h) => h.id === hardwareId) ?? HARDWARE_TARGETS[1];

  const weightsGb = Number((model.paramsB * BYTES_PER_PARAM[quant]).toFixed(2));
  // KV cache bytes = 2 (K+V) * layers * kvHeads * headDim * ctx * 2B (fp16), reduced by ~35% with flash/q8 kv
  const kvBytes = 2 * model.layers * model.kvHeads * model.headDim * contextTokens * (flashAttn ? 1.3 : 2.0);
  const kvCacheGb = Number((kvBytes / 1024 ** 3).toFixed(2));
  const overheadGb = Number((0.65 + model.paramsB * 0.015).toFixed(2));
  const totalGb = Number((weightsGb + kvCacheGb + overheadGb).toFixed(2));
  const headroomGb = Number((hw.vramGb - totalGb).toFixed(2));

  let fit: VramEstimate["fit"] = "FULL_GPU";
  let speedFactor = 0.72;
  if (totalGb > hw.vramGb * 1.45) {
    fit = "OOM";
    speedFactor = 0.08;
  } else if (totalGb > hw.vramGb) {
    fit = "PARTIAL_OFFLOAD";
    speedFactor = 0.24;
  }

  const estTokPerSec = Number(Math.max(1.2, (hw.bandwidthGbS / Math.max(1.5, weightsGb + kvCacheGb * 0.25)) * speedFactor).toFixed(1));
  const quantSuffix = quant === "Q4_K_M" ? "" : `-${quant.toLowerCase()}`;
  const command = `OLLAMA_FLASH_ATTENTION=${flashAttn ? 1 : 0} OLLAMA_CONTEXT_LENGTH=${contextTokens} ollama run ${model.tag}${quantSuffix}`;

  return { weightsGb, kvCacheGb, overheadGb, totalGb, headroomGb, fit, estTokPerSec, command };
}

export interface StartupSpan {
  id: string;
  host: "ohmyzsh" | "vscode";
  name: string;
  ms: number;
  lazyMs: number;
  lazyEnabled: boolean;
  tip: string;
}

export const DEFAULT_STARTUP_SPANS: StartupSpan[] = [
  { id: "nvm", host: "ohmyzsh", name: "nvm.sh (eager init)", ms: 460, lazyMs: 14, lazyEnabled: false, tip: "Wrap nvm/node/npm in lazy loader function or switch to fnm" },
  { id: "conda", host: "ohmyzsh", name: "conda initialize hook", ms: 340, lazyMs: 18, lazyEnabled: false, tip: "Set auto_activate_base: false and lazy-load conda" },
  { id: "compinit", host: "ohmyzsh", name: "compinit full rescan", ms: 190, lazyMs: 22, lazyEnabled: false, tip: "Cache ~/.zcompdump with `compinit -C` once every 24h" },
  { id: "git-prompt", host: "ohmyzsh", name: "gitstatus / async prompt", ms: 95, lazyMs: 18, lazyEnabled: true, tip: "Use Powerlevel10k instant prompt or Starship async worker" },
  { id: "ts-server", host: "vscode", name: "vscode.typescript-language-features", ms: 380, lazyMs: 85, lazyEnabled: false, tip: "Enable workspace-scoped activation instead of '*' startup" },
  { id: "ext-gitlens", host: "vscode", name: "eamodio.gitlens", ms: 265, lazyMs: 60, lazyEnabled: false, tip: "Disable eager blame annotations on large monorepos" },
  { id: "ext-copilot", host: "vscode", name: "github.copilot-chat", ms: 210, lazyMs: 70, lazyEnabled: true, tip: "Defer panel hydration until chat view is focused" },
];

export interface KeybindingEntry {
  shortcut: string;
  source: string;
  command: string;
  when: string;
}

export const SAMPLE_KEYBINDINGS: KeybindingEntry[] = [
  { shortcut: "Cmd+K", source: "VS Code Core", command: "workbench.action.terminal.clear", when: "terminalFocus" },
  { shortcut: "Cmd+K", source: "AI Inline Chat", command: "inlineChat.start", when: "editorTextFocus" },
  { shortcut: "Cmd+K", source: "Custom User", command: "workbench.action.quickOpen", when: "global" },
  { shortcut: "Ctrl+R", source: "Oh-My-Zsh", command: "history-incremental-search-backward", when: "zsh" },
  { shortcut: "Ctrl+R", source: "Atuin / fzf", command: "fzf-history-widget", when: "zsh" },
  { shortcut: "Cmd+Shift+P", source: "VS Code Core", command: "workbench.action.showCommands", when: "global" },
];

export function detectKeybindingCollisions(entries: KeybindingEntry[]) {
  const byKey = new Map<string, KeybindingEntry[]>();
  for (const e of entries) {
    const k = e.shortcut.toLowerCase();
    byKey.set(k, [...(byKey.get(k) ?? []), e]);
  }
  return Array.from(byKey.entries())
    .filter(([, list]) => list.length > 1)
    .map(([shortcut, items]) => ({ shortcut: items[0].shortcut, items }));
}

export function convertHtmlToMarkdown(html: string): { markdown: string; htmlTokens: number; mdTokens: number; savedPct: number } {
  const markdown = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "# $1\n\n")
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "## $1\n\n")
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "- $1\n")
    .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, "`$1`")
    .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "**$1**")
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "$1\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const htmlTokens = Math.max(1, Math.ceil(html.length / 4));
  const mdTokens = Math.max(1, Math.ceil(markdown.length / 4));
  const savedPct = Math.max(0, Math.round(((htmlTokens - mdTokens) / htmlTokens) * 100));
  return { markdown, htmlTokens, mdTokens, savedPct };
}

export interface YtDlpOptions {
  url: string;
  mode: "best-mp4" | "audio-mp3" | "4k-av1";
  subtitles: boolean;
  sponsorBlock: boolean;
  embedMeta: boolean;
}

export function buildYtDlpCommand(opts: YtDlpOptions): string {
  const flags: string[] = ["yt-dlp"];
  if (opts.mode === "audio-mp3") {
    flags.push("-x", "--audio-format mp3", "--audio-quality 0");
  } else if (opts.mode === "4k-av1") {
    flags.push('-f "bv*[vcodec^=av01][height<=2160]+ba/b"');
  } else {
    flags.push('-f "bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]"', "--merge-output-format mp4");
  }
  if (opts.subtitles) flags.push("--write-auto-subs", "--sub-langs en.*", "--embed-subs");
  if (opts.sponsorBlock) flags.push("--sponsorblock-remove sponsor,selfpromo");
  if (opts.embedMeta) flags.push("--embed-metadata", "--embed-thumbnail");
  flags.push('-o "%(uploader)s/%(title)s [%(id)s].%(ext)s"');
  flags.push(`"${opts.url.trim() || "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}"`);
  return flags.join(" \\\n  ");
}
