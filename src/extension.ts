import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('csv-to-mssql.convertToInserts', () => {
		const editor = vscode.window.activeTextEditor;
		//console.log("Holi");
	
		if (!editor) {
			vscode.window.showErrorMessage("No selected editor");
			return;
		}
	
		vscode.window.showInputBox({
			prompt: 'Enter the table name',
			placeHolder: 'Table'
		}).then((tableName) => {
			if (!tableName) {
				tableName = "table19";
			}
	
			//Read the active text editor's document
			const doc = editor.document;
			
			const splitRegex = /((?:[^,"']|"[^"]*"|'[^']*')+)/g;
			
			//Parse the CSV data
			let rows: any[] = [];
			doc.getText().split(/\r?\n/).forEach(line => {
				if (line !== '') {
					const fields = line.match(splitRegex)?.map(field => field.trim().replace(/^"(.*)"$/, '$1')) ?? [];
					rows.push(fields);
				}
			});
	
			//Generate the inserts
			let insertStatements: string[] = [];
			let columns: string[] = rows[0];
			for (let i = 1; i < rows.length; i++) {
				let values = rows[i];
				let insertValues = values.map((value: string|number) => {
					const numericValue = Number(value);
					return isNaN(numericValue) ? `'${value}'` : value;
				});
				insertStatements.push(`INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${insertValues.join(', ')});`);
			}

			let insertString = insertStatements.join('\n');
			
			//Write it in a new tab
			vscode.workspace.openTextDocument({ content: insertString, language: 'sql' }).then(doc => {
				vscode.window.showTextDocument(doc);
			});
		});
	});
	
	context.subscriptions.push(disposable);
}

export function deactivate() { }
