import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function getHtmlForWebview(context: vscode.ExtensionContext, webview: vscode.Webview): string {
  const webviewDist = path.join(context.extensionPath, 'dist', 'webview');
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
  const webviewUri = webview.asWebviewUri(vscode.Uri.file(webviewDist));

  html = html.replace(/(src|href)="(\.\/|\/)?assets\//g, `$1="${webviewUri}/assets/`);
  html = html.replace(/(src|href)="(\.\/|\/)?favicon/g, `$1="${webviewUri}/favicon`);

  const cspMeta = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} https: http: data: blob:; script-src ${webview.cspSource} 'unsafe-inline'; style-src ${webview.cspSource} 'unsafe-inline' https:; font-src ${webview.cspSource} https: data:; connect-src https: http:;">`;
  if (html.includes('<head>')) {
    html = html.replace('<head>', `<head>\n    ${cspMeta}`);
  } else {
    html = cspMeta + html;
  }

  return html;
}
