/**
 * SSE Message Parser
 * Parses Server-Sent Events messages and extracts JSON data
 */

export interface ParsedSSEMessage {
    data: object;
    raw: string;
}

/**
 * Parse SSE text into an array of parsed message objects
 * @param text Raw SSE text containing "data: {...}" lines
 * @returns Array of parsed JSON objects
 */
export function parseSSEMessages(text: string): ParsedSSEMessage[] {
    const messages: ParsedSSEMessage[] = [];
    const lines = text.split('\n');

    for (const line of lines) {
        const trimmedLine = line.trim();

        // Skip empty lines
        if (!trimmedLine) {
            continue;
        }

        // Check if line starts with "data:"
        if (trimmedLine.startsWith('data:')) {
            const jsonStr = trimmedLine.slice(5).trim();

            if (!jsonStr) {
                continue;
            }

            try {
                const data = JSON.parse(jsonStr);
                messages.push({
                    data,
                    raw: trimmedLine
                });
            } catch (e) {
                // Skip invalid JSON lines
                console.warn('Failed to parse SSE JSON:', jsonStr);
            }
        }
    }

    return messages;
}

/**
 * Extract raw JSON strings from SSE text
 * @param text Raw SSE text
 * @returns Array of JSON strings
 */
export function extractSSEJsonStrings(text: string): string[] {
    const jsonStrings: string[] = [];
    const lines = text.split('\n');

    for (const line of lines) {
        const trimmedLine = line.trim();

        if (trimmedLine.startsWith('data:')) {
            const jsonStr = trimmedLine.slice(5).trim();
            if (jsonStr) {
                jsonStrings.push(jsonStr);
            }
        }
    }

    return jsonStrings;
}
