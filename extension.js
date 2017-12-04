const vscode = require("vscode");
var ncp = require("copy-paste");

function fix_text(text, fix_indenting = true) {
  text = text
    .split("\n")
    .map(line => {
      const num_len = line.replace(/(^ *)(\d+) ([^\n]*?$)/, "$2").length;
      const replacement_text = `$1${Array(num_len + 1).join(" ")}$3`;
      return line.replace(/^( *)(\d+)( *)/gm, replacement_text);
    })
    .join("\n");

  if (fix_indenting) {
    var smallest_indent = null;
    text.split("\n").forEach(line => {
      if (line.trim() === "") {
        return;
      }

      const indent = line.search(/\S|$/);
      if (smallest_indent === null || indent < smallest_indent) {
        smallest_indent = indent;
      }
    });

    smallest_indent = smallest_indent || 0;

    text = text
      .split("\n")
      .map(line => line.substring(smallest_indent))
      .join("\n");
  }

  return text;
}

function activate(context) {
  let removeLineNumbers = vscode.commands.registerCommand(
    "extension.removeLineNumbers",
    function() {
      const editor = vscode.window.activeTextEditor;

      const selections = editor.selections;

      editor.edit(builder => {
        for (const selection of selections) {
          const selection_text = editor.document.getText(selection);
          builder.replace(
            selection,
            fix_text(selection_text, (fix_indenting = false))
          );
        }
      });
    }
  );

  context.subscriptions.push(removeLineNumbers);

  let pasteFixed = vscode.commands.registerCommand(
    "extension.pasteFixed",
    function() {
      const editor = vscode.window.activeTextEditor;

      const selections = editor.selections;

      editor.edit(builder => {
        const clipboard_text = ncp.paste();
        const fixed_text = fix_text(clipboard_text, (fix_indenting = true));
        for (const selection of selections) {
          builder.replace(selection, fixed_text);
        }
      });
    }
  );

  context.subscriptions.push(pasteFixed);
}

exports.activate = activate;

function deactivate() {}
exports.deactivate = deactivate;
