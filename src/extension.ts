'use strict';
import * as vscode from 'vscode';
import fs = require('fs');
import path = require('path');
import os = require('os');
import cp = require('child_process');

export let outputChannel = vscode.window.createOutputChannel('CLion format');

export class ClionDocumentFormattingEditProvider implements vscode.DocumentFormattingEditProvider, vscode.DocumentRangeFormattingEditProvider {
	public provideDocumentFormattingEdits(document: vscode.TextDocument, options: vscode.FormattingOptions, token: vscode.CancellationToken): Thenable<vscode.TextEdit[]> {
		const start = document.lineAt(0).range.start;
		const end = document.lineAt(document.lineCount - 1).range.end;
		const editRange = new vscode.Range(start, end);
		return this.doFormatDocument(document, editRange, token);
	}

	public provideDocumentRangeFormattingEdits(document: vscode.TextDocument, range: vscode.Range, options: vscode.FormattingOptions, token: vscode.CancellationToken): Thenable<vscode.TextEdit[]> {
		return this.doFormatDocument(document, range, token);
	}

	private doFormatDocument(document: vscode.TextDocument, range: vscode.Range, token: vscode.CancellationToken): Thenable<vscode.TextEdit[]> {
		return new Promise((resolve, reject) => {
			const formatCommandBinPath = vscode.workspace.getConfiguration('clion-formatter').get<string>('executable');

			let formatArgs = [
				'format',
			];
			if (vscode.workspace.getConfiguration('clion-formatter').has('settings')) {
				formatArgs.push('-s');
				formatArgs.push(vscode.workspace.getConfiguration('clion-formatter').get<string>('settings')!);
			}

			let codeContent = document.getText(range);

			fs.mkdtemp(path.join(os.tmpdir(), 'vscode_clion_formatter_'), (err, folder) => {
				const fileName = path.join(folder, 'fragment.cpp');
				fs.writeFileSync(fileName, codeContent);
				formatArgs.push(fileName);
				let child = cp.spawn(formatCommandBinPath!, formatArgs);
				child.stdout.on('data', chunk => outputChannel.append(chunk.toString()));
				child.stderr.on('data', chunk => outputChannel.append(chunk.toString()));

				child.on('error', err => {
					if (err && (<any>err).code === 'ENOENT') {
						vscode.window.showErrorMessage(formatCommandBinPath + ' command is not found.');
						return resolve();
					}
					reject(err);
				});

				child.on('close', code => {
					if (code !== 0) {
						vscode.window.showErrorMessage('Formatting has failed!');
						return reject('Return code is: ' + code.toString());
					}

					const editedText = fs.readFileSync(fileName).toString();

					fs.rmdirSync(folder, {
						recursive: true,
					});

					return resolve([vscode.TextEdit.replace(range, editedText)]);
				});
			});

			if (token) {
				token.onCancellationRequested(() => {
					reject('Cancelation requested');
				});
			}
		});
	}
}

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider({ language: 'cpp', scheme: "file" }, new ClionDocumentFormattingEditProvider()));
	context.subscriptions.push(vscode.languages.registerDocumentRangeFormattingEditProvider({ language: 'cpp', scheme: "file" }, new ClionDocumentFormattingEditProvider()));
}

