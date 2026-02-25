import { callMCPTool } from '@/sdk/core/mcp-client';

/**
 * MCP Response wrapper interface - MANDATORY
 * All MCP tools return responses in this wrapped format
 */
interface MCPToolResponse {
  content: Array<{
    type: "text";
    text: string; // JSON string containing actual tool data
  }>;
}

/**
 * Action to perform on a page before scraping
 */
export interface Action {
  /** Type of action to perform */
  type: 'wait' | 'click' | 'write' | 'press' | 'scroll' | 'screenshot';
  /** CSS selector for the element to interact with */
  selector?: string;
  /** Text to write (for 'write' action) */
  text?: string;
  /** Milliseconds to wait (for 'wait' action) */
  milliseconds?: number;
  /** Coordinate array for click/scroll actions */
  coordinate?: number[];
}

/**
 * Options for tracking changes between crawls
 */
export interface ChangeTrackingOptions {
  /** Tag for change tracking */
  tag?: string;
  /** Prompt for change tracking */
  prompt?: string;
  /** Change tracking modes */
  modes?: string[];
  /** Schema for change tracking */
  data_schema?: Record<string, any>;
}

/**
 * Options for JSON format extraction
 */
export interface JsonOptions {
  /** User prompt for JSON extraction */
  prompt?: string;
  /** System prompt for JSON extraction */
  systemPrompt?: string;
  /** JSON schema for structured extraction */
  json_schema?: Record<string, any>;
}

/**
 * Geolocation settings for the scraper
 */
export interface Location {
  /** Country code for geolocation */
  country?: string;
  /** Language preferences */
  languages?: string[];
}

/**
 * Input parameters for initiating a web crawl
 */
export interface CrawlParams {
  /** The base URL to start crawling from. This is the initial entry point for the web crawler. */
  url: string;
  
  /** Maximum number of pages to crawl. The crawl will stop once this limit is reached. Default is 10. */
  limit?: number;
  
  /** Maximum depth of subpages to crawl relative to the entered URL (not the base domain). A depth of 0 crawls only the entered URL, 1 crawls the entered URL plus pages one path segment deeper, 2 adds two segments deeper, etc. For example, if URL is 'https://example.com/docs/api/', maxDepth=1 crawls '/docs/api/' and '/docs/api/something/'. */
  maxDepth?: number;
  
  /** Maximum depth to crawl based on discovery order. The root site and sitemapped pages have a discovery depth of 0. For example, if you set it to 1 and set ignoreSitemap, you will only crawl the entered URL and all URLs that are linked on that page. */
  maxDiscoveryDepth?: number;
  
  /** If true, allows the crawler to follow internal links to sibling or parent URLs, not just child paths. This is the recommended replacement for 'allowBackwardLinks'. */
  crawlEntireDomain?: boolean;
  
  /** DEPRECATED: Use 'crawlEntireDomain' instead. If true, allows the crawler to navigate to pages that were linked from pages already visited (i.e., navigate 'backwards'). */
  allowBackwardLinks?: boolean;
  
  /** If true, allows the crawler to follow links that lead to external websites (different domains). */
  allowExternalLinks?: boolean;
  
  /** A list of Regular Expression (regex) patterns for URL paths to include in the crawl. Only URLs whose paths match one of these patterns will be processed. For example, `"products/featured/.*"` would only include paths under `/products/featured/`. */
  includePaths?: string[];
  
  /** A list of Regular Expression (regex) patterns for URL paths to exclude from the crawl. URLs whose paths match any of these patterns will be ignored. For example, `"blog/archive/.*"` would exclude all paths under `/blog/archive/`. */
  excludePaths?: string[];
  
  /** If true, the crawler will ignore any sitemap.xml found on the website. */
  ignoreSitemap?: boolean;
  
  /** If true, ignore query parameters when determining if a URL has been visited */
  ignoreQueryParameters?: boolean;
  
  /** Delay in milliseconds between requests to avoid overwhelming the server */
  delay?: number;
  
  /** An optional webhook URL to receive real-time updates on the crawl job. Events include crawl start (`crawl.started`), page crawled (`crawl.page`), and crawl completion (`crawl.completed` or `crawl.failed`). The payload structure matches the `/scrape` endpoint response. */
  webhook?: string;
  
