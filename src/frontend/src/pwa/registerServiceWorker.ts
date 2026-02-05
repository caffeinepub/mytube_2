/**
 * Service Worker registration helper
 * Handles registration with proper error handling and browser compatibility checks
 */

export function registerServiceWorker(): void {
  // Only register in production and if service workers are supported
  if (import.meta.env.MODE !== 'production') {
    console.log('[PWA] Service worker registration skipped in development mode');
    return;
  }

  if (!('serviceWorker' in navigator)) {
    console.log('[PWA] Service workers are not supported in this browser');
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[PWA] Service worker registered successfully:', registration.scope);

        // Check for updates periodically
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[PWA] New content available; please refresh');
                // Optionally notify user about update
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('[PWA] Service worker registration failed:', error);
      });
  });
}

/**
 * Unregister all service workers (useful for debugging)
 */
export async function unregisterServiceWorker(): Promise<void> {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
      console.log('[PWA] Service worker unregistered');
    }
  }
}

/**
 * Check if the app is running in standalone mode (installed PWA)
 */
export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

/**
 * Check if the app is currently offline
 */
export function isOffline(): boolean {
  return !navigator.onLine;
}
