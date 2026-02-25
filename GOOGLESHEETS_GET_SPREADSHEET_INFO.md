# Google Sheets - Get Spreadsheet Info

Retrieves comprehensive information about a Google Sheets spreadsheet including properties, sheets, named ranges, data sources, and metadata.

## Installation/Import

```typescript
import { request as getSpreadsheetInfo } from '@/sdk/mcp-clients/686de48c6fd1cae1afbb55ba/GOOGLESHEETS_GET_SPREADSHEET_INFO';
```

## Function Signature

```typescript
async function request(params: GetSpreadsheetInfoParams): Promise<GetSpreadsheetInfoData>
```

## Parameters

### `GetSpreadsheetInfoParams`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `spreadsheet_id` | `string` | Yes | The Google Sheets spreadsheet ID or full URL. Accepts either the ID alone or a full Google Sheets URL. The ID will be automatically extracted from URLs. |

**Examples:**
- Spreadsheet ID: `"1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"`
- Full URL: `"https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"`

## Return Value

### `GetSpreadsheetInfoData`

Returns an object containing comprehensive spreadsheet information:

| Property | Type | Description |
|----------|------|-------------|
| `spreadsheetId` | `string` | The spreadsheet ID (read-only) |
| `spreadsheetUrl` | `string?` | The URL of the spreadsheet (read-only) |
| `properties` | `SpreadsheetProperties?` | Overall spreadsheet properties including title, locale, timeZone, autoRecalc, defaultFormat, iterativeCalculationSettings, spreadsheetTheme, etc. |
| `sheets` | `Sheet[]?` | Array of sheets (tabs) with properties like sheetId, title, index, sheetType, gridProperties, and more |
| `namedRanges` | `NamedRange[]?` | Named ranges defined in the spreadsheet |
| `dataSources` | `DataSource[]?` | External data sources connected with the spreadsheet (e.g., BigQuery, Looker) |
| `dataSourceSchedules` | `DataSourceSchedule[]?` | Refresh schedules for external data sources (output only) |
| `developerMetadata` | `DeveloperMetadata[]?` | Spreadsheet-level developer metadata entries |

## Usage Examples

### Example 1: Get spreadsheet info using ID

```typescript
import { request as getSpreadsheetInfo } from '@/sdk/mcp-clients/686de48c6fd1cae1afbb55ba/GOOGLESHEETS_GET_SPREADSHEET_INFO';

async function fetchSpreadsheetDetails() {
  try {
    const info = await getSpreadsheetInfo({
      spreadsheet_id: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'
    });
    
    console.log('Spreadsheet ID:', info.spreadsheetId);
    console.log('Spreadsheet URL:', info.spreadsheetUrl);
    console.log('Title:', info.properties?.title);
    console.log('Number of sheets:', info.sheets?.length);
    
    // List all sheet names
    info.sheets?.forEach(sheet => {
      console.log('Sheet:', sheet.properties?.title);
    });
  } catch (error) {
    console.error('Failed to get spreadsheet info:', error);
  }
}
```

### Example 2: Get spreadsheet info using full URL

```typescript
import { request as getSpreadsheetInfo } from '@/sdk/mcp-clients/686de48c6fd1cae1afbb55ba/GOOGLESHEETS_GET_SPREADSHEET_INFO';

async function analyzeSpreadsheet() {
  try {
    const info = await getSpreadsheetInfo({
      spreadsheet_id: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit'
    });
    
    // Access spreadsheet properties
    const { properties, sheets, namedRanges } = info;
    
    console.log('Locale:', properties?.locale);
    console.log('Time Zone:', properties?.timeZone);
    console.log('Named Ranges:', namedRanges?.length || 0);
    
    // Access sheet details
    sheets?.forEach(sheet => {
      const sheetProps = sheet.properties;
      console.log(`Sheet "${sheetProps?.title}" has ${sheetProps?.gridProperties?.rowCount} rows`);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Example 3: Check for data sources

```typescript
import { request as getSpreadsheetInfo } from '@/sdk/mcp-clients/686de48c6fd1cae1afbb55ba/GOOGLESHEETS_GET_SPREADSHEET_INFO';

async function checkDataSources(spreadsheetId: string) {
  const info = await getSpreadsheetInfo({ spreadsheet_id: spreadsheetId });
  
  if (info.dataSources && info.dataSources.length > 0) {
    console.log('This spreadsheet has external data sources:');
    info.dataSources.forEach(ds => {
      console.log('Data source:', ds);
    });
  } else {
    console.log('No external data sources found');
  }
  
  return info;
}
```

## Error Handling

The function may throw errors in the following cases:

1. **Missing required parameter**: If `spreadsheet_id` is not provided or is empty
   ```typescript
   // Throws: "Missing required parameter: spreadsheet_id"
   ```

2. **Invalid parameter type**: If `spreadsheet_id` is not a non-empty string
   ```typescript
   // Throws: "Parameter spreadsheet_id must be a non-empty string"
   ```

3. **MCP response format error**: If the MCP tool returns an invalid response format
   ```typescript
   // Throws: "Invalid MCP response format: missing content[0].text"
   ```

4. **JSON parsing error**: If the response cannot be parsed as JSON
   ```typescript
   // Throws: "Failed to parse MCP response JSON: [error details]"
   ```

5. **Tool execution failure**: If the MCP tool execution fails
   ```typescript
   // Throws: Error message from the tool or "MCP tool execution failed"
   ```

6. **Missing data**: If the tool returns success but no data
   ```typescript
   // Throws: "MCP tool returned successful response but no data"
   ```

### Recommended Error Handling Pattern

```typescript
try {
  const info = await getSpreadsheetInfo({ spreadsheet_id: 'your-id-here' });
  // Process info...
} catch (error) {
  if (error instanceof Error) {
    console.error('Error getting spreadsheet info:', error.message);
    // Handle specific error cases based on error.message
  } else {
    console.error('Unknown error occurred');
  }
}
```

## Notes

- The function automatically extracts the spreadsheet ID from full Google Sheets URLs
- All array properties (sheets, namedRanges, dataSources, etc.) are optional and may be undefined
- The `spreadsheetId` property is always present in successful responses
- Properties contain detailed metadata objects that can be explored based on Google Sheets API structure