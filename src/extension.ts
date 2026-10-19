import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
  // Register Drawboard Custom Text Editor for .bd files
  context.subscriptions.push(DrawboardEditorProvider.register(context));

  // Command: Create new Drawboard file
  const newBoardCommand = vscode.commands.registerCommand('drawboard.newBoard', async () => {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    const defaultUri = workspaceFolders && workspaceFolders.length > 0
      ? vscode.Uri.joinPath(workspaceFolders[0].uri, 'diagram.bd')
      : undefined;

    const fileUri = await vscode.window.showSaveDialog({
      defaultUri,
      filters: {
        'Drawboard Diagram (*.bd)': ['bd'],
        'All Files': ['*']
      }
    });

    if (fileUri) {
      const initialContent = JSON.stringify(
        {
          version: 1,
          app: 'drawboard',
          elements: [],
          camera: { x: 0, y: 0, zoom: 1 }
        },
        null,
        2
      );

      await vscode.workspace.fs.writeFile(fileUri, Buffer.from(initialContent, 'utf8'));
      await vscode.commands.executeCommand('vscode.openWith', fileUri, DrawboardEditorProvider.viewType);
    }
  });

  context.subscriptions.push(newBoardCommand);
}

export function deactivate() {}

/**
 * Custom Text Editor Provider for Drawboard (.bd) files.
 */
class DrawboardEditorProvider implements vscode.CustomTextEditorProvider {
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

    // Allow loading webview scripts and resources from dist/webview
    webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview')
      ]
    };

    webview.html = this.getHtmlForWebview(webview);

    let isInternalUpdate = false;

    // Send initial document content when webview announces it is ready
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

    // Handle external document changes (git checkout, undo/redo in editor, disk changes)
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
        // Fallback to empty if file is freshly created or invalid JSON
      }
    }

    webview.postMessage({
      type,
      elements: data.elements || [],
      camera: data.camera || { x: 0, y: 0, zoom: 1 }
    });
  }

  private getHtmlForWebview(webview: vscode.Webview): string {
    const webviewDist = path.join(this.context.extensionPath, 'dist', 'webview');
    const indexPath = path.join(webviewDist, 'index.html');

    if (!fs.existsSync(indexPath)) {
      return `<!DOCTYPE html>
<html>
<body>
  <div style="font-family: sans-serif; padding: 24px; color: #ef4444;">
    <h3>Drawboard Webview bundle not found</h3>
    <p>Please run <code>npm run build</code> to compile the Drawboard React application.</p>
  </div>
</body>
</html>`;
    }

    let html = fs.readFileSync(indexPath, 'utf8');

    // Convert relative asset paths to vscode-resource webview URIs
    const webviewUri = webview.asWebviewUri(
      vscode.Uri.file(webviewDist)
    );

    // Replace assets/ with webviewUri/assets/
    html = html.replace(/(src|href)="(\.\/|\/)?assets\//g, `$1="${webviewUri}/assets/`);
    html = html.replace(/(src|href)="(\.\/|\/)?favicon/g, `$1="${webviewUri}/favicon`);

    // Inject Content-Security-Policy to allow loading CDN images, fonts, styles, and API fetch
    const cspMeta = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} https: http: data: blob:; script-src ${webview.cspSource} 'unsafe-inline'; style-src ${webview.cspSource} 'unsafe-inline' https:; font-src ${webview.cspSource} https: data:; connect-src https: http:;">`;
    if (html.includes('<head>')) {
      html = html.replace('<head>', `<head>\n    ${cspMeta}`);
    } else {
      html = cspMeta + html;
    }

    return html;
  }
}
