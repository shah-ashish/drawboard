import { WhiteboardElement } from '../types/elements';
import { Camera } from '../types/canvas';
import { loadElementsFromFile, saveElementsToFile } from './storage';

declare global {
  interface Window {
    acquireVsCodeApi?: () => {
      postMessage: (msg: unknown) => void;
      setState: (state: unknown) => void;
      getState: () => unknown;
    };
  }
}

let vscodeApi: ReturnType<NonNullable<typeof window.acquireVsCodeApi>> | null = null;

export function isVsCodeEnvironment(): boolean {
  return typeof window !== 'undefined' && typeof window.acquireVsCodeApi === 'function';
}

export function getVsCodeApi() {
  if (!vscodeApi && isVsCodeEnvironment()) {
    try {
      vscodeApi = window.acquireVsCodeApi!();
    } catch {
      // In case acquireVsCodeApi was already called
    }
  }
  return vscodeApi;
}

export interface DrawboardDocumentData {
  elements: WhiteboardElement[];
  camera?: Camera;
}

/**
 * Initializes synchronization with VS Code if in extension mode,
 * or with local storage if running in browser dev mode.
 */
export function initDocumentSync(callbacks: {
  onLoad: (data: DrawboardDocumentData) => void;
}): () => void {
  const vscode = getVsCodeApi();

  if (vscode) {
    // 1. VS Code Extension Mode
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (!message || typeof message !== 'object') return;

      if (message.type === 'init' || message.type === 'sync') {
        const elements = Array.isArray(message.elements) ? message.elements : [];
        callbacks.onLoad({
          elements,
          camera: message.camera
        });
      }
    };

    window.addEventListener('message', handleMessage);

    // Notify extension that webview is mounted and ready for data
    vscode.postMessage({ type: 'ready' });

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  } else {
    // 2. Standalone Browser Mode (npm run dev)
    loadElementsFromFile().then(elements => {
      callbacks.onLoad({ elements });
    });

    return () => {};
  }
}

/**
 * Saves document state. Sends update to VS Code host if in extension mode,
 * or writes to /api/shapes if in browser dev mode.
 */
export function syncDocumentChange(elements: WhiteboardElement[], camera?: Camera): void {
  const vscode = getVsCodeApi();
  if (vscode) {
    vscode.postMessage({
      type: 'change',
      elements,
      camera
    });
  } else {
    saveElementsToFile(elements);
  }
}

/**
 * Triggers immediate file save to disk (called on Ctrl+S / Cmd+S).
 */
export function saveDocumentImmediate(elements: WhiteboardElement[], camera?: Camera): void {
  const vscode = getVsCodeApi();
  if (vscode) {
    vscode.postMessage({
      type: 'save',
      elements,
      camera
    });
  } else {
    saveElementsToFile(elements);
  }
}
