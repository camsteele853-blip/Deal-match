# Firecrawl Crawl - Web Crawler Module

## Overview

This module provides a function to initiate web crawls using Firecrawl, allowing you to systematically extract content from websites with customizable depth, path filtering, and output formats.

## Installation/Import

```typescript
import { request as crawlWebsite } from '@/sdk/mcp-clients/68f0a290f81ae7b79782adc9/FIRECRAWL_CRAWL';
```

## Function Signature

```typescript
async function request(params: CrawlParams): Promise<CrawlData>
```

## Parameters

### Required Parameters

- **`url`** (string): The base URL to start crawling from. This is the initial entry point for the web crawler.
  - Example: `"https://firecrawl.dev/"`

### Optional Crawl Control Parameters

- **`limit`** (number): Maximum number of pages to crawl. Default is 10.
  - Example: `10`, `20`, `50`

- **`maxDepth`** (number): Maximum depth of subpages to crawl relative to the entered URL.
  - Example: `0` (only entered URL), `1` (one level deeper), `2` (two levels deeper)

- **`maxDiscoveryDepth`** (number): Maximum depth based on discovery order.
  - Example: `1`, `2`, `3`

- **`crawlEntireDomain`** (boolean): If true, allows crawling internal links to sibling or parent URLs.
  - Example: `true`, `false`

- **`allowExternalLinks`** (boolean): If true, allows following links to external websites.
  - Example: `true`, `false`

- **`includePaths`** (string[]): Regex patterns for URL paths to include in the crawl.
  - Example: `["products/featured/.*", "docs/api/v1/.*"]`

- **`excludePaths`** (string[]): Regex patterns for URL paths to exclude from the crawl.
  - Example: `["blog/archive/.*", "private/.*"]`

- **`ignoreSitemap`** (boolean): If true, ignore sitemap.xml.
  - Example: `true`, `false`

- **`ignoreQueryParameters`** (boolean): If true, ignore query parameters when checking visited URLs.
  - Example: `true`, `false`

- **`delay`** (number): Delay in milliseconds between requests.
  - Example: `100`, `500`, `1000`

### Scrape Options Parameters

- **`scrapeOptions_formats`** (array): Desired output formats. Default is `["markdown"]`.
  - Options: `"markdown"`, `"html"`, `"rawHtml"`, `"links"`, `"screenshot"`, `"json"`
  - Example: `["markdown", "html"]`

- **`scrapeOptions_onlyMainContent`** (boolean): Extract only main content, excluding headers/footers. Default is true.
  - Example: `true`, `false`

- **`scrapeOptions_includeTags`** (string[]): HTML tags to specifically include.
  - Example: `["article", "main", "h1", "p"]`

- **`scrapeOptions_excludeTags`** (string[]): HTML tags to exclude.
  - Example: `["nav", "footer", "script", "style"]`

- **`scrapeOptions_headers`** (object): Custom HTTP headers.
  - Example: `{ "Accept": "text/html", "User-Agent": "CustomBot/1.0" }`

- **`scrapeOptions_waitFor`** (number): Additional milliseconds to wait before scraping.
  - Example: `0`, `500`, `1000`

- **`scrapeOptions_timeout`** (number): Timeout in milliseconds for each page request. Default is 30000ms.
  - Example: `5000`, `15000`, `30000`

- **`scrapeOptions_jsonOptions`** (object): Options for JSON extraction (required if "json" format is used).
  - Properties: `prompt`, `systemPrompt`, `json_schema`

- **`scrapeOptions_actions`** (array): Actions to perform before scraping (click, wait, scroll, etc.).

- **`scrapeOptions_mobile`** (boolean): Emulate mobile device.
  - Example: `true`, `false`

- **`scrapeOptions_parsePDF`** (boolean): Parse PDF files.
  - Example: `true`, `false`

- **`scrapeOptions_blockAds`** (boolean): Block advertisements.
  - Example: `true`, `false`

- **`webhook`** (string): Webhook URL for real-time crawl updates.
  - Example: `"https://api.example.com/webhook/firecrawl-status"`

## Return Value

Returns a `Promise<CrawlData>` object containing:

- **`success`** (boolean): Whether the API call was successful
- **`status`** (string): Current state of the crawl job ('scraping', 'completed', 'failed')
- **`total`** (number): Total number of pages identified to crawl
- **`completed`** (number): Number of pages successfully crawled
- **`creditsUsed`** (number): API credits consumed
- **`expiresAt`** (string): ISO 8601 timestamp when results expire
- **`data`** (CrawledPage[]): Array of crawled page results
  - Each page contains: `metadata`, `markdown`, `html`, `rawHtml`, `links`, `screenshot`, `extract`, `actions`
- **`successful`** (boolean): Whether the action execution was successful
- **`next`** (string, optional): URL for next batch of results (if response exceeds 10MB)
- **`warning`** (string, optional): Warning messages for non-fatal issues
- **`error`** (string, optional): Error message if crawl failed

## Usage Examples

### Basic Crawl

