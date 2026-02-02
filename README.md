# SSE Merge Tool

A VS Code extension for parsing and merging Server-Sent Events (SSE) messages using JSONPath expressions.

## Features

- Parse SSE messages from clipboard, selection, or editor
- Extract values using JSONPath expressions (e.g., `$.response.candidates[0].content.parts[0].text`)
- Merge extracted values into a single output
- Quick merge with keyboard shortcuts
- Persistent configuration for recent paths

## Usage

### Commands

| Command | Description |
|---------|-------------|
| `SSE Tool: Merge from Clipboard` | Parse SSE from clipboard with JSONPath prompt |
| `SSE Tool: Merge from Selection` | Parse SSE from selected text with JSONPath prompt |
| `SSE Tool: Merge from Editor` | Parse SSE from entire editor with JSONPath prompt |
| `SSE Tool: Quick Merge from Clipboard` | Parse SSE from clipboard using last used path |
| `SSE Tool: Quick Merge from Selection` | Parse SSE from selection using last used path |

### Keyboard Shortcuts

| Shortcut | Command |
|----------|---------|
| `Ctrl+Shift+M` | Quick Merge from Clipboard |
| `Ctrl+Shift+Alt+M` | Quick Merge from Selection |

### Example

**Input SSE:**
```
data: {"response": {"candidates": [{"content": {"parts": [{"text": "Hello"}]}}]}}
data: {"response": {"candidates": [{"content": {"parts": [{"text": " World"}]}}]}}
```

**JSONPath:** `$.response.candidates[0].content.parts[0].text`

**Output:** `Hello World`

## Configuration

| Setting | Description | Default |
|---------|-------------|---------|
| `ssetool.defaultJsonPath` | Default JSONPath expression | `$.response.candidates[0].content.parts[0].text` |

## License

MIT
