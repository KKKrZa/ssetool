/**
 * VS Code Commands for SSE Tool
 */

import * as vscode from 'vscode';
import { processSSE, MergeResult } from './merger';

/**
 * Get the default JSONPath from configuration
 */
function getDefaultJsonPath(): string {
    const config = vscode.workspace.getConfiguration('ssetool');
    return config.get<string>('defaultJsonPath', '$.response.candidates[0].content.parts[0].text');
}

/**
 * Get the last used JSONPath from configuration
 */
function getLastUsedPath(): string {
    const config = vscode.workspace.getConfiguration('ssetool');
    const lastUsed = config.get<string>('lastUsedPath', '');
    return lastUsed || getDefaultJsonPath();
}

/**
 * Save the last used JSONPath to configuration
 */
async function saveLastUsedPath(path: string): Promise<void> {
    const config = vscode.workspace.getConfiguration('ssetool');
    await config.update('lastUsedPath', path, vscode.ConfigurationTarget.Global);
}

/**
 * Get recent JSONPaths from configuration
 */
function getRecentPaths(): string[] {
    const config = vscode.workspace.getConfiguration('ssetool');
    return config.get<string[]>('recentPaths', []);
}

/**
 * Save a JSONPath to recent paths and as last used
 */
async function saveRecentPath(path: string): Promise<void> {
    const config = vscode.workspace.getConfiguration('ssetool');
    const recentPaths = getRecentPaths();

    // Remove if already exists
    const filtered = recentPaths.filter(p => p !== path);

    // Add to front
    filtered.unshift(path);

    // Keep only last 10
    const trimmed = filtered.slice(0, 10);

    // Save both recent paths and last used path
    await config.update('recentPaths', trimmed, vscode.ConfigurationTarget.Global);
    await saveLastUsedPath(path);
}

/**
 * Prompt user for JSONPath with recent paths as quick picks
 */
async function promptForJsonPath(): Promise<string | undefined> {
    const defaultPath = getDefaultJsonPath();
    const recentPaths = getRecentPaths();

    // If we have recent paths, show quick pick
    if (recentPaths.length > 0) {
        const items: vscode.QuickPickItem[] = [
            { label: '$(edit) Enter custom path...', description: 'Type a new JSONPath expression' },
            { label: defaultPath, description: 'Default', picked: true },
            ...recentPaths
                .filter(p => p !== defaultPath)
                .map(p => ({ label: p, description: 'Recent' }))
        ];

        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select a JSONPath or enter a custom one',
            title: 'SSE Tool: Select JSONPath'
        });

        if (!selected) {
            return undefined;
        }

        if (selected.label === '$(edit) Enter custom path...') {
            return await vscode.window.showInputBox({
                prompt: 'Enter JSONPath expression',
                value: defaultPath,
                placeHolder: '$.response.candidates[0].content.parts[0].text'
            });
        }

        return selected.label;
    }

    // No recent paths, just show input box
    return await vscode.window.showInputBox({
        prompt: 'Enter JSONPath expression',
        value: defaultPath,
        placeHolder: '$.response.candidates[0].content.parts[0].text'
    });
}

/**
 * Display merge result in a new document
 */
async function displayResult(result: MergeResult, jsonPath: string): Promise<void> {
    if (!result.success) {
        vscode.window.showErrorMessage(`SSE Tool: ${result.error}`);
        return;
    }

    // Create a new untitled document with the merged result
    const doc = await vscode.workspace.openTextDocument({
        content: result.result || '',
        language: 'plaintext'
    });

    await vscode.window.showTextDocument(doc, { preview: false });

    // Show info message
    vscode.window.showInformationMessage(
        `SSE Tool: Merged ${result.extractedValues?.length || 0} values from ${result.messageCount} messages`
    );

    // Save the path to recent
    await saveRecentPath(jsonPath);
}

/**
 * Merge SSE from clipboard
 */
export async function mergeFromClipboard(): Promise<void> {
    const jsonPath = await promptForJsonPath();
    if (!jsonPath) {
        return;
    }

    const text = await vscode.env.clipboard.readText();
    if (!text) {
        vscode.window.showWarningMessage('SSE Tool: Clipboard is empty');
        return;
    }

    const result = processSSE(text, jsonPath);
    await displayResult(result, jsonPath);
}

/**
 * Merge SSE from current selection
 */
export async function mergeFromSelection(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage('SSE Tool: No active editor');
        return;
    }

    const selection = editor.selection;
    if (selection.isEmpty) {
        vscode.window.showWarningMessage('SSE Tool: No text selected');
        return;
    }

    const jsonPath = await promptForJsonPath();
    if (!jsonPath) {
        return;
    }

    const text = editor.document.getText(selection);
    const result = processSSE(text, jsonPath);
    await displayResult(result, jsonPath);
}

/**
 * Merge SSE from entire editor content
 */
export async function mergeFromEditor(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage('SSE Tool: No active editor');
        return;
    }

    const jsonPath = await promptForJsonPath();
    if (!jsonPath) {
        return;
    }

    const text = editor.document.getText();
    const result = processSSE(text, jsonPath);
    await displayResult(result, jsonPath);
}

/**
 * Quick merge SSE from clipboard using last used path (no prompt)
 */
export async function quickMergeFromClipboard(): Promise<void> {
    const jsonPath = getLastUsedPath();

    const text = await vscode.env.clipboard.readText();
    if (!text) {
        vscode.window.showWarningMessage('SSE Tool: Clipboard is empty');
        return;
    }

    const result = processSSE(text, jsonPath);
    await displayResult(result, jsonPath);
}

/**
 * Quick merge SSE from selection using last used path (no prompt)
 */
export async function quickMergeFromSelection(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage('SSE Tool: No active editor');
        return;
    }

    const selection = editor.selection;
    if (selection.isEmpty) {
        // If no selection, use entire document
        const jsonPath = getLastUsedPath();
        const text = editor.document.getText();
        const result = processSSE(text, jsonPath);
        await displayResult(result, jsonPath);
        return;
    }

    const jsonPath = getLastUsedPath();
    const text = editor.document.getText(selection);
    const result = processSSE(text, jsonPath);
    await displayResult(result, jsonPath);
}