```typescript
import { request as crawlWebsite } from '@/sdk/mcp-clients/68f0a290f81ae7b79782adc9/FIRECRAWL_CRAWL';

async function basicCrawl() {
  try {
    const result = await crawlWebsite({
      url: 'https://firecrawl.dev/',
      limit: 10
    });
    
    console.log(`Crawled ${result.completed} of ${result.total} pages`);
    console.log(`Credits used: ${result.creditsUsed}`);
    
    result.data.forEach(page => {
      console.log(`Page: ${page.metadata.url}`);
      console.log(`Title: ${page.metadata.title}`);
      console.log(`Content: ${page.markdown?.substring(0, 200)}...`);
    });
  } catch (error) {
    console.error('Crawl failed:', error);
  }
}
```

### Advanced Crawl with Path Filtering

```typescript
import { request as crawlWebsite } from '@/sdk/mcp-clients/68f0a290f81ae7b79782adc9/FIRECRAWL_CRAWL';

async function advancedCrawl() {
  try {
    const result = await crawlWebsite({
      url: 'https://example.com/',
      limit: 50,
      maxDepth: 2,
      includePaths: ['docs/.*', 'blog/.*'],
      excludePaths: ['blog/archive/.*', 'private/.*'],
      scrapeOptions_formats: ['markdown', 'html'],
      scrapeOptions_onlyMainContent: true,
      scrapeOptions_excludeTags: ['nav', 'footer', 'aside'],
      scrapeOptions_timeout: 15000
    });
    
    console.log(`Status: ${result.status}`);
    console.log(`Completed: ${result.completed}/${result.total}`);
    
    if (result.warning) {
      console.warn('Warning:', result.warning);
    }
    
    return result.data;
  } catch (error) {
    console.error('Advanced crawl failed:', error);
    throw error;
  }
}
```

### Crawl with JSON Extraction

```typescript
import { request as crawlWebsite } from '@/sdk/mcp-clients/68f0a290f81ae7b79782adc9/FIRECRAWL_CRAWL';

async function crawlWithJsonExtraction() {
  try {
    const result = await crawlWebsite({
      url: 'https://example.com/products',
      limit: 20,
      scrapeOptions_formats: ['markdown', 'json'],
      scrapeOptions_jsonOptions: {
        prompt: 'Extract product information including name, price, and description',
        json_schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            price: { type: 'number' },
            description: { type: 'string' }
          }
        }
      }
    });
    
    result.data.forEach(page => {
      if (page.extract) {
        console.log('Extracted data:', page.extract);
      }
    });
    
    return result;
  } catch (error) {
    console.error('JSON extraction crawl failed:', error);
    throw error;
  }
}
```

### Crawl with Webhook Notifications

```typescript
import { request as crawlWebsite } from '@/sdk/mcp-clients/68f0a290f81ae7b79782adc9/FIRECRAWL_CRAWL';

async function crawlWithWebhook() {
  try {
    const result = await crawlWebsite({
      url: 'https://example.com/',
      limit: 100,
      webhook: 'https://api.myapp.com/webhook/firecrawl',
      scrapeOptions_formats: ['markdown']
    });
    
    console.log('Crawl initiated with webhook notifications');
    console.log(`Job status: ${result.status}`);
    
    return result;
  } catch (error) {
    console.error('Webhook crawl failed:', error);
    throw error;
  }
}
```

## Error Handling

The function throws errors in the following cases:

1. **Missing Required Parameter**: If `url` is not provided
   ```typescript
   Error: Missing required parameter: url
   ```

2. **JSON Options Validation**: If "json" format is used without `scrapeOptions_jsonOptions`
   ```typescript
   Error: scrapeOptions_jsonOptions is required when "json" format is specified
   ```

3. **MCP Response Format Error**: If the MCP response is malformed
   ```typescript
   Error: Invalid MCP response format: missing content[0].text
   ```

4. **JSON Parse Error**: If the response cannot be parsed
   ```typescript
   Error: Failed to parse MCP response JSON: [error details]
   ```

5. **Tool Execution Error**: If the crawl fails
   ```typescript
   Error: MCP tool execution failed
   ```

6. **No Data Returned**: If successful but no data is present
   ```typescript
   Error: MCP tool returned successful response but no data
   ```

## Best Practices

1. **Set Appropriate Limits**: Use `limit` and `maxDepth` to control crawl scope and avoid excessive resource usage
2. **Use Path Filtering**: Leverage `includePaths` and `excludePaths` to focus on relevant content
3. **Respect Rate Limits**: Use `delay` parameter to avoid overwhelming target servers
4. **Choose Formats Wisely**: Select only the formats you need to minimize processing time and credits
5. **Handle Webhooks**: For large crawls, use webhooks to receive real-time updates instead of polling
6. **Check Warnings**: Always check the `warning` field for important information about crawl limitations
7. **Monitor Credits**: Track `creditsUsed` to manage API quota effectively

## Notes

- Default crawl limit is 10 pages
- Default format is markdown
- Main content extraction is enabled by default
- Crawl results expire after a certain time (check `expiresAt`)
- Large responses (>10MB) are paginated - use the `next` field to retrieve additional data
- JSON extraction requires both the "json" format and `scrapeOptions_jsonOptions` to be specified