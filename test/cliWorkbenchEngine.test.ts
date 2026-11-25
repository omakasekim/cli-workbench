import { describe, expect, it } from "vitest";
import {
  SAMPLE_KEYBINDINGS,
  buildYtDlpCommand,
  calculateOllamaVram,
  convertHtmlToMarkdown,
  detectKeybindingCollisions,
} from "../src/core/cliWorkbenchEngine";

describe("cli-workbench engine", () => {
  it("calculates realistic Ollama VRAM budgets and OOM vs full-GPU verdicts", () => {
    const fits = calculateOllamaVram("qwen2.5-coder:14b", "Q4_K_M", 8192, "rtx4090-24", true);
    const oom = calculateOllamaVram("llama3.3:70b", "FP16", 32768, "rtx3060-12", false);
    expect(fits.fit).toBe("FULL_GPU");
    expect(fits.estTokPerSec).toBeGreaterThan(20);
    expect(oom.fit).toBe("OOM");
  });

  it("detects VS Code and Oh-My-Zsh keybinding collisions", () => {
    const collisions = detectKeybindingCollisions(SAMPLE_KEYBINDINGS);
    expect(collisions.some((c) => c.shortcut === "Cmd+K")).toBe(true);
    expect(collisions.some((c) => c.shortcut === "Ctrl+R")).toBe(true);
  });

  it("strips HTML noise in markitdown preview and builds valid yt-dlp commands", () => {
    const res = convertHtmlToMarkdown("<style>.x{}</style><h1>Title</h1><p>Hello <strong>World</strong></p><script>x()</script>");
    expect(res.markdown).toContain("# Title");
    expect(res.savedPct).toBeGreaterThan(30);
    const cmd = buildYtDlpCommand({ url: "https://youtu.be/test", mode: "audio-mp3", subtitles: false, sponsorBlock: true, embedMeta: true });
    expect(cmd).toContain("--audio-format mp3");
    expect(cmd).toContain("--sponsorblock-remove");
  });
});
