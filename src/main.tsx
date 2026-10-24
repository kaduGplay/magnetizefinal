import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Benign browser notice when layout settles across frames; never treat it as a crash.
const isResizeObserverNotice = (msg: unknown) =>
  typeof msg === "string" && msg.includes("ResizeObserver loop");

window.addEventListener(
  "error",
  (event) => {
    if (isResizeObserverNotice(event.message)) {
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  },
  true,
);

createRoot(document.getElementById("root")!).render(<App />);
