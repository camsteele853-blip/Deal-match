# Firecrawl Search Module

Execute web searches using Firecrawl's search API with optional content scraping in multiple formats.

## Installation/Import

```typescript
import { request as useFirecrawlSearch } from '@/sdk/mcp-clients/68f0a290f81ae7b79782adc9/FIRECRAWL_SEARCH';
```

## Function Signature

```typescript
async function request(params: FirecrawlSearchParams): Promise<FirecrawlSearchData>
```

## Parameters

### `FirecrawlSearchParams`

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `q` | `string` | ✅ Yes | - | The search query to execute |
| `country` | `string \| null` | No | `"us"` | Country code for tailored results (e.g., 'us', 'uk', 'fr') |
| `lang` | `string \| null` | No | `"en"` | Language code for results (e.g., 'en', 'es', 'fr') |
| `limit` | `number \| null` | No | `5` | Maximum number of results (1-100) |
| `formats` | `string[] \| null` | No | `null` | Output formats for scraped content: 'markdown', 'html', 'rawHtml', 'links', 'screenshot', 'screenshot@fullPage' |
| `timeout` | `number \| null` | No | `60000` | Maximum time in milliseconds (1000-300000) |

## Return Value

### `FirecrawlSearchData`

Returns an object containing search results organized by type:

```typescript
{
  web?: WebSearchResult[];      // Web search results
  images?: ImageSearchResult[]; // Image search results
  news?: NewsSearchResult[];    // News search results
}
```

### `WebSearchResult`

- `title` (string): Page title
- `description` (string): Meta description or summary
- `url` (string): URL of the result
- `category?` (string): Content classification
- `markdown?` (string): Cleaned markdown content (if format requested)
- `html?` (string): HTML content (if format requested)
- `rawHtml?` (string): Raw HTML markup (if format requested)
- `links?` (string[]): Extracted hyperlinks (if format requested)
- `screenshot?` (string): Base64-encoded screenshot (if format requested)
- `metadata?` (MetadataResponse): Page metadata
- `position?` (number): Ranking position

### `ImageSearchResult`

- `title?` (string): Image title
- `url?` (string): Source page URL
- `imageUrl?` (string): Direct image URL
- `imageWidth?` (number): Image width in pixels
- `imageHeight?` (number): Image height in pixels
- `position?` (number): Ranking position

### `NewsSearchResult`

- `title` (string): Article title
- `url` (string): Article URL
- `snippet?` (string): Brief excerpt
- `date?` (string): Publication date
- `imageUrl?` (string): Article image URL
- `markdown?` (string): Article content in markdown (if format requested)
- `html?` (string): Article HTML (if format requested)
- `rawHtml?` (string): Raw HTML (if format requested)
- `links?` (string[]): Extracted links (if format requested)
- `screenshot?` (string): Screenshot (if format requested)
- `metadata?` (MetadataResponse): Article metadata
- `position?` (number): Ranking position

## Usage Examples

### Basic Search

```typescript
import { request as useFirecrawlSearch } from '@/sdk/mcp-clients/68f0a290f81ae7b79782adc9/FIRECRAWL_SEARCH';

async function searchBasic() {
  const results = await useFirecrawlSearch({
    q: 'what is firecrawl?'
  });
  
  // Access web results
  if (results.web) {
    results.web.forEach(result => {
      console.log(`${result.title}: ${result.url}`);
      console.log(result.description);
    });
  }
}
```

### Advanced Search with Content Scraping

```typescript
import { request as useFirecrawlSearch } from '@/sdk/mcp-clients/68f0a290f81ae7b79782adc9/FIRECRAWL_SEARCH';

async function searchWithScraping() {
  const results = await useFirecrawlSearch({
    q: 'typescript best practices',
    country: 'us',
    lang: 'en',
    limit: 10,
    formats: ['markdown', 'html', 'links'],
    timeout: 120000
  });
  
  // Access scraped content
  if (results.web) {
    results.web.forEach(result => {
      console.log(`Title: ${result.title}`);
      console.log(`URL: ${result.url}`);
      
      // Access markdown content if available
      if (result.markdown) {
        console.log('Markdown content:', result.markdown);
      }
      
      // Access extracted links if available
      if (result.links) {
        console.log('Links found:', result.links.length);
      }
    });
  }
  
  // Access image results
  if (results.images) {
    console.log(`Found ${results.images.length} images`);
  }
  
  // Access news results
  if (results.news) {
    console.log(`Found ${results.news.length} news articles`);
  }
}
```

### Search with Screenshots

```typescript
import { request as useFirecrawlSearch } from '@/sdk/mcp-clients/68f0a290f81ae7b79782adc9/FIRECRAWL_SEARCH';

async function searchWithScreenshots() {
  const results = await useFirecrawlSearch({
    q: 'react documentation',
    limit: 5,
    formats: ['markdown', 'screenshot@fullPage']
  });
  
  if (results.web) {
    results.web.forEach(result => {
      console.log(`${result.title}: ${result.url}`);
      
      // Screenshot is base64-encoded
      if (result.screenshot) {
        console.log('Screenshot available (base64)');
        // Can be used in img src: `data:image/png;base64,${result.screenshot}`
      }
    });
  }
}
```

## Error Handling

The function may throw errors in the following cases:

- **Missing required parameter**: If `q` (search query) is not provided
- **Invalid parameter range**: If `limit` is not between 1-100 or `timeout` is not between 1000-300000
- **MCP response error**: If the MCP tool returns an invalid response format
- **JSON parsing error**: If the response cannot be parsed
- **Tool execution failure**: If the Firecrawl API returns an error
- **Network errors**: If the MCP tool call fails due to connectivity issues

### Error Handling Example

```typescript
import { request as useFirecrawlSearch } from '@/sdk/mcp-clients/68f0a290f81ae7b79782adc9/FIRECRAWL_SEARCH';

async function searchWithErrorHandling() {
  try {
    const results = await useFirecrawlSearch({
      q: 'machine learning tutorials',
      limit: 20,
      formats: ['markdown']
    });
    
    console.log('Search successful:', results);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Search failed:', error.message);
      
      // Handle specific error types
      if (error.message.includes('Missing required parameter')) {
        console.error('Please provide a search query');
      } else if (error.message.includes('must be between')) {
        console.error('Invalid parameter range');
      } else {
        console.error('Unexpected error occurred');
      }
    }
  }
}
```

## Notes

- **Credits**: Each search operation consumes API credits from your Firecrawl account
- **Formats**: Requesting multiple formats (especially screenshots) increases processing time and credit usage
- **Timeout**: Adjust timeout based on the number of results and formats requested
- **Rate Limits**: Be aware of Firecrawl API rate limits when making multiple requests
- **Result Types**: Not all searches return all result types (web, images, news) - check for null/undefined
- **Metadata**: The `metadata` field contains additional information about scraped pages including HTTP status codes and errors