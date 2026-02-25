# Firecrawl Cancel Crawl Job

Cancel an active Firecrawl crawl job using its unique identifier.

## Installation/Import

```typescript
import { request as cancelCrawlJob } from '@/sdk/mcp-clients/68f0a290f81ae7b79782adc9/FIRECRAWL_CANCEL_A_CRAWL_JOB';
```

## Function Signature

```typescript
async function request(params: CancelCrawlJobParams): Promise<CancelCrawlJobData>
```

## Parameters

### `CancelCrawlJobParams`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | Yes | The unique identifier (UUID) of the crawl job to be canceled |

**Example:**
```typescript
{
  id: "c72c3457-79c2-4212-a7ac-25350a2785f3"
}
```

## Return Value

### `CancelCrawlJobData`

Returns an object with the following structure:

| Property | Type | Description |
|----------|------|-------------|
| `status` | `'cancelled'` | Indicates the operation outcome. Always 'cancelled' when successful |

**Example:**
```typescript
{
  status: "cancelled"
}
```

## Usage Examples

### Basic Usage

```typescript
import { request as cancelCrawlJob } from '@/sdk/mcp-clients/68f0a290f81ae7b79782adc9/FIRECRAWL_CANCEL_A_CRAWL_JOB';

async function stopCrawl() {
  try {
    const result = await cancelCrawlJob({
      id: 'c72c3457-79c2-4212-a7ac-25350a2785f3'
    });
    
    console.log('Crawl job canceled:', result.status); // 'cancelled'
  } catch (error) {
    console.error('Failed to cancel crawl job:', error);
  }
}
```

### With Error Handling

```typescript
import { request as cancelCrawlJob } from '@/sdk/mcp-clients/68f0a290f81ae7b79782adc9/FIRECRAWL_CANCEL_A_CRAWL_JOB';

async function cancelWithValidation(crawlJobId: string) {
  if (!crawlJobId) {
    throw new Error('Crawl job ID is required');
  }
  
  try {
    const result = await cancelCrawlJob({ id: crawlJobId });
    
    if (result.status === 'cancelled') {
      console.log('Successfully canceled crawl job');
      return true;
    }
    
    return false;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Cancellation error:', error.message);
    }
    throw error;
  }
}
```

### Integration in Application

```typescript
import { request as cancelCrawlJob } from '@/sdk/mcp-clients/68f0a290f81ae7b79782adc9/FIRECRAWL_CANCEL_A_CRAWL_JOB';

class CrawlJobManager {
  async cancelJob(jobId: string): Promise<boolean> {
    try {
      const result = await cancelCrawlJob({ id: jobId });
      return result.status === 'cancelled';
    } catch (error) {
      console.error(`Failed to cancel job ${jobId}:`, error);
      return false;
    }
  }
  
  async cancelMultipleJobs(jobIds: string[]): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    
    await Promise.all(
      jobIds.map(async (jobId) => {
        results[jobId] = await this.cancelJob(jobId);
      })
    );
    
    return results;
  }
}
```

## Error Handling

The function may throw errors in the following scenarios:

### Missing Required Parameters
```typescript
// Throws: "Missing required parameter: id"
await cancelCrawlJob({ id: '' });
```

### Invalid MCP Response
```typescript
// Throws: "Invalid MCP response format: missing content[0].text"
// This occurs when the MCP server returns an unexpected response structure
```

### JSON Parsing Errors
```typescript
// Throws: "Failed to parse MCP response JSON: [error details]"
// This occurs when the response text is not valid JSON
```

### Tool Execution Failure
```typescript
// Throws: "MCP tool execution failed" or specific error message
// This occurs when the Firecrawl API returns an error
```

### Best Practices

1. **Always wrap calls in try-catch blocks** to handle potential errors gracefully
2. **Validate the crawl job ID** before making the request
3. **Check the status property** in the response to confirm cancellation
4. **Handle network failures** and timeout scenarios appropriately
5. **Log errors** for debugging and monitoring purposes

## Notes

- The crawl job ID must be a valid UUID format
- Once a crawl job is canceled, it cannot be resumed
- The function will throw an error if the crawl job doesn't exist or has already completed
- Cancellation is immediate and cannot be undone