import * as vscode from 'vscode';
import { DrawboardEditorProvider } from './extension/editorProvider';

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
