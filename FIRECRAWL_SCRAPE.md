# Firecrawl Scrape Tool

A TypeScript client for scraping web pages using Firecrawl MCP tool. Extracts content in multiple formats including markdown, HTML, screenshots, and structured JSON data with LLM-powered extraction.

## Installation

```typescript
import { request as scrapeWithFirecrawl } from '@/sdk/mcp-clients/68f0a290f81ae7b79782adc9/FIRECRAWL_SCRAPE';
```

## Function Signature

```typescript
async function request(params: ScrapeParams): Promise<ScrapeData>
```

## Parameters

### Required Parameters

- **url** (string): The fully qualified URL of the web page to scrape

### Optional Parameters

- **formats** (array): Output formats for scraped content. Options: `'markdown'`, `'html'`, `'rawHtml'`, `'links'`, `'screenshot'`, `'json'`, `'screenshot@fullPage'`. Default: `['markdown']`
- **onlyMainContent** (boolean): Extract only main article content, excluding headers/footers/navigation. Default: `true`
- **includeTags** (string[]): HTML tags to specifically include in output
- **excludeTags** (string[]): HTML tags to exclude from output
- **waitFor** (number): Milliseconds to wait for page load before scraping. Default: `0`
- **timeout** (number): Maximum milliseconds to wait for scraping completion. Default: `30000`
- **actions** (Action[]): Browser actions to perform before scraping (click, write, wait, press, scroll)
- **jsonOptions** (JsonOptions): LLM extraction settings when using JSON format
  - **schema**: JSON Schema for structured data extraction
  - **prompt**: User-defined extraction prompt
  - **systemPrompt**: System-level LLM guidance (v1 API only)
- **location** (LocationRequest): Geographic location simulation
  - **country**: ISO 3166-1 alpha-2 country code (e.g., 'US', 'AU')
  - **languages**: Preferred languages array (e.g., ['en-US', 'en'])

## Return Value

Returns a `ScrapeData` object containing:

- **metadata** (Metadata): Page metadata including title, description, Open Graph tags, HTTP status
- **markdown** (string): LLM-ready markdown content
- **html** (string): Cleaned HTML content
- **rawHtml** (string): Unprocessed raw HTML
- **links** (string[]): Extracted URLs
- **screenshot** (string): Base64-encoded screenshot or URL
- **json** (object): Structured data extracted via LLM
- **summary** (string): AI-generated page summary
- **actions** (ActionsResult): Results from browser automation
- **branding** (Branding): Brand identity information
- **changeTracking** (ChangeTracking): Change detection data

## Usage Examples

### Basic Scraping

```typescript
import { request as scrapeWithFirecrawl } from '@/sdk/mcp-clients/68f0a290f81ae7b79782adc9/FIRECRAWL_SCRAPE';

// Scrape page as markdown
const result = await scrapeWithFirecrawl({
  url: 'https://example.com/article'
});

console.log(result.markdown);
console.log(result.metadata.title);
```

### Multiple Formats

```typescript
// Get markdown, HTML, and screenshot
const result = await scrapeWithFirecrawl({
  url: 'https://example.com',
  formats: ['markdown', 'html', 'screenshot'],
  onlyMainContent: true
});

console.log(result.markdown);
console.log(result.html);
console.log(result.screenshot); // Base64 image
```

### Structured Data Extraction

```typescript
// Extract structured data using JSON schema
const result = await scrapeWithFirecrawl({
  url: 'https://example.com/product',
  formats: ['json'],
  jsonOptions: {
    schema: {
      type: 'object',
      properties: {
        product_name: { type: 'string' },
        price: { type: 'number' },
        features: {
          type: 'array',
          items: { type: 'string' }
        }
      }
    }
  }
});

console.log(result.json);
// { product_name: "Widget", price: 29.99, features: [...] }
```

### Browser Automation

```typescript
// Perform actions before scraping
const result = await scrapeWithFirecrawl({
  url: 'https://example.com/search',
  formats: ['markdown'],
  actions: [
    {
      type: 'write',
      selector: '#search-input',
      text: 'TypeScript'
    },
    {
      type: 'click',
      selector: '#search-button'
    },
    {
      type: 'wait',
      milliseconds: 2000
    }
  ]
});

console.log(result.markdown);
```

### Geographic Location Simulation

```typescript
// Scrape from specific country with language preferences
const result = await scrapeWithFirecrawl({
  url: 'https://example.com',
  formats: ['markdown'],
  location: {
    country: 'DE',
    languages: ['de-DE', 'de']
  }
});
```

### Content Filtering

```typescript
// Include only specific tags
const result = await scrapeWithFirecrawl({
  url: 'https://example.com/blog',
  formats: ['markdown'],
  includeTags: ['article', 'h1', 'h2', 'p'],
  excludeTags: ['script', 'style', 'nav', 'footer']
});
```

## Error Handling

The function throws errors in the following cases:

- **Missing URL**: Required `url` parameter not provided
- **Invalid MCP Response**: Malformed response from MCP tool
- **JSON Parse Error**: Failed to parse MCP response
- **Scrape Failure**: Firecrawl operation failed (check error message for details)
- **No Data**: Successful response but no data returned

```typescript
try {
  const result = await scrapeWithFirecrawl({
    url: 'https://example.com'
  });
  console.log(result.markdown);
} catch (error) {
  if (error instanceof Error) {
    console.error('Scrape failed:', error.message);
  }
}
```

## Common Error Codes

- **SCRAPE_ALL_ENGINES_FAILED**: All scraping engines failed
- **SCRAPE_TIMEOUT**: Scraping operation timed out
- **NO_EXTRACTABLE_CONTENT**: No content could be extracted from page

## Notes

- Default timeout is 30 seconds (30000ms)
- Cannot use both `'screenshot'` and `'screenshot@fullPage'` in same request
- When using `'json'` format, `jsonOptions` must be provided
- `systemPrompt` in `jsonOptions` only works with v1 API
- Geographic location simulation requires valid ISO 3166-1 alpha-2 country codes