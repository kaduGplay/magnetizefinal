import { render } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import AutoplayVideo from "./AutoplayVideo";

describe("AutoplayVideo", () => {
  it("marca o vídeo como mudo e sem controles para o autoplay disparar sozinho", () => {
    const { container } = render(<AutoplayVideo src="https://example.com/a.webm" />);
    const video = container.querySelector("video") as HTMLVideoElement;

    expect(video.getAttribute("muted")).not.toBeNull();
    expect(video.muted).toBe(true);
    expect(video.getAttribute("playsinline")).not.toBeNull();
    expect(video.getAttribute("autoplay")).not.toBeNull();
    expect(video.loop).toBe(true);
    expect(video.hasAttribute("controls")).toBe(false);
  });

  it("esconde o botão de play/pausa nativo do navegador em todos os vídeos", () => {
    const css = readFileSync(join(process.cwd(), "src/index.css"), "utf8");
    expect(css).toContain("video::-webkit-media-controls-start-playback-button");
    expect(css).toContain("video::-webkit-media-controls-overlay-play-button");
    expect(css).toMatch(/video::-webkit-media-controls[\s\S]*?display:\s*none\s*!important/);
  });
});
