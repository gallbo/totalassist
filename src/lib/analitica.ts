declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function registrarEvento(event: string) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event });
}
