# Google Sheets: Create Sheet from JSON

Create a new Google Spreadsheet from JSON data with automatic header generation.

## Installation/Import

```typescript
import { request as createSheetFromJson } from '@/sdk/mcp-clients/686de48c6fd1cae1afbb55ba/GOOGLESHEETS_SHEET_FROM_JSON';
```

## Function Signature

```typescript
async function request(params: CreateSheetFromJsonParams): Promise<CreateSheetFromJsonData>
```

## Parameters

### `CreateSheetFromJsonParams`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | `string` | Yes | The desired title for the new Google Spreadsheet |
| `sheet_name` | `string` | Yes | The name for the first worksheet (appears as tab name) |
| `sheet_json` | `Array<Record<string, string \| number \| boolean \| null>>` | Yes | Array of objects representing rows. Keys become headers. Empty array `[]` creates empty sheet |

### Examples of `sheet_json`

**Simple data:**
```json
[
  {"Name": "Alice", "Age": 30, "City": "New York"},
  {"Name": "Bob", "Age": 24, "City": "London"}
]
```

**Product inventory:**
```json
[
  {"Product ID": "A123", "Quantity": 10, "Price": 25.50},
  {"Product ID": "B456", "Quantity": 5, "Price": 100.00}
]
```

**Empty sheet:**
```json
[]
```

## Return Value

### `CreateSheetFromJsonData`

| Property | Type | Description |
|----------|------|-------------|
| `spreadsheetId` | `string` | The ID of the created spreadsheet |
| `updatedCells` | `number` | Number of cells updated |
| `updatedColumns` | `number` | Number of columns updated |
| `updatedRows` | `number` | Number of rows updated |
| `updatedRange` | `string` | The range (in A1 notation) that was updated |
| `updatedData` | `ValueRange` (optional) | The actual cell values that were written |

## Usage Examples

### Example 1: Create Sales Report

```typescript
import { request as createSheetFromJson } from '@/sdk/mcp-clients/686de48c6fd1cae1afbb55ba/GOOGLESHEETS_SHEET_FROM_JSON';

async function createSalesReport() {
  const result = await createSheetFromJson({
    title: 'Q3 Sales Report',
    sheet_name: 'Sales Data',
    sheet_json: [
      { Name: 'Alice', Sales: 15000, Region: 'North' },
      { Name: 'Bob', Sales: 12000, Region: 'South' },
      { Name: 'Charlie', Sales: 18000, Region: 'East' }
    ]
  });
  
  console.log(`Created spreadsheet: ${result.spreadsheetId}`);
  console.log(`Updated ${result.updatedRows} rows and ${result.updatedCells} cells`);
  console.log(`Range: ${result.updatedRange}`);
  
  return result.spreadsheetId;
}
```

### Example 2: Create Product Inventory

```typescript
import { request as createSheetFromJson } from '@/sdk/mcp-clients/686de48c6fd1cae1afbb55ba/GOOGLESHEETS_SHEET_FROM_JSON';

async function createInventorySheet() {
  const result = await createSheetFromJson({
    title: 'Product Inventory 2024',
    sheet_name: 'Inventory',
    sheet_json: [
      { SKU: 'PROD-001', Name: 'Widget A', Stock: 150, Price: 29.99 },
      { SKU: 'PROD-002', Name: 'Widget B', Stock: 75, Price: 49.99 },
      { SKU: 'PROD-003', Name: 'Widget C', Stock: 200, Price: 19.99 }
    ]
  });
  
  console.log(`Inventory sheet created: ${result.spreadsheetId}`);
  return result;
}
```

### Example 3: Create Empty Sheet

```typescript
import { request as createSheetFromJson } from '@/sdk/mcp-clients/686de48c6fd1cae1afbb55ba/GOOGLESHEETS_SHEET_FROM_JSON';

async function createEmptySheet() {
  const result = await createSheetFromJson({
    title: 'New Project Template',
    sheet_name: 'Tasks',
    sheet_json: [] // Empty array creates empty sheet
  });
  
  console.log(`Empty sheet created: ${result.spreadsheetId}`);
  return result.spreadsheetId;
}
```

## Error Handling

The function throws errors in the following cases:

- **Missing required parameters**: If `title`, `sheet_name`, or `sheet_json` is not provided
- **Invalid parameter type**: If `sheet_json` is not an array
- **MCP response errors**: If the MCP tool execution fails
- **JSON parsing errors**: If the response cannot be parsed
- **Tool execution failure**: If the Google Sheets API returns an error

### Example with Error Handling

```typescript
import { request as createSheetFromJson } from '@/sdk/mcp-clients/686de48c6fd1cae1afbb55ba/GOOGLESHEETS_SHEET_FROM_JSON';

async function safeCreateSheet() {
  try {
    const result = await createSheetFromJson({
      title: 'My Report',
      sheet_name: 'Data',
      sheet_json: [
        { Column1: 'Value1', Column2: 100 }
      ]
    });
    
    return { success: true, spreadsheetId: result.spreadsheetId };
  } catch (error) {
    console.error('Failed to create sheet:', error);
    return { success: false, error: error.message };
  }
}
```

## Notes

- All objects in `sheet_json` must have the same keys (these become column headers)
- Values can be strings, numbers, booleans, or null (null values create empty cells)
- The first object's keys determine the header row structure
- Empty array `[]` is valid and creates a spreadsheet with an empty worksheet
- The returned `spreadsheetId` can be used to access the sheet at: `https://docs.google.com/spreadsheets/d/{spreadsheetId}`