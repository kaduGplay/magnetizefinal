const KEY = "magnetize_generation_intent";

// Only the template is saved; photos stay in memory, never browser storage.
export function saveGenerationIntent(templateUrl: string) {
  sessionStorage.setItem(KEY, templateUrl);
}

export function consumeGenerationIntent(templateUrls: string[]): number | null {
  const saved = sessionStorage.getItem(KEY);
  sessionStorage.removeItem(KEY);
  if (!saved) return null;
  const index = templateUrls.indexOf(saved);
  return index >= 0 ? index : null;
}

export function clearGenerationIntent() {
  sessionStorage.removeItem(KEY);
}