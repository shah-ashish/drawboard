// In-memory cache for vector tech icons and logos loaded from Iconify CDN.

const iconCache = new Map<string, HTMLImageElement>();
const listeners = new Set<() => void>();

export function subscribeIconCache(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function notifyListeners() {
  for (const listener of listeners) {
    try {
      listener();
    } catch {
      // Ignore listener error
    }
  }
}

/**
 * Returns the HTMLImageElement if already downloaded and ready.
 * If not yet downloaded, starts downloading asynchronously and notifies listeners when ready.
 */
export function getLoadedIconImage(url: string): HTMLImageElement | null {
  if (!url) return null;

  const cached = iconCache.get(url);
  if (cached) {
    if (cached.complete && cached.naturalWidth > 0) {
      return cached;
    }
    return null;
  }

  // 1. Try downloading with crossOrigin so canvas isn't tainted if possible
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    notifyListeners();
  };
  img.onerror = () => {
    // 2. In VS Code Webview (origin `vscode-webview://`), crossOrigin causes CORS failures
    // on certain CDNs. Retry immediately WITHOUT crossOrigin so the icon displays properly!
    const fallback = new Image();
    fallback.onload = () => {
      iconCache.set(url, fallback);
      notifyListeners();
    };
    fallback.src = url;
  };
  img.src = url;
  iconCache.set(url, img);

  return null;
}
