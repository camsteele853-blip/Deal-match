# Firecrawl URL Mapper - Cheatsheet

## Overview

This module provides functionality to map and discover multiple URLs from a base URL using the Firecrawl service. It supports advanced filtering options including subdomain inclusion, query parameter filtering, result limits, and smart search queries.

## Installation/Import

```typescript
import { request as mapFirecrawlUrls } from '@/sdk/mcp-clients/68f0a290f81ae7b79782adc9/FIRECRAWL_MAP_MULTIPLE_URLS_BASED_ON_OPTIONS';
```

## Function Signature

```typescript
async function request(params: MapUrlsParams): Promise<MapUrlsData>
```

## Parameters

### MapUrlsParams

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | `string` | ✅ Yes | The primary base URL from which the mapping process will begin |
| `ignoreQueryParameters` | `boolean \| null` | No | If true, excludes URLs with query parameters. Defaults to true |
| `includeSubdomains` | `boolean \| null` | No | If true, includes subdomains in mapping. Defaults to true |
| `limit` | `number \| null` | No | Maximum number of links to return (default: 5000, max: 100000) |
| `search` | `string \| null` | No | Optional search query to guide URL mapping and prioritize specific page types |
| `timeout` | `number \| null` | No | Timeout in milliseconds. No timeout by default |

### Examples

```typescript
// Basic URL mapping
{
  url: 'https://example.com'
}

// With search query and limit
{
  url: 'https://example.com',
  limit: 100,
  search: 'product reviews'
}

// Exclude query parameters and subdomains
{
  url: 'https://example.com',
  ignoreQueryParameters: true,
  includeSubdomains: false,
  limit: 500
}
```

## Return Value

### MapUrlsData

```typescript
{
  success: boolean;           // Indicates if the API call was successful
  links: LinkResult[];        // Array of discovered URLs with metadata
  warning?: string | null;    // Optional warning messages
}
```

### LinkResult

```typescript
{
  url: string;                // Full URL of the discovered page
  title?: string | null;      // Page title or heading (if available)
  description?: string | null; // Page summary or meta description (if available)
}
```

## Usage Examples

### Example 1: Basic URL Mapping

```typescript
import { request as mapFirecrawlUrls } from '@/sdk/mcp-clients/68f0a290f81ae7b79782adc9/FIRECRAWL_MAP_MULTIPLE_URLS_BASED_ON_OPTIONS';

async function discoverWebsiteUrls() {
  try {
    const result = await mapFirecrawlUrls({
      url: 'https://example.com',
      limit: 100
    });

    console.log(`Found ${result.links.length} URLs`);
    result.links.forEach(link => {
      console.log(`- ${link.url}`);
      if (link.title) console.log(`  Title: ${link.title}`);
    });

    if (result.warning) {
      console.warn('Warning:', result.warning);
    }
  } catch (error) {
    console.error('Failed to map URLs:', error);
  }
}
```

### Example 2: Smart Search with Filtering

```typescript
import { request as mapFirecrawlUrls } from '@/sdk/mcp-clients/68f0a290f81ae7b79782adc9/FIRECRAWL_MAP_MULTIPLE_URLS_BASED_ON_OPTIONS';

async function findSpecificPages() {
  try {
    const result = await mapFirecrawlUrls({
      url: 'https://blog.example.com',
      search: 'articles about AI',
      limit: 50,
      includeSubdomains: true,
      ignoreQueryParameters: true,
      timeout: 30000
    });

    // Results are ordered by relevance when using search
    console.log('Most relevant pages:');
    result.links.slice(0, 10).forEach((link, index) => {
      console.log(`${index + 1}. ${link.title || 'No title'}`);
      console.log(`   ${link.url}`);
      if (link.description) {
        console.log(`   ${link.description}`);
      }
    });
  } catch (error) {
    console.error('Search failed:', error);
  }
}
```

### Example 3: Large-Scale Mapping

```typescript
import { request as mapFirecrawlUrls } from '@/sdk/mcp-clients/68f0a290f81ae7b79782adc9/FIRECRAWL_MAP_MULTIPLE_URLS_BASED_ON_OPTIONS';

async function mapEntireWebsite() {
  try {
    const result = await mapFirecrawlUrls({
      url: 'https://example.com',
      limit: 10000,
      includeSubdomains: true,
      timeout: 60000
    });

    console.log(`Successfully mapped ${result.links.length} URLs`);
    
    // Group by subdomain
    const bySubdomain = result.links.reduce((acc, link) => {
      const hostname = new URL(link.url).hostname;
      if (!acc[hostname]) acc[hostname] = [];
      acc[hostname].push(link);
      return acc;
    }, {} as Record<string, typeof result.links>);

    Object.entries(bySubdomain).forEach(([hostname, links]) => {
      console.log(`${hostname}: ${links.length} pages`);
    });
  } catch (error) {
    console.error('Mapping failed:', error);
  }
}
```

## Error Handling

The function may throw errors in the following scenarios:

1. **Missing Required Parameters**: If `url` parameter is not provided
   ```typescript
   Error: Missing required parameter: url
   ```

2. **Invalid MCP Response**: If the MCP service returns malformed data
   ```typescript
   Error: Invalid MCP response format: missing content[0].text
   ```

3. **JSON Parse Error**: If the response cannot be parsed as JSON
   ```typescript
   Error: Failed to parse MCP response JSON: [error details]
   ```

4. **Tool Execution Failure**: If the Firecrawl service reports an error
   ```typescript
   Error: [error message from service]
   ```

5. **Empty Response**: If the tool succeeds but returns no data
   ```typescript
   Error: MCP tool returned successful response but no data
   ```

### Error Handling Example

```typescript
try {
  const result = await mapFirecrawlUrls({
    url: 'https://example.com',
    limit: 100
  });
  
  // Handle warnings
  if (result.warning) {
    console.warn('Warning:', result.warning);
  }
  
  // Process results
  console.log(`Found ${result.links.length} URLs`);
} catch (error) {
  if (error instanceof Error) {
    if (error.message.includes('Missing required parameter')) {
      console.error('Configuration error:', error.message);
    } else if (error.message.includes('timeout')) {
      console.error('Request timed out, try increasing timeout parameter');
    } else {
      console.error('Unexpected error:', error.message);
    }
  }
}
```

## Notes

- **Search Relevance**: When using the `search` parameter, results are ordered from most relevant to least relevant
- **Alpha Limitations**: Smart search is limited to 1000 initial results in Alpha, but overall mapping can exceed this
- **Default Values**: `ignoreQueryParameters` and `includeSubdomains` default to `true` if not specified
- **Rate Limits**: Be mindful of rate limits when mapping large websites
- **Robots.txt**: The service respects robots.txt rules, which may limit accessible URLs
- **Metadata Availability**: `title` and `description` fields may not be available for all URLs depending on the website structure