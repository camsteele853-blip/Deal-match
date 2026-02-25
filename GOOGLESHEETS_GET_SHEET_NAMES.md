# Google Sheets - Get Sheet Names

Retrieves the list of sheet/tab names from a Google Spreadsheet.

## Installation/Import

```typescript
import { request as getSheetNames } from '@/sdk/mcp-clients/686de48c6fd1cae1afbb55ba/GOOGLESHEETS_GET_SHEET_NAMES';
```

## Function Signature

```typescript
async function request(params: GetSheetNamesParams): Promise<GetSheetNamesData>
```

## Parameters

### `GetSheetNamesParams`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `spreadsheet_id` | `string` | Yes | The unique identifier of the Google Spreadsheet (alphanumeric string, typically 44 characters). Extract only the ID portion from URLs. |

**Example spreadsheet_id extraction:**
- URL: `https://docs.google.com/spreadsheets/d/1qpyC0XzvTcKT6EISywY/edit#gid=0`
- ID: `1qpyC0XzvTcKT6EISywY`

Do not include:
- Leading/trailing slashes
- `/edit` suffixes
- Query parameters
- URL fragments

## Return Value

### `GetSheetNamesData`

```typescript
{
  sheet_names: string[];  // Primary field: list of sheet names in order
  sheets?: string[];      // Alias for sheet_names (optional)
}
```

- `sheet_names`: Array of sheet/tab names in the order they appear in the spreadsheet
- `sheets`: Alias for `sheet_names` (prefer using `sheet_names`)

## Usage Examples

### Basic Usage

```typescript
import { request as getSheetNames } from '@/sdk/mcp-clients/686de48c6fd1cae1afbb55ba/GOOGLESHEETS_GET_SHEET_NAMES';

async function listSheets() {
  try {
    const result = await getSheetNames({
      spreadsheet_id: '1qpyC0XzvTcKT6EISywY_7H7D7No1tpxEXAMPLE_ID'
    });
    
    console.log('Available sheets:', result.sheet_names);
    // Output: ['Sheet1', 'Sheet2', 'Data', 'Analysis']
    
    return result.sheet_names;
  } catch (error) {
    console.error('Failed to get sheet names:', error);
    throw error;
  }
}
```

### With Error Handling

```typescript
import { request as getSheetNames } from '@/sdk/mcp-clients/686de48c6fd1cae1afbb55ba/GOOGLESHEETS_GET_SHEET_NAMES';

async function getFirstSheet(spreadsheetUrl: string) {
  // Extract spreadsheet ID from URL
  const match = spreadsheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) {
    throw new Error('Invalid spreadsheet URL');
  }
  
  const spreadsheet_id = match[1];
  
  try {
    const result = await getSheetNames({ spreadsheet_id });
    
    if (result.sheet_names.length === 0) {
      console.log('Spreadsheet has no sheets');
      return null;
    }
    
    const firstSheet = result.sheet_names[0];
    console.log(`First sheet: ${firstSheet}`);
    return firstSheet;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    }
    throw error;
  }
}
```

### Checking for Specific Sheet

```typescript
import { request as getSheetNames } from '@/sdk/mcp-clients/686de48c6fd1cae1afbb55ba/GOOGLESHEETS_GET_SHEET_NAMES';

async function hasSheet(spreadsheet_id: string, sheetName: string): Promise<boolean> {
  try {
    const result = await getSheetNames({ spreadsheet_id });
    return result.sheet_names.includes(sheetName);
  } catch (error) {
    console.error('Failed to check sheet existence:', error);
    return false;
  }
}

// Usage
const exists = await hasSheet('1qpyC0XzvTcKT6EISywY', 'Data');
console.log('Data sheet exists:', exists);
```

## Error Handling

The function may throw errors in the following cases:

### Missing Required Parameter
```typescript
Error: Missing required parameter: spreadsheet_id
```
Thrown when `spreadsheet_id` is not provided.

### Invalid Parameter Format
```typescript
Error: Invalid spreadsheet_id: must be a non-empty string
```
Thrown when `spreadsheet_id` is empty or not a string.

### MCP Response Errors
```typescript
Error: Invalid MCP response format: missing content[0].text
```
Thrown when the MCP tool returns an unexpected response format.

### JSON Parsing Errors
```typescript
Error: Failed to parse MCP response JSON: [error details]
```
Thrown when the MCP response cannot be parsed as JSON.

### Tool Execution Errors
```typescript
Error: MCP tool execution failed
Error: [specific error message from tool]
```
Thrown when the Google Sheets API returns an error (e.g., invalid spreadsheet ID, permission denied, spreadsheet not found).

### Missing Data
```typescript
Error: MCP tool returned successful response but no data
```
Thrown when the tool reports success but returns no data.

## Common Error Scenarios

1. **Invalid Spreadsheet ID**: Ensure the ID is correctly extracted from the URL
2. **Permission Denied**: The service account or authenticated user must have access to the spreadsheet
3. **Spreadsheet Not Found**: The spreadsheet ID may be incorrect or the spreadsheet may have been deleted
4. **Network Issues**: Temporary connectivity problems with Google Sheets API

## Best Practices

1. **Extract ID Correctly**: Always extract only the alphanumeric ID from spreadsheet URLs
2. **Handle Empty Results**: Check if `sheet_names` array is empty before accessing elements
3. **Use Primary Field**: Prefer `sheet_names` over the `sheets` alias for consistency
4. **Error Handling**: Always wrap calls in try-catch blocks for production code
5. **Validate Input**: Validate spreadsheet_id format before making the request

## Notes

- Sheet names are returned in the order they appear in the spreadsheet
- Sheet names are unique within a spreadsheet
- The `sheets` field is an alias for `sheet_names` and contains identical data
- Empty spreadsheets will return an empty array