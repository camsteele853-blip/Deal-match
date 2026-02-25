# Slack Search Messages - Cheatsheet

Search for messages in Slack using powerful query modifiers for date, location, user, and content filtering.

## Installation/Import

```typescript
import { request as searchSlackMessages } from '@/sdk/mcp-clients/688338e4ee9e1a9340d83b62/SLACK_SEARCH_FOR_MESSAGES_WITH_QUERY';
```

## Function Signature

```typescript
async function request(params: SearchMessagesParams): Promise<SearchMessagesData>
```

## Parameters

### Required Parameters

- **query** (string): Search query with support for various modifiers

### Optional Parameters

- **auto_paginate** (boolean): Enable automatic pagination to collect all results. Default: `false`
- **count** (number): Number of messages per page (max 100) or total messages if auto_paginate is enabled. Default: `1`
- **highlight** (boolean): Enable highlighting of search terms in results
- **page** (number): Page number for manual pagination (cannot be used with auto_paginate)
- **sort** (string): Sort by `score` (relevance) or `timestamp` (chronological)
- **sort_dir** (string): Sort direction `asc` or `desc`

### Query Modifiers

**Date Modifiers:**
- `on:YYYY-MM-DD` - Messages on specific date
- `before:YYYY-MM-DD` - Messages before date
- `after:YYYY-MM-DD` - Messages after date
- `during:YYYY-MM-DD` or `during:month` or `during:YYYY` - Messages during period

**Location Modifiers:**
- `in:#channel-name` - Messages in specific channel
- `in:@username` - Direct messages with user

**User Modifiers:**
- `from:@username` - Messages from specific user
- `from:botname` - Messages from bot

**Content Modifiers:**
- `has:link` - Messages with links
- `has:file` - Messages with files
- `has::star:` - Starred messages
- `has::pin:` - Pinned messages

**Special Characters:**
- `"exact phrase"` - Search exact phrase
- `*wildcard` - Wildcard matching
- `-exclude` - Exclude words

## Return Value

Returns `SearchMessagesData` object containing:

- **ok** (boolean): Whether the API call was successful
- **messages** (MessagesContainer | null): Container with search results
  - **matches** (MessageMatch[]): Array of matching messages
  - **total** (number): Total number of matching messages
  - **paging** (Paging): Pagination information
- **query** (string | null): The executed search query
- **error** (string | null): Error code if ok is false
- **response_metadata** (ResponseMetadata | null): Additional metadata and warnings

### Message Object Structure

Each message in `matches` contains:
- **text**: Message content (with highlight markers if enabled)
- **ts**: Message timestamp
- **channel**: Channel information (id, name, privacy settings)
- **permalink**: Permanent URL to the message
- **user**: User ID of message author
- **reactions**: Array of reactions
- **thread_ts**: Thread identifier
- **reply_count**: Number of replies
- And many more fields...

## Usage Examples

### Basic Search

```typescript
import { request as searchSlackMessages } from '@/sdk/mcp-clients/688338e4ee9e1a9340d83b62/SLACK_SEARCH_FOR_MESSAGES_WITH_QUERY';

// Search for messages on a specific date
const result = await searchSlackMessages({
  query: 'on:2025-09-25'
});

console.log(`Found ${result.messages?.total} messages`);
result.messages?.matches.forEach(msg => {
  console.log(`${msg.channel.name}: ${msg.text}`);
});
```

### Advanced Search with Filters

```typescript
// Search with multiple modifiers
const result = await searchSlackMessages({
  query: '"project update" on:2025-09-25 in:#marketing from:@john',
  count: 50,
  sort: 'timestamp',
  sort_dir: 'desc',
  highlight: true
});

// Access pagination info
console.log(`Page ${result.messages?.paging.page} of ${result.messages?.paging.pages}`);
console.log(`Total results: ${result.messages?.paging.total}`);
```

### Auto-Pagination Example

```typescript
// Automatically collect all matching messages
const result = await searchSlackMessages({
  query: 'bug report has:file in:#support',
  auto_paginate: true,
  count: 500  // Total messages desired
});

console.log(`Retrieved ${result.messages?.matches.length} messages`);
```

### Search with Date Range

```typescript
// Messages in a date range
const result = await searchSlackMessages({
  query: 'deployment after:2025-09-01 before:2025-09-30 in:#engineering'
});
```

### Search for Files and Links

```typescript
// Find messages with attachments
const result = await searchSlackMessages({
  query: 'has:file from:@alice in:#design',
  count: 20
});

// Find messages with links
const linkResults = await searchSlackMessages({
  query: 'has:link during:september'
});
```

## Error Handling

The function throws errors in the following cases:

1. **Missing Required Parameters**: If `query` is not provided
2. **Invalid MCP Response**: If the response format is invalid
3. **JSON Parse Error**: If the response cannot be parsed
4. **Tool Execution Failure**: If the Slack API returns an error

### Common Error Codes

When `ok` is `false`, the `error` field may contain:
- `not_authed`: No authentication token provided
- `invalid_auth`: Invalid authentication token
- `account_inactive`: Account is inactive
- `token_revoked`: Token has been revoked
- `no_permission`: User lacks permission
- `missing_scope`: Required OAuth scope is missing
- `invalid_arguments`: Invalid request parameters
- `fatal_error`: Server error
- `internal_error`: Internal Slack error

### Error Handling Example

```typescript
try {
  const result = await searchSlackMessages({
    query: 'project update in:#marketing'
  });
  
  if (!result.ok) {
    console.error(`Slack API error: ${result.error}`);
    return;
  }
  
  // Process results
  console.log(`Found ${result.messages?.total} messages`);
  
} catch (error) {
  if (error instanceof Error) {
    console.error(`Search failed: ${error.message}`);
  }
}
```

## Pagination Strategies

### Manual Pagination

```typescript
// Fetch page by page manually
for (let page = 1; page <= 5; page++) {
  const result = await searchSlackMessages({
    query: 'meeting notes',
    count: 100,
    page: page
  });
  
  console.log(`Page ${page}: ${result.messages?.matches.length} messages`);
}
```

### Automatic Pagination

```typescript
// Let the system handle pagination
const result = await searchSlackMessages({
  query: 'meeting notes',
  auto_paginate: true,
  count: 500  // Get 500 total messages
});

console.log(`Retrieved all ${result.messages?.matches.length} messages`);
```

## Tips

1. **Use Specific Queries**: Combine multiple modifiers for precise results
2. **Check Pagination**: Always check `paging.total` to see if more results exist
3. **Enable Highlighting**: Use `highlight: true` to see which terms matched
4. **Sort Appropriately**: Use `timestamp` sort for chronological order, `score` for relevance
5. **Handle Errors**: Always check `ok` field and handle potential errors
6. **Respect Limits**: Without auto_paginate, max count per page is 100
7. **Auto-Paginate Wisely**: Use auto_paginate when you need all results at once

## Notes

- Cannot use both `auto_paginate` and `page` parameters together
- When `highlight` is enabled, matching terms are wrapped with special Unicode markers (U+E000 and U+E001)
- Thread messages include `thread_ts` field to identify the parent thread
- Reactions, files, and attachments are included when present
- Channel privacy settings are included in the channel object