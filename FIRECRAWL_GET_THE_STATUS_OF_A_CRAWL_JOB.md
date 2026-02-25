# Firecrawl Get Crawl Status

Get the status of a Firecrawl crawl job by its unique identifier.

## Installation/Import

```typescript
import { request as getFirecrawlCrawlStatus } from '@/sdk/mcp-clients/68f0a290f81ae7b79782adc9/FIRECRAWL_GET_THE_STATUS_OF_A_CRAWL_JOB';
```

## Function Signature

```typescript
async function request(params: GetCrawlStatusParams): Promise<GetCrawlStatusData>
```

## Parameters

### `GetCrawlStatusParams`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | Yes | Unique identifier (UUID) of the crawl job |

**Example:**
```typescript
{
  id: "f5e5a0c5-0b7c-455e-8c1a-31e0b0d1f3b0"
}
```

## Return Value

### `GetCrawlStatusData`

Returns an object containing:

| Property | Type | Description |
|----------|------|-------------|
| `status` | `string` | Current status: 'scraping', 'completed', or 'failed' |
| `total` | `number` | Total number of pages attempted to crawl |
| `completed` | `number` | Number of pages successfully crawled |
| `creditsUsed` | `number` | Number of credits used for the crawl |
| `expiresAt` | `string` | Date/time when the crawl will expire (ISO 8601) |
| `data` | `CrawledPage[]` | Array of crawled page objects with content |
| `successful` | `boolean` | Whether the action execution was successful |
| `error` | `string \| null` | Error message if any occurred |
| `next` | `string \| null` | URL to retrieve next 10MB of data (if applicable) |

### `CrawledPage` Object

Each crawled page contains:

- `markdown`: Markdown-formatted page content
- `html`: HTML version of content (if requested)
- `rawHtml`: Raw HTML content (if requested)
- `links`: List of links on the page (if requested)
- `screenshot`: Screenshot of the page (if requested)
- `metadata`: Object with title, description, keywords, language, sourceURL, statusCode, error, etc.

## Usage Examples

### Basic Usage

```typescript
import { request as getFirecrawlCrawlStatus } from '@/sdk/mcp-clients/68f0a290f81ae7b79782adc9/FIRECRAWL_GET_THE_STATUS_OF_A_CRAWL_JOB';

async function checkCrawlStatus() {
  try {
    const result = await getFirecrawlCrawlStatus({
      id: 'f5e5a0c5-0b7c-455e-8c1a-31e0b0d1f3b0'
    });

    console.log(`Status: ${result.status}`);
    console.log(`Progress: ${result.completed}/${result.total} pages`);
    console.log(`Credits used: ${result.creditsUsed}`);
    console.log(`Expires at: ${result.expiresAt}`);

    // Access crawled pages
    result.data.forEach((page, index) => {
      console.log(`Page ${index + 1}:`);
      console.log(`  URL: ${page.metadata.sourceURL}`);
      console.log(`  Title: ${page.metadata.title}`);
      console.log(`  Status Code: ${page.metadata.statusCode}`);
    });
  } catch (error) {
    console.error('Failed to get crawl status:', error);
  }
}
```

### Polling for Completion

```typescript
import { request as getFirecrawlCrawlStatus } from '@/sdk/mcp-clients/68f0a290f81ae7b79782adc9/FIRECRAWL_GET_THE_STATUS_OF_A_CRAWL_JOB';

async function waitForCrawlCompletion(crawlId: string, pollIntervalMs = 5000) {
  while (true) {
    const status = await getFirecrawlCrawlStatus({ id: crawlId });

    console.log(`Status: ${status.status} (${status.completed}/${status.total})`);

    if (status.status === 'completed') {
      console.log('Crawl completed successfully!');
      return status;
    }

    if (status.status === 'failed') {
      throw new Error(`Crawl failed: ${status.error}`);
    }

    // Wait before polling again
    await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
  }
}
```

### Processing Crawled Data

```typescript
import { request as getFirecrawlCrawlStatus } from '@/sdk/mcp-clients/68f0a290f81ae7b79782adc9/FIRECRAWL_GET_THE_STATUS_OF_A_CRAWL_JOB';

async function extractCrawlContent(crawlId: string) {
  const result = await getFirecrawlCrawlStatus({ id: crawlId });

  if (result.status !== 'completed') {
    console.warn(`Crawl not yet completed. Status: ${result.status}`);
  }

  // Extract markdown content from all pages
  const allContent = result.data
    .filter(page => page.markdown)
    .map(page => ({
      url: page.metadata.sourceURL,
      title: page.metadata.title,
      content: page.markdown
    }));

  return allContent;
}
```

## Error Handling

The function may throw errors in the following cases:

1. **Missing Required Parameter**: If `id` is not provided
   ```typescript
   Error: Missing required parameter: id
   ```

2. **Invalid MCP Response**: If the response format is incorrect
   ```typescript
   Error: Invalid MCP response format: missing content[0].text
   ```

3. **JSON Parse Error**: If the response cannot be parsed
   ```typescript
   Error: Failed to parse MCP response JSON: [error details]
   ```

4. **Tool Execution Failure**: If the crawl status retrieval fails
   ```typescript
   Error: MCP tool execution failed
   // or
   Error: [specific error message from the tool]
   ```

5. **Missing Data**: If the response is successful but contains no data
   ```typescript
   Error: MCP tool returned successful response but no data
   ```

### Error Handling Example

```typescript
try {
  const result = await getFirecrawlCrawlStatus({ id: crawlId });
  
  if (result.error) {
    console.warn('Crawl completed with errors:', result.error);
  }
  
  // Process result...
} catch (error) {
  if (error instanceof Error) {
    if (error.message.includes('Missing required parameter')) {
      console.error('Invalid input: crawl ID is required');
    } else if (error.message.includes('parse')) {
      console.error('Response parsing error:', error.message);
    } else {
      console.error('Crawl status retrieval failed:', error.message);
    }
  }
}
```

## Notes

- The crawl job ID must be a valid UUID obtained from initiating a crawl
- Crawl data expires at the time specified in `expiresAt`
- If the response is larger than 10MB, use the `next` URL to retrieve additional data
- The `data` array contains all crawled pages with their extracted content
- Check the `status` field to determine if the crawl is still in progress, completed, or failed
- Individual pages may have errors in their `metadata.error` field even if the overall crawl succeeds