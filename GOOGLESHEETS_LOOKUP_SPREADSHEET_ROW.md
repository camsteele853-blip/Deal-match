# Google Sheets - Lookup Spreadsheet Row

Look up a row in a Google Spreadsheet by searching for an exact text match in a cell and retrieve the entire row's data.

## Installation/Import

```typescript
import { request as lookupSpreadsheetRow } from '@/sdk/mcp-clients/686de48c6fd1cae1afbb55ba/GOOGLESHEETS_LOOKUP_SPREADSHEET_ROW';
```

## Function Signature

```typescript
async function request(params: LookupSpreadsheetRowParams): Promise<LookupSpreadsheetRowData>
```

## Parameters

### `LookupSpreadsheetRowParams`

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `spreadsheet_id` | `string` | ✅ Yes | - | Identifier of the Google Spreadsheet to search |
| `query` | `string` | ✅ Yes | - | Exact text value to find; matches the entire content of a cell |
| `range` | `string` | No | First sheet | A1 notation range to search within (e.g., 'Sheet1!A:Z', 'Sheet1!A1:D5') |
| `case_sensitive` | `boolean` | No | `false` | If true, the query string search is case-sensitive |
| `normalize_whitespace` | `boolean` | No | `true` | If true, strips leading/trailing whitespace before matching |

### Range Format Examples

- Cell range: `'Sheet1!A1:D5'`
- Column range: `'Sheet1!A:Z'`
- Row range: `'Sheet1!1:1'`
- Sheet with spaces: `"'Admin tickets'!A:A"` (note the single quotes around sheet name)

## Return Value

### `LookupSpreadsheetRowData`

```typescript
{
  row_data: {
    found: boolean;           // Whether a matching row was found
    row_data: string[] | {};  // Array of cell values if found, empty object if not
  }
}
```

## Usage Examples

### Basic Lookup

```typescript
import { request as lookupSpreadsheetRow } from '@/sdk/mcp-clients/686de48c6fd1cae1afbb55ba/GOOGLESHEETS_LOOKUP_SPREADSHEET_ROW';

const result = await lookupSpreadsheetRow({
  spreadsheet_id: '1BiexwqQYjfC_BXy6zDQYJqb6zxzRyP9',
  query: 'John',
  range: 'Sheet1!A:Z'
});

if (result.row_data.found) {
  console.log('Found row data:', result.row_data.row_data);
  // Output: ['John', 'Doe', 'john@example.com', ...]
} else {
  console.log('No matching row found');
}
```

### Case-Sensitive Search

```typescript
const result = await lookupSpreadsheetRow({
  spreadsheet_id: '1BiexwqQYjfC_BXy6zDQYJqb6zxzRyP9',
  query: 'COMPLETED',
  range: 'Tasks!A1:F100',
  case_sensitive: true
});

if (result.row_data.found && Array.isArray(result.row_data.row_data)) {
  const [id, status, assignee, dueDate] = result.row_data.row_data;
  console.log(`Task ${id} is ${status}, assigned to ${assignee}`);
}
```

### Search in Sheet with Spaces

```typescript
const result = await lookupSpreadsheetRow({
  spreadsheet_id: '1BiexwqQYjfC_BXy6zDQYJqb6zxzRyP9',
  query: 'ID-12345',
  range: "'Admin tickets'!A:A",  // Note the single quotes around sheet name
  normalize_whitespace: true
});
```

### Search Specific Column Range

```typescript
const result = await lookupSpreadsheetRow({
  spreadsheet_id: '1BiexwqQYjfC_BXy6zDQYJqb6zxzRyP9',
  query: 'john@example.com',
  range: 'Users!C:C',  // Search only in column C
  case_sensitive: false
});
```

## Error Handling

The function throws errors in the following cases:

- **Missing required parameters**: `spreadsheet_id` or `query` not provided
- **Invalid MCP response**: Response format is malformed
- **JSON parsing failure**: Response content cannot be parsed
- **Tool execution failure**: The MCP tool reports unsuccessful execution
- **No data returned**: Tool succeeds but returns no data

### Example Error Handling

```typescript
try {
  const result = await lookupSpreadsheetRow({
    spreadsheet_id: '1BiexwqQYjfC_BXy6zDQYJqb6zxzRyP9',
    query: 'SearchTerm',
    range: 'Sheet1!A:Z'
  });
  
  if (result.row_data.found) {
    // Process found row
  } else {
    // Handle not found case
  }
} catch (error) {
  if (error instanceof Error) {
    console.error('Lookup failed:', error.message);
  }
}
```

## Notes

- The query must match the **entire content** of a cell, not just a substring
- By default, whitespace is normalized (stripped from both ends) before matching
- If no range is specified, the search defaults to the first sheet
- Sheet names containing spaces must be wrapped in single quotes within the range string
- The returned `row_data` is an ordered array of all cell values in the matched row
- If no match is found, `found` will be `false` and `row_data` will be an empty object