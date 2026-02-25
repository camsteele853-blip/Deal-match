# Firecrawl Extract - Cheatsheet

Extract structured data from web pages using natural language prompts or JSON schemas.

## Installation/Import

```typescript
import { request as extractFromUrls } from '@/sdk/mcp-clients/68f0a290f81ae7b79782adc9/FIRECRAWL_EXTRACT';
```

## Function Signature

```typescript
async function request(params: ExtractParams): Promise<ExtractData>
```

## Parameters

### `ExtractParams`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `urls` | `string[]` | ✅ Yes | Array of URLs to extract data from (max 10). Supports wildcards like `https://example.com/blog/*` |
| `prompt` | `string \| null` | ⚠️ Conditional | Natural language query describing what to extract. Required if `schema` is not provided |
| `schema` | `Record<string, any> \| null` | ⚠️ Conditional | JSON Schema object defining extraction structure. Required if `prompt` is not provided |
| `enable_web_search` | `boolean` | ❌ No | Allow crawling outside initial domains (default: `false`) |

**Note**: At least one of `prompt` or `schema` must be provided.

## Return Value

### `ExtractData`

Returns an object containing:

- `success` / `successful`: Boolean indicating if extraction succeeded
- `data`: The extracted structured data (structure varies based on schema/prompt)
- `creditsUsed`: Number of credits consumed (when completed)
- `tokensUsed`: Number of tokens used (when completed)
- `status`: Job status (`'completed'`, `'processing'`, `'failed'`, `'cancelled'`)
- `id`: Unique job identifier (UUID)
- `urlTrace`: Array of processed URLs
- `sources`: Source information (if requested)
- `error`: Error message if failed
- `warning`: Warning message if non-critical issues occurred

## Usage Examples

### Example 1: Extract using natural language prompt

```typescript
import { request as extractFromUrls } from '@/sdk/mcp-clients/68f0a290f81ae7b79782adc9/FIRECRAWL_EXTRACT';

const result = await extractFromUrls({
  urls: ['https://firecrawl.dev/'],
  prompt: 'Extract the company mission, whether it supports SSO, and if it is open source'
});

console.log(result.data); // Extracted information
console.log(`Credits used: ${result.creditsUsed}`);
```

### Example 2: Extract using JSON schema

```typescript
import { request as extractFromUrls } from '@/sdk/mcp-clients/68f0a290f81ae7b79782adc9/FIRECRAWL_EXTRACT';

const result = await extractFromUrls({
  urls: ['https://firecrawl.dev/', 'https://docs.firecrawl.dev/'],
  schema: {
    type: 'object',
    properties: {
      company_mission: { type: 'string' },
      supports_sso: { type: 'boolean' },
      is_open_source: { type: 'boolean' },
      is_in_yc: { type: 'boolean' }
    },
    required: ['company_mission', 'supports_sso', 'is_open_source', 'is_in_yc']
  },
  enable_web_search: false
});

console.log(result.data);
// {
//   company_mission: "...",
//   supports_sso: true,
//   is_open_source: true,
//   is_in_yc: true
// }
```

### Example 3: Extract from multiple pages with wildcards

```typescript
import { request as extractFromUrls } from '@/sdk/mcp-clients/68f0a290f81ae7b79782adc9/FIRECRAWL_EXTRACT';

const result = await extractFromUrls({
  urls: ['https://example.com/blog/*'],
  prompt: 'Extract all blog post titles and publication dates',
  enable_web_search: true
});

console.log(result.urlTrace); // See which URLs were processed
console.log(result.data); // Extracted blog information
```

## Error Handling

The function throws errors in the following cases:

1. **Missing required parameters**: `urls` array is missing or empty
2. **URL limit exceeded**: More than 10 URLs provided (beta limitation)
3. **Missing extraction method**: Neither `prompt` nor `schema` provided
4. **Invalid MCP response**: Response format is malformed
5. **JSON parse error**: Response content cannot be parsed
6. **Tool execution failure**: The extraction job failed (check `error` field)
7. **No data returned**: Successful response but no data present

### Error Handling Example

```typescript
try {
  const result = await extractFromUrls({
    urls: ['https://example.com'],
    prompt: 'Extract company information'
  });
  
  if (result.warning) {
    console.warn('Warning:', result.warning);
  }
  
  console.log(result.data);
} catch (error) {
  if (error instanceof Error) {
    console.error('Extraction failed:', error.message);
  }
}
```

## Notes

- **Beta Limitations**: Maximum 10 URLs per request
- **Wildcards**: Use `*` in URLs to crawl multiple pages under a path
- **Credits**: Each extraction consumes credits based on pages processed
- **Async Processing**: Large extractions may return with `status: 'processing'`
- **Data Structure**: The `data` field structure varies based on your schema/prompt
- **Web Search**: Set `enable_web_search: true` to follow external links

## Best Practices

1. **Be specific with prompts**: Clear, detailed prompts yield better results
2. **Use schemas for structured data**: JSON schemas provide consistent output format
3. **Handle warnings**: Check the `warning` field for non-critical issues
4. **Monitor credits**: Track `creditsUsed` to manage API usage
5. **Validate URLs**: Ensure URLs are accessible before extraction
6. **Check status**: For large jobs, poll the status if needed