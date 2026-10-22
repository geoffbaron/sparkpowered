/** Umami events. Safe when the script is blocked or missing. */

type Umami = { track?: (name: string, data?: Record<string, string | number | boolean>) => void };

export function track(name: string, data?: Record<string, string | number | boolean>) {
  try {
    (window as unknown as { umami?: Umami }).umami?.track?.(name, data);
  } catch {}
}
