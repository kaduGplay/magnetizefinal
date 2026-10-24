import { fireEvent, render, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import VideoTemplatesModal from "./VideoTemplatesModal";
import VideoCategoryModal from "./VideoCategoryModal";
import GenerationChoiceModal from "./GenerationChoiceModal";
import * as exampleLinks from "@/lib/videoExampleLinks";

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}));
vi.mock("./TemplateUploadModal", () => ({ default: () => null }));

const knownLinks = new Set<string>(Object.values(exampleLinks));

beforeEach(() => {
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const srcsOf = (container: HTMLElement) =>
  [...container.querySelectorAll("video")]
    .map((v) => v.getAttribute("src"))
    .filter((s): s is string => Boolean(s));

describe("complete example video links", () => {
  it("uses the complete link unchanged in the dashboard template picker", () => {
    const { container } = render(
      <VideoTemplatesModal isOpen onClose={() => {}} onSelectTemplate={() => {}} />,
    );
    const srcs = srcsOf(container);
    expect(srcs.length).toBeGreaterThan(0);
    // cada vídeo usa exatamente o endereço da lista compartilhada, sem acréscimos
    srcs.forEach((s) => expect(knownLinks.has(s)).toBe(true));
    expect(srcs).toContain(exampleLinks.cowgirlVideo);
  });

  it("uses the same complete link unchanged in video categories", () => {
    const { container } = render(
      <VideoCategoryModal isOpen onClose={() => {}} onSelectCategory={() => {}} uploadedImage={null} />,
    );
    const srcs = srcsOf(container);
    expect(srcs.length).toBeGreaterThan(0);
    srcs.forEach((s) => expect(knownLinks.has(s)).toBe(true));
    expect(srcs).toContain(exampleLinks.cowgirlVideo);
  });

  it("passes the complete link unchanged when selecting a video after upload", () => {
    const onSelect = vi.fn();
    const { getByRole } = render(
      <GenerationChoiceModal isOpen onClose={() => {}} photoUrl={null} onSelect={onSelect} />,
    );
    fireEvent.click(getByRole("button", { name: /Gerar vídeo/ }));
    fireEvent.click(getByRole("button", { name: /Cowgirl Reverso/ }));
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ type: "video", mediaSrc: exampleLinks.cowgirlVideo }),
    );
  });
});
