const vscode = require('vscode')
const { formatNavor } = require('./format.cjs')

function formattingEdits(document) {
  const text = document.getText()
  const formatted = formatNavor(text)

  if (formatted === text) {
    return []
  }

  const fullRange = new vscode.Range(
    document.positionAt(0),
    document.positionAt(text.length),
  )

  return [vscode.TextEdit.replace(fullRange, formatted)]
}

function shouldFormatOnSave(document) {
  if (document.languageId !== 'navor') {
    return false
  }

  return vscode.workspace.getConfiguration('editor', document).get('formatOnSave') === true
}

/** @param {import('vscode').ExtensionContext} context */
function activate(context) {
  const selector = [
    { language: 'navor', scheme: 'file' },
    { language: 'navor', scheme: 'untitled' },
  ]

  const formattingProvider = {
    provideDocumentFormattingEdits(document) {
      try {
        return formattingEdits(document)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        void vscode.window.showErrorMessage(`Navor format failed: ${message}`)
        return []
      }
    },
    provideDocumentRangeFormattingEdits(document) {
      return formattingProvider.provideDocumentFormattingEdits(document)
    },
  }

  context.subscriptions.push(
    vscode.languages.registerDocumentFormattingEditProvider(selector, formattingProvider),
    vscode.languages.registerDocumentRangeFormattingEditProvider(selector, formattingProvider),
    // Cursor/VS Code format-on-save sometimes skips local formatters; format on save directly.
    vscode.workspace.onWillSaveTextDocument((event) => {
      if (!shouldFormatOnSave(event.document)) {
        return
      }

      try {
        const edits = formattingEdits(event.document)
        if (edits.length > 0) {
          event.waitUntil(Promise.resolve(edits))
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        void vscode.window.showErrorMessage(`Navor format failed: ${message}`)
      }
    }),
    vscode.commands.registerCommand('navor.formatDocument', async () => {
      const editor = vscode.window.activeTextEditor
      if (!editor || editor.document.languageId !== 'navor') {
        void vscode.window.showWarningMessage('Open a .nav file to format.')
        return
      }

      try {
        const edits = formattingEdits(editor.document)
        if (edits.length === 0) {
          return
        }

        await editor.edit((builder) => {
          for (const edit of edits) {
            builder.replace(edit.range, edit.newText)
          }
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        void vscode.window.showErrorMessage(`Navor format failed: ${message}`)
      }
    }),
  )
}

function deactivate() {}

module.exports = { activate, deactivate }
