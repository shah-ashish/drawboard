import * as vscode from 'vscode';
import { getHtmlForWebview } from './htmlProvider';

/**
 * Custom Text Editor Provider for Drawboard (.bd) files.
 */
export class DrawboardEditorProvider implements vscode.CustomTextEditorProvider {
  public static readonly viewType = 'drawboard.board';

  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new DrawboardEditorProvider(context);
    return vscode.window.registerCustomEditorProvider(
      DrawboardEditorProvider.viewType,
      provider,
      {
        webviewOptions: {
          retainContextWhenHidden: true
        },
        supportsMultipleEditorsPerDocument: false
      }
    );
  }

  constructor(private readonly context: vscode.ExtensionContext) {}

  public async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    const webview = webviewPanel.webview;

    webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview')
      ]
    };

    webview.html = getHtmlForWebview(this.context, webview);

    let isInternalUpdate = false;

    const messageListener = webview.onDidReceiveMessage(async (message: any) => {
      if (!message || typeof message !== 'object') return;

      if (message.type === 'ready') {
        this.postDocumentToWebview(document, webview, 'init');
      } else if (message.type === 'change' || message.type === 'save') {
        const serialized = JSON.stringify(
          {
            version: 1,
            app: 'drawboard',
            elements: message.elements || [],
            camera: message.camera || { x: 0, y: 0, zoom: 1 }
          },
          null,
          2
        );

        if (document.getText() !== serialized) {
          isInternalUpdate = true;
          const edit = new vscode.WorkspaceEdit();
          const fullRange = new vscode.Range(
            document.positionAt(0),
            document.positionAt(document.getText().length)
          );
          edit.replace(document.uri, fullRange, serialized);
          await vscode.workspace.applyEdit(edit);
          isInternalUpdate = false;
        }

        if (message.type === 'save') {
          await document.save();
        }
      }
    });

    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
      if (e.document.uri.toString() === document.uri.toString() && !isInternalUpdate) {
        this.postDocumentToWebview(document, webview, 'sync');
      }
    });

    webviewPanel.onDidDispose(() => {
      messageListener.dispose();
      changeDocumentSubscription.dispose();
    });
  }

  private postDocumentToWebview(
    document: vscode.TextDocument,
    webview: vscode.Webview,
    type: 'init' | 'sync'
  ) {
    const rawText = document.getText().trim();
    let data: any = { elements: [], camera: { x: 0, y: 0, zoom: 1 } };

    if (rawText.length > 0) {
      try {
        const parsed = JSON.parse(rawText);
        if (Array.isArray(parsed.elements)) {
          data = parsed;
        } else if (Array.isArray(parsed)) {
          data = { elements: parsed };
        }
      } catch {
        // Fallback to empty if invalid JSON
      }
    }

    webview.postMessage({
      type,
      elements: data.elements || [],
      camera: data.camera || { x: 0, y: 0, zoom: 1 }
    });
  }
}
