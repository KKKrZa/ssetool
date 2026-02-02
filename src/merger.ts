/**
 * SSE Merger
 * Main processing module that combines SSE parsing and JSONPath extraction
 */

import { parseSSEMessages, ParsedSSEMessage } from './sseParser';
import { extractByPath, mergeExtractedValues } from './jsonPathExtractor';

export interface MergeResult {
    success: boolean;
    result?: string;
    extractedValues?: any[];
    messageCount: number;
    error?: string;
}

/**
 * Process SSE text and extract/merge values using JSONPath
 * @param text Raw SSE text
 * @param jsonPath JSONPath expression to extract values
 * @returns MergeResult with the merged output
 */
export function processSSE(text: string, jsonPath: string): MergeResult {
    // Parse SSE messages
    const messages = parseSSEMessages(text);

    if (messages.length === 0) {
        return {
            success: false,
            messageCount: 0,
            error: 'No valid SSE messages found'
        };
    }

    // Extract values from each message
    const extractedValues: any[] = [];

    for (const message of messages) {
        const value = extractByPath(message.data, jsonPath);
        if (value !== undefined && value !== null) {
            extractedValues.push(value);
        }
    }

    if (extractedValues.length === 0) {
        return {
            success: false,
            messageCount: messages.length,
            error: `No values found for JSONPath: ${jsonPath}`
        };
    }

    // Merge extracted values
    const mergedResult = mergeExtractedValues(extractedValues);

    return {
        success: true,
        result: mergedResult,
        extractedValues,
        messageCount: messages.length
    };
}

/**
 * Process SSE with multiple JSONPaths
 * @param text Raw SSE text
 * @param jsonPaths Array of JSONPath expressions
 * @returns Object with results for each path
 */
export function processSSEMultiplePaths(
    text: string,
    jsonPaths: string[]
): Record<string, MergeResult> {
    const results: Record<string, MergeResult> = {};

    for (const path of jsonPaths) {
        results[path] = processSSE(text, path);
    }

    return results;
}
