# Google Sheets - Search Spreadsheets

Search for Google Sheets spreadsheets based on various criteria including name, content, dates, and sharing status.

## Installation/Import

```typescript
import { request as searchSpreadsheets } from '@/sdk/mcp-clients/686de48c6fd1cae1afbb55ba/GOOGLESHEETS_SEARCH_SPREADSHEETS';
```

## Function Signature

```typescript
async function request(params: SearchSpreadsheetsParams): Promise<SearchSpreadsheetsData>
```

## Parameters

### `SearchSpreadsheetsParams`

All parameters are optional. If no parameters are provided, the function returns all accessible spreadsheets.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `query` | `string` | - | Search query to filter spreadsheets. Behavior depends on `search_type`. |
| `search_type` | `'name' \| 'content' \| 'both'` | `'name'` | How to search: 'name' searches filenames (prefix matching), 'content' searches inside spreadsheet content, 'both' searches both. |
| `max_results` | `number` | `10` | Maximum number of spreadsheets to return (1-1000). |
| `order_by` | `string` | `'modifiedTime desc'` | Order results by field (e.g., 'modifiedTime desc', 'name', 'createdTime desc'). |
| `created_after` | `string` | - | Return spreadsheets created after this date (RFC 3339 format). |
| `modified_after` | `string` | - | Return spreadsheets modified after this date (RFC 3339 format). |
| `shared_with_me` | `boolean` | `false` | Return only spreadsheets shared with the current user. |
| `starred_only` | `boolean` | `false` | Return only starred spreadsheets. |
| `include_shared_drives` | `boolean` | `true` | Include spreadsheets from shared drives. |
| `include_trashed` | `boolean` | `false` | Include spreadsheets in trash. |

## Return Value

### `SearchSpreadsheetsData`

```typescript
{
  spreadsheets: SpreadsheetFile[];  // List of matching spreadsheets
  total_found: number;               // Number of spreadsheets returned
  search_message?: string;           // Informational message about results
  next_page_token?: string;          // Token for pagination (if more results exist)
}
```

### `SpreadsheetFile`

Each spreadsheet object contains:

- `id`: Unique spreadsheet identifier
- `name`: Spreadsheet name
- `webViewLink`: URL to view the spreadsheet
- `createdTime`: Creation timestamp
- `modifiedTime`: Last modification timestamp
- `starred`: Whether the spreadsheet is starred
- `trashed`: Whether the spreadsheet is in trash
- `owners`: List of spreadsheet owners
- `permissions`: List of permissions
- `shared`: Whether the spreadsheet is shared
- `lastModifyingUser`: Information about the last user who modified it

## Usage Examples

### Example 1: Search by Name

```typescript
import { request as searchSpreadsheets } from '@/sdk/mcp-clients/686de48c6fd1cae1afbb55ba/GOOGLESHEETS_SEARCH_SPREADSHEETS';

// Search for spreadsheets with "Budget" in the name
const results = await searchSpreadsheets({
  query: 'Budget',
  search_type: 'name',
  max_results: 20
});

console.log(`Found ${results.total_found} spreadsheets`);
results.spreadsheets.forEach(sheet => {
  console.log(`${sheet.name} - ${sheet.webViewLink}`);
});
```

### Example 2: Find Recently Modified Spreadsheets

```typescript
import { request as searchSpreadsheets } from '@/sdk/mcp-clients/686de48c6fd1cae1afbb55ba/GOOGLESHEETS_SEARCH_SPREADSHEETS';

// Get spreadsheets modified in the last week
const oneWeekAgo = new Date();
oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

const results = await searchSpreadsheets({
  modified_after: oneWeekAgo.toISOString(),
  order_by: 'modifiedTime desc',
  max_results: 50
});

console.log(`Found ${results.total_found} recently modified spreadsheets`);
```

### Example 3: Search Shared Spreadsheets

```typescript
import { request as searchSpreadsheets } from '@/sdk/mcp-clients/686de48c6fd1cae1afbb55ba/GOOGLESHEETS_SEARCH_SPREADSHEETS';

// Find all spreadsheets shared with me
const results = await searchSpreadsheets({
  shared_with_me: true,
  order_by: 'name'
});

console.log(`You have access to ${results.total_found} shared spreadsheets`);
```

### Example 4: Advanced Search with Content

```typescript
import { request as searchSpreadsheets } from '@/sdk/mcp-clients/686de48c6fd1cae1afbb55ba/GOOGLESHEETS_SEARCH_SPREADSHEETS';

// Search for "sales data" in both name and content
const results = await searchSpreadsheets({
  query: 'sales data',
  search_type: 'both',
  starred_only: true,
  max_results: 10
});

console.log(`Found ${results.total_found} starred spreadsheets containing "sales data"`);
```

### Example 5: Get All Spreadsheets with Pagination

```typescript
import { request as searchSpreadsheets } from '@/sdk/mcp-clients/686de48c6fd1cae1afbb55ba/GOOGLESHEETS_SEARCH_SPREADSHEETS';

// Get all spreadsheets (no query parameter)
const results = await searchSpreadsheets({
  max_results: 100,
  order_by: 'modifiedTime desc'
});

console.log(`Retrieved ${results.total_found} spreadsheets`);
if (results.next_page_token) {
  console.log('More results available - use next_page_token for pagination');
}
```

## Error Handling

The function may throw errors in the following cases:

1. **Invalid Parameters**: If `max_results` is not between 1 and 1000
2. **MCP Response Error**: If the MCP tool returns an invalid response format
3. **JSON Parse Error**: If the response cannot be parsed as JSON
4. **Tool Execution Error**: If the Google Sheets API returns an error
5. **Authentication Error**: If the user is not authenticated or lacks permissions

### Example Error Handling

```typescript
import { request as searchSpreadsheets } from '@/sdk/mcp-clients/686de48c6fd1cae1afbb55ba/GOOGLESHEETS_SEARCH_SPREADSHEETS';

try {
  const results = await searchSpreadsheets({
    query: 'Budget Report',
    search_type: 'name'
  });
  
  console.log(`Found ${results.total_found} spreadsheets`);
} catch (error) {
  if (error instanceof Error) {
    console.error('Search failed:', error.message);
  }
}
```

## Notes

- **Name Search**: The 'name' search type uses prefix matching. Searching for "Budget" will find "Budget 2024" but NOT "Q1 Budget". Use 'both' for substring matching.
- **Date Format**: Use RFC 3339 format for dates (e.g., '2024-01-01T00:00:00Z' or '2024-12-01T12:00:00-08:00')
- **Pagination**: Use `next_page_token` from the response to retrieve additional pages of results
- **Empty Query**: Leaving `query` empty returns all accessible spreadsheets (filtered by other parameters)
- **Advanced Queries**: You can use Google Drive query syntax for advanced filtering (e.g., "name contains 'Budget'", "sharedWithMe = true")