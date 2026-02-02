/**
 * SSE Merge Tool - VS Code Extension
 * Entry point for the extension
 */

import * as vscode from 'vscode';
import {
    mergeFromClipboard,
    mergeFromSelection,
    mergeFromEditor,
    quickMergeFromClipboard,
    quickMergeFromSelection
} from './commands';

export function activate(context: vscode.ExtensionContext) {
    console.log('SSE Merge Tool is now active!');

    // Register commands
    const commands = [
        vscode.commands.registerCommand('ssetool.mergeFromClipboard', mergeFromClipboard),
        vscode.commands.registerCommand('ssetool.mergeFromSelection', mergeFromSelection),
        vscode.commands.registerCommand('ssetool.mergeFromEditor', mergeFromEditor),
        vscode.commands.registerCommand('ssetool.quickMergeFromClipboard', quickMergeFromClipboard),
        vscode.commands.registerCommand('ssetool.quickMergeFromSelection', quickMergeFromSelection)
    ];

    // Add all commands to subscriptions
    commands.forEach(cmd => context.subscriptions.push(cmd));
}

export function deactivate() {
    console.log('SSE Merge Tool deactivated');
}
