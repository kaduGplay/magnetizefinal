type ConnectionInfo = {
  saveData?: boolean;
  effectiveType?: string;
};

type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
};

const bundledImages = import.meta.glob(
  "../assets/**/*.{avif,gif,jpeg,jpg,png,svg,webp}",
  { eager: true, import: "default", query: "?url" },
) as Record<string, string>;


const publicImages = [
  "/media/fast_gen_02.jpeg",
  "/media/fast_gen_03.jpeg",
  "/media/fast_gen_04.jpeg",
  "/media/fast_gen_05.jpeg",
  "/media/fast_gen_06.jpeg",
  "/media/fast_gen_07.jpeg",
  "/media/fast_gen_08.jpeg",
  "/media/fast_gen_09.jpeg",
  "/media/fast_gen_10.jpeg",
  "/media/fast_gen_11.jpeg",
  "/media/fast_gen_12.jpeg",
  "/media/fast_gen_13.jpeg",
  "/media/imgi-17-image.webp",
  "/media/imgi-4-image.webp",
  "/media/imgi-9-image.webp",
  "/media/logo.jpeg",
  "/media/PAGAMENTOSEGURO.png",
  "/media/Designsemnome.gif",
];

const warmedUrls = new Set<string>();

const addPreconnect = (origin: string) => {
  if (document.head.querySelector(`link[rel="preconnect"][href="${origin}"]`)) return;
  const link = document.createElement("link");
  link.rel = "preconnect";
  link.href = origin;
  link.crossOrigin = "anonymous";
  document.head.appendChild(link);
};

const preloadImage = (src: string) => new Promise<void>((resolve) => {
  if (warmedUrls.has(src)) {
    resolve();
    return;
  }
  warmedUrls.add(src);
  const image = new Image();
  image.decoding = "async";
  image.onload = () => resolve();
  image.onerror = () => resolve();
  image.src = src;
  if (image.complete) resolve();
});

const runQueue = async (tasks: Array<() => Promise<void>>, concurrency: number) => {
  let nextIndex = 0;
  const worker = async () => {
    while (nextIndex < tasks.length) {
      const task = tasks[nextIndex];
      nextIndex += 1;
      await task();
    }
  };
  await Promise.all(Array.from({ length: concurrency }, worker));
};

let started = false;

export const preloadAppResources = () => {
  if (started || typeof window === "undefined") return;
  started = true;

  [
    window.location.origin,
  ].forEach(addPreconnect);

  const warmEverything = async () => {
    // Primeiro preparamos as telas mais prováveis sem competir com a primeira pintura.
    await Promise.allSettled([
      import("../pages/Dashboard"),
      import("../pages/Checkout"),
      import("../pages/FastGenerations"),
      import("../pages/Auth"),
    ]);

    const connection = (navigator as Navigator & { connection?: ConnectionInfo }).connection;
    const constrainedConnection = connection?.saveData || ["slow-2g", "2g"].includes(connection?.effectiveType ?? "");

    // Vídeos não são mais pré-carregados na entrada do site para não pesar o carregamento inicial.
    const imageSources = [...new Set([
      ...Object.values(bundledImages),
      ...publicImages,
    ])];
    await runQueue(imageSources.map((src) => () => preloadImage(src)), constrainedConnection ? 2 : 4);

    // Páginas secundárias só são preparadas depois de toda a experiência principal.
    await Promise.allSettled([
      import("../pages/ThankYou"),
      import("../pages/Privacy"),
      import("../pages/Terms"),
    ]);
  };

  const idleWindow = window as IdleWindow;
  if (idleWindow.requestIdleCallback) {
    idleWindow.requestIdleCallback(() => void warmEverything(), { timeout: 2000 });
  } else {
    window.setTimeout(() => void warmEverything(), 1000);
  }
};