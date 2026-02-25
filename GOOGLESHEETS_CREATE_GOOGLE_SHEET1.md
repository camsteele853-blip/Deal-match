# Google Sheets - Create Google Sheet

Create a new Google Sheets spreadsheet in the authenticated user's Google Drive.

## Installation/Import

```typescript
import { request as createGoogleSheet } from '@/sdk/mcp-clients/686de48c6fd1cae1afbb55ba/GOOGLESHEETS_CREATE_GOOGLE_SHEET1';
```

## Function Signature

```typescript
async function request(params?: CreateGoogleSheetParams): Promise<CreateGoogleSheetData>
```

## Parameters

### `CreateGoogleSheetParams`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | `string` | No | The title for the new Google Sheet. If omitted, Google will create a spreadsheet with a default name like 'Untitled spreadsheet'. |

**Examples:**
- `"Q4 Financial Report"`
- `"Project Plan Ideas"`
- `"Meeting Notes"`

## Return Value

### `CreateGoogleSheetData`

The function returns a promise that resolves to an object containing:

| Property | Type | Description |
|----------|------|-------------|
| `spreadsheetId` | `string` | The ID of the spreadsheet (read-only) |
| `spreadsheetUrl` | `string` | The URL of the spreadsheet (read-only) |
| `sheets` | `Sheet[]` | All sheets in the spreadsheet |
| `properties` | `object` | Overall spreadsheet properties |
| `namedRanges` | `array` | Named ranges defined in the spreadsheet |
| `developerMetadata` | `array` | Developer metadata attached to the spreadsheet |
| `dataSources` | `array` | External data sources connected to the spreadsheet |
| `dataSourceSchedules` | `array` | Data source refresh schedules in the spreadsheet |

### Sheet Structure

Each sheet in the `sheets` array contains:
- `properties.title`: Display name of the sheet tab
- `properties.sheetId`: Numeric identifier of the sheet tab
- `properties.index`: Zero-based position of the sheet tab
- `properties.sheetType`: Type of the sheet (e.g., 'GRID')
- `properties.gridProperties.rowCount`: Number of rows in the sheet grid
- `properties.gridProperties.columnCount`: Number of columns in the sheet grid

## Usage Examples

### Example 1: Create a spreadsheet with a custom title

```typescript
import { request as createGoogleSheet } from '@/sdk/mcp-clients/686de48c6fd1cae1afbb55ba/GOOGLESHEETS_CREATE_GOOGLE_SHEET1';

async function createFinancialReport() {
  try {
    const result = await createGoogleSheet({
      title: 'Q4 Financial Report'
    });
    
    console.log('Spreadsheet created successfully!');
    console.log('Spreadsheet ID:', result.spreadsheetId);
    console.log('Spreadsheet URL:', result.spreadsheetUrl);
    console.log('Number of sheets:', result.sheets?.length);
    
    return result;
  } catch (error) {
    console.error('Failed to create spreadsheet:', error);
    throw error;
  }
}
```

### Example 2: Create a spreadsheet with default title

```typescript
import { request as createGoogleSheet } from '@/sdk/mcp-clients/686de48c6fd1cae1afbb55ba/GOOGLESHEETS_CREATE_GOOGLE_SHEET1';

async function createUntitledSpreadsheet() {
  try {
    // Omit title parameter to use Google's default naming
    const result = await createGoogleSheet();
    
    console.log('Spreadsheet created with default title');
    console.log('Access it at:', result.spreadsheetUrl);
    
    // Access sheet information
    if (result.sheets && result.sheets.length > 0) {
      const firstSheet = result.sheets[0];
      console.log('First sheet title:', firstSheet.properties?.title);
      console.log('Grid size:', 
        `${firstSheet.properties?.gridProperties?.rowCount} rows x ` +
        `${firstSheet.properties?.gridProperties?.columnCount} columns`
      );
    }
    
    return result;
  } catch (error) {
    console.error('Failed to create spreadsheet:', error);
    throw error;
  }
}
```

### Example 3: Create multiple spreadsheets

```typescript
import { request as createGoogleSheet } from '@/sdk/mcp-clients/686de48c6fd1cae1afbb55ba/GOOGLESHEETS_CREATE_GOOGLE_SHEET1';

async function createMultipleSpreadsheets() {
  const titles = [
    'January Sales Report',
    'February Sales Report',
    'March Sales Report'
  ];
  
  try {
    const spreadsheets = await Promise.all(
      titles.map(title => createGoogleSheet({ title }))
    );
    
    console.log('Created spreadsheets:');
    spreadsheets.forEach((sheet, index) => {
      console.log(`${index + 1}. ${titles[index]}: ${sheet.spreadsheetUrl}`);
    });
    
    return spreadsheets;
  } catch (error) {
    console.error('Failed to create spreadsheets:', error);
    throw error;
  }
}
```

## Error Handling

The function may throw errors in the following cases:

1. **Invalid MCP Response**: If the MCP server returns a malformed response
   ```typescript
   Error: 'Invalid MCP response format: missing content[0].text'
   ```

2. **JSON Parse Error**: If the response cannot be parsed as JSON
   ```typescript
   Error: 'Failed to parse MCP response JSON: [error details]'
   ```

3. **Tool Execution Failure**: If the Google Sheets API returns an error
   ```typescript
   Error: 'MCP tool execution failed' or specific error message from the API
   ```

4. **Missing Data**: If the tool returns success but no data
   ```typescript
   Error: 'MCP tool returned successful response but no data'
   ```

### Recommended Error Handling Pattern

```typescript
import { request as createGoogleSheet } from '@/sdk/mcp-clients/686de48c6fd1cae1afbb55ba/GOOGLESHEETS_CREATE_GOOGLE_SHEET1';

async function safeCreateSpreadsheet(title: string) {
  try {
    const result = await createGoogleSheet({ title });
    return { success: true, data: result };
  } catch (error) {
    console.error('Error creating spreadsheet:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
```

## Notes

- The function requires proper authentication with Google Sheets API
- The created spreadsheet will be owned by the authenticated user
- The spreadsheet is created in the user's Google Drive root folder by default
- Each new spreadsheet typically starts with one default sheet named "Sheet1"
- The `spreadsheetId` can be used with other Google Sheets API operations
- The `spreadsheetUrl` provides direct browser access to the spreadsheet