  /** Specifies the desired output formats for the scraped content from each page. Default is `["markdown"]`. IMPORTANT: If "json" format is included, scrapeOptions_jsonOptions must also be provided. */
  scrapeOptions_formats?: Array<'markdown' | 'html' | 'rawHtml' | 'links' | 'screenshot' | 'json'>;
  
  /** If true, attempts to extract only the main content of each page, excluding common elements like headers, navigation bars, and footers. Default is true. */
  scrapeOptions_onlyMainContent?: boolean;
  
  /** A list of HTML tags to specifically include in the scraped output. Only content within these tags will be processed. If empty or null, all relevant content is considered based on other options. */
  scrapeOptions_includeTags?: string[];
  
  /** A list of HTML tags to exclude from the scraped output. Content within these tags (and their children) will be removed before processing. */
  scrapeOptions_excludeTags?: string[];
  
  /** Custom HTTP headers to send with each request */
  scrapeOptions_headers?: Record<string, string>;
  
  /** Additional milliseconds to wait after Firecrawl's smart wait, before scraping the page. Useful for pages with dynamically loaded content or heavy JavaScript. Use sparingly as Firecrawl already waits intelligently. */
  scrapeOptions_waitFor?: number;
  
  /** Timeout in milliseconds for each page request. Default is 30000ms (30 seconds) */
  scrapeOptions_timeout?: number;
  
  /** Options for JSON format extraction including schema and prompts. REQUIRED when 'json' format is specified in scrapeOptions_formats. Conversely, if this is provided, 'json' must be included in scrapeOptions_formats. */
  scrapeOptions_jsonOptions?: JsonOptions;
  
  /** List of actions to perform on each page before scraping (e.g., clicking buttons, waiting) */
  scrapeOptions_actions?: Action[];
  
  /** Geolocation settings for the scraper */
  scrapeOptions_location?: Location;
  
  /** If true, emulate a mobile device when scraping */
  scrapeOptions_mobile?: boolean;
  
  /** If true, skip TLS certificate verification */
  scrapeOptions_skipTlsVerification?: boolean;
  
  /** If true, remove base64-encoded images from the scraped content */
  scrapeOptions_removeBase64Images?: boolean;
  
  /** If true, attempt to parse PDF files encountered during crawling */
  scrapeOptions_parsePDF?: boolean;
  
  /** If true, block advertisements during scraping */
  scrapeOptions_blockAds?: boolean;
  
  /** Proxy configuration for requests */
  scrapeOptions_proxy?: string;
  
  /** Maximum age in seconds for cached content. If content is older than this, it will be re-scraped */
  scrapeOptions_maxAge?: number;
  
  /** If true, store scraped content in cache for future use */
  scrapeOptions_storeInCache?: boolean;
  
  /** Options for tracking changes between crawls */
  scrapeOptions_changeTrackingOptions?: ChangeTrackingOptions;
}

/**
 * Metadata for a crawled page
 */
export interface PageMetadata {
  /** Original URL that was requested for crawling */
  sourceURL: string;
  
  /** Final URL after any redirects */
  url?: string;
  
  /** HTTP status code returned when accessing the page */
  statusCode: number;
  
  /** Page title from the title tag */
  title?: string;
  
  /** Meta description of the page */
  description?: string;
  
  /** Meta keywords from the page */
  keywords?: string;
  
  /** Detected language of the page content */
  language?: string;
  
  /** Content-Type of the response (e.g., 'text/html') */
  contentType?: string;
  
  /** Array of alternative locale versions from Open Graph tags */
  ogLocaleAlternate?: string[];
  
  /** Viewport meta tag value from the page */
  viewport?: string;
  
  /** Unique identifier for this specific scrape operation */
  scrapeId?: string;
  
  /** Unique identifier for the page in Firecrawl's index */
  indexId?: string;
  
  /** Number of API credits consumed for scraping this specific page */
  creditsUsed?: number;
  
  /** Whether the result was served from cache ('hit', 'miss') */
  cacheState?: string;
  
  /** ISO 8601 timestamp of when this page was cached */
  cachedAt?: string;
  
  /** Type of proxy used for the request (e.g., 'basic', 'premium') */
  proxyUsed?: string;
  
  /** Timezone used for the scrape operation */
  timezone?: string;
  
  /** Error message if the page scrape failed */
  error?: string;
}

/**
 * Data from a single crawled page
 */
export interface CrawledPage {
  /** Page metadata container */
  metadata: PageMetadata;
  
  /** Page content converted to clean, LLM-ready markdown format */
  markdown?: string;
  
  /** Processed HTML content of the page */
  html?: string;
  
  /** Original unprocessed HTML content of the page */
  rawHtml?: string;
  
  /** Array of URLs found on the page */
  links?: string[];
  
  /** Base64-encoded screenshot or URL of the rendered page */
  screenshot?: string;
  
  /** Structured data extracted from the page using LLM extraction */
  extract?: Record<string, any>;
  
  /** Record of automated actions performed on the page (click, scroll, write, wait, press, etc.) */
  actions?: Array<Record<string, any>>;
}

/**
 * Output data from a web crawl operation
 */
export interface CrawlData {
  /** Indicates whether the API call was successful */
  success: boolean;
  
  /** Current state of the crawl job. Possible values: 'scraping', 'completed', 'failed' */
  status: string;
  
  /** Total number of pages identified to crawl */
  total: number;
  
  /** Number of pages successfully crawled */
  completed: number;
  
  /** API credits consumed by this crawl job */
  creditsUsed: number;
  
  /** ISO 8601 timestamp indicating when the crawl results will expire and be deleted */
  expiresAt: string;
  
  /** Array of crawled page results */
  data: CrawledPage[];
  
  /** Whether or not the action execution was successful or not */
  successful: boolean;
  
  /** URL for retrieving the next batch of results when response exceeds 10MB. Null when all data has been retrieved */
  next?: string;
  
  /** Warning message for issues like robots.txt limitations, low results, or other non-fatal problems. Null when no warnings */
  warning?: string;
  
  /** Error if any occurred during the execution of the action */
  error?: string;
}

/**
 * Internal response wrapper interface from outputSchema
 */
interface CrawlResponse {
  successful: boolean;
  data?: CrawlData;
  error?: string;
}

/**
 * Initiates a web crawl starting from a base URL with customizable options for depth,
 * path filtering, content extraction formats, and scraping behavior.
 *
 * This function allows you to crawl websites systematically, extracting content in various
 * formats (markdown, HTML, JSON, screenshots) while respecting crawl limits, depth constraints,
 * and path inclusion/exclusion patterns.
 *
 * @param params - The crawl configuration parameters including URL, limits, and scrape options
 * @returns Promise resolving to the crawl results with page data and metadata
 * @throws Error if the required 'url' parameter is missing or if the crawl execution fails
 *
 * @example
 * const result = await request({
 *   url: 'https://firecrawl.dev/',
 *   limit: 10,
 *   scrapeOptions_formats: ['markdown', 'html']
 * });
 */
export async function request(params: CrawlParams): Promise<CrawlData> {
  // Validate required parameters
  if (!params.url) {
    throw new Error('Missing required parameter: url');
  }
  
  // Validate jsonOptions requirement
  if (params.scrapeOptions_formats?.includes('json') && !params.scrapeOptions_jsonOptions) {
    throw new Error('scrapeOptions_jsonOptions is required when "json" format is specified in scrapeOptions_formats');
  }
  
  if (params.scrapeOptions_jsonOptions && !params.scrapeOptions_formats?.includes('json')) {
    throw new Error('"json" must be included in scrapeOptions_formats when scrapeOptions_jsonOptions is provided');
  }
  
  // CRITICAL: Use MCPToolResponse and parse JSON response
  const mcpResponse = await callMCPTool<MCPToolResponse, CrawlParams>(
    '68f0a290f81ae7b79782adc9',
    'FIRECRAWL_CRAWL',
    params
  );
  
  if (!mcpResponse.content?.[0]?.text) {
    throw new Error('Invalid MCP response format: missing content[0].text');
  }
  
  let toolData: CrawlResponse;
  try {
    toolData = JSON.parse(mcpResponse.content[0].text);
  } catch (parseError) {
    throw new Error(
      `Failed to parse MCP response JSON: ${
        parseError instanceof Error ? parseError.message : 'Unknown error'
      }`
    );
  }
  
  if (!toolData.successful) {
    throw new Error(toolData.error || 'MCP tool execution failed');
  }
  
  if (!toolData.data) {
    throw new Error('MCP tool returned successful response but no data');
  }
  
  return toolData.data;
}