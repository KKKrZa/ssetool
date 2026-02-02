/**
 * JSONPath Extractor
 * Uses jsonpath-plus to extract values from objects using JSONPath expressions
 */

import { JSONPath } from 'jsonpath-plus';

/**
 * Extract a value from an object using JSONPath
 * @param obj The object to extract from
 * @param path JSONPath expression (e.g., "$.response.candidates[0].content.parts[0].text")
 * @returns The extracted value, or undefined if not found
 */
export function extractByPath(obj: object, path: string): any {
    try {
        const result = JSONPath({
            path: path,
            json: obj,
            wrap: false
        });
        return result;
    } catch (e) {
        console.warn('JSONPath extraction failed:', e);
        return undefined;
    }
}

/**
 * Extract values from multiple objects using the same JSONPath
 * @param objects Array of objects to extract from
 * @param path JSONPath expression
 * @returns Array of extracted values (undefined values are filtered out)
 */
export function extractFromMultiple(objects: object[], path: string): any[] {
    const results: any[] = [];

    for (const obj of objects) {
        const value = extractByPath(obj, path);
        if (value !== undefined && value !== null) {
            results.push(value);
        }
    }

    return results;
}

/**
 * Merge extracted values into a single string
 * @param values Array of values to merge
 * @param separator Separator between values (default: empty string for text concatenation)
 * @returns Merged string
 */
export function mergeExtractedValues(values: any[], separator: string = ''): string {
    return values
        .map(v => {
            if (typeof v === 'string') {
                return v;
            } else if (typeof v === 'object') {
                return JSON.stringify(v);
            } else {
                return String(v);
            }
        })
        .join(separator);
}
