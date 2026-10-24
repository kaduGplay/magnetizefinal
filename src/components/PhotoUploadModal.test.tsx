import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import PhotoUploadModal from "./PhotoUploadModal";

afterEach(cleanup);

describe("photo upload modal", () => {
  it("shows the chosen template with its video looping behind, so the person knows what they are generating", () => {
    render(
      <PhotoUploadModal
        isOpen
        onClose={() => {}}
        onContinue={() => {}}
        selectedVideoUrl="https://example.com/template.webm"
      />,
    );
    // O Dialog abre em portal no document.body.
    const video = document.querySelector("video");
    expect(video).not.toBeNull();
    expect(video?.getAttribute("src")).toBe("https://example.com/template.webm");
    expect(video?.loop).toBe(true);
    expect(screen.getByText("Template escolhido")).toBeTruthy();
    expect(screen.queryByText("Template neon")).toBeNull();
    expect(screen.getByText("Gere vídeos com fotos da galeria")).toBeTruthy();
    expect(screen.getAllByText("Selecione a foto da pessoa").length).toBeGreaterThan(0);
  });

  it("stays a plain photo picker when no template was chosen", () => {
    render(<PhotoUploadModal isOpen onClose={() => {}} onContinue={() => {}} />);
    expect(document.querySelector("video")).toBeNull();
    expect(screen.queryByText("Template escolhido")).toBeNull();
  });

  it("can submit the retained photo after dismissing its confirmation and reopening the picker", () => {
    URL.createObjectURL = vi.fn(() => "blob:photo");
    URL.revokeObjectURL = vi.fn();
    const onContinue = vi.fn();
    const props = { onClose: vi.fn(), onContinue };
    const { rerender } = render(<PhotoUploadModal {...props} isOpen />);
    const input = document.querySelector('input[type="file"]');
    if (!input) throw new Error("Missing photo input");
    const file = new File(["photo"], "photo.png", { type: "image/png" });
    fireEvent.change(input, { target: { files: [file] } });
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape", code: "Escape" });
    rerender(<PhotoUploadModal {...props} isOpen={false} />);
    rerender(<PhotoUploadModal {...props} isOpen />);
    fireEvent.click(screen.getByRole("button", { name: "Gerar com essa foto" }));
    expect(onContinue).toHaveBeenCalledWith(file);
    expect(onContinue).toHaveBeenCalledTimes(1);
  });
});
