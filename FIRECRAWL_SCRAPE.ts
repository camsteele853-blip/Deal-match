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
 * Browser action to perform on the page before scraping
 */
export interface Action {
  /**
   * The type of browser action to perform on the page before scraping.
   * Supported actions: 'wait', 'click', 'screenshot', 'write', 'press', 'scroll'.
   */
  type: string;
  /**
   * CSS selector for the HTML element targeted by the action.
   * Required for actions like 'click' or 'write'.
   */
  selector?: string | null;
  /**
   * Text to be typed into an element, used with 'write' actions.
   */
  text?: string | null;
  /**
   * Key to press (e.g., 'Enter', 'Escape', 'Tab'), used with 'press' actions.
   */
  key?: string | null;
  /**
   * Specifies a duration in milliseconds, e.g., for a 'wait' action or a delay.
   */
  milliseconds?: number | null;
}

/**
 * Options for JSON extraction using LLM
 */
export interface JsonOptions {
  /**
   * A JSON Schema object defining the structure for data extraction.
   * The LLM will populate this schema with data from the page.
   */
  schema?: Record<string, any> | null;
  /**
   * A user-defined prompt for data extraction when a specific JSON schema is not provided.
   * Guides the LLM on what information to extract.
   */
  prompt?: string | null;
  /**
   * A system-level prompt to guide the LLM during JSON extraction.
   * Note: This parameter is only supported in v1 API; it is ignored when using v2 API.
   */
  systemPrompt?: string | null;
}

/**
 * Location settings for the request
 */
export interface LocationRequest {
  /**
   * ISO 3166-1 alpha-2 country code to make the request from (e.g., 'US', 'AU', 'DE', 'JP').
   */
  country?: string;
  /**
   * List of preferred languages and locales for the request, in order of priority.
   * Uses format like 'en-US'.
   */
  languages?: string[] | null;
}

/**
 * Input parameters for Firecrawl scrape request
 */
export interface ScrapeParams {
  /**
   * The fully qualified URL of the web page to scrape.
   */
  url: string;
  /**
   * A list of desired output formats for the scraped content.
   * Defaults to ['markdown']. Cannot include both 'screenshot' and 'screenshot@fullPage'.
   * If 'json' is included, jsonOptions must be provided.
   */
  formats?: Array<'markdown' | 'html' | 'rawHtml' | 'links' | 'screenshot' | 'json' | 'screenshot@fullPage'>;
  /**
   * If true, attempts to extract only the main article content, excluding headers, footers,
   * navigation bars, and ads. Defaults to true.
   */
  onlyMainContent?: boolean;
  /**
   * A list of HTML tags to specifically include in the output.
   * Content within these tags will be prioritized.
   */
  includeTags?: string[] | null;
  /**
   * A list of HTML tags to specifically exclude from the output.
   * Content within these tags will be removed.
   */
  excludeTags?: string[] | null;
  /**
   * Time in milliseconds to wait for the page to load or for dynamic content to render
   * before starting the scrape. Defaults to 0.
   */
  waitFor?: number;
  /**
   * Maximum time in milliseconds to wait for the scraping request to complete.
   * Defaults to 30000.
   */
  timeout?: number;
  /**
   * An optional list of browser actions (e.g., click, write, wait, press) to perform on the page
   * before scraping. Useful for interacting with dynamic content, filling forms, or navigating
   * through page elements.
   */
  actions?: Action[] | null;
  /**
   * Optional settings for extracting structured data from the page content using an LLM.
   * Only valid when formats includes 'json'.
   */
  jsonOptions?: JsonOptions | null;
  /**
   * Optional settings to simulate the request from a specific geographic location
   * and with preferred languages.
   */
  location?: LocationRequest | null;
}

/**
 * Results from browser automation actions
 */
export interface ActionsResult {
  /**
   * Array of screenshot URLs captured during actions.
   */
  screenshots?: string[] | null;
  /**
   * Array of PDF URLs extracted during actions.
   */
  pdfs?: string[] | null;
  /**
   * Array of scrape results from action sequences, each containing 'url' and 'html'.
   */
  scrapes?: Array<Record<string, string>> | null;
  /**
   * Array of results from JavaScript execution during actions, each containing 'type' and 'value'.
   */
  javascriptReturns?: Array<Record<string, any>> | null;
}

/**
 * Brand identity information extracted from the website
 */
export interface Branding {
  /**
   * URL of the site logo.
   */
  logo?: string | null;
  /**
   * Array of font families detected on the site.
   */
  fonts?: string[] | null;
  /**
   * Primary, secondary, accent, background, and text colors used on the site.
   */
  colors?: Record<string, any> | null;
  /**
   * Detected color scheme: 'light' or 'dark'.
   */
  colorScheme?: string | null;
  /**
   * Typography settings including font sizes, weights, families, and line heights.
   */
  typography?: Record<string, any> | null;
  /**
   * Spacing information including base unit, border radius, padding and margins.
   */
  spacing?: Record<string, any> | null;
  /**
   * Layout configuration including grid and header/footer dimensions.
   */
  layout?: Record<string, any> | null;
  /**
   * Styling information for UI components like buttons and inputs.
   */
  components?: Record<string, any> | null;
  /**
   * Animation and transition settings detected on the site.
   */
  animations?: Record<string, any> | null;
  /**
   * URLs for logo, favicon, and Open Graph images.
   */
  images?: Record<string, any> | null;
  /**
   * Brand personality traits including tone and target audience information.
   */
  personality?: Record<string, any> | null;
}

/**
 * Change detection information
 */
export interface ChangeTracking {
  /**
   * Status of detected changes: 'new', 'same', 'changed', or 'removed'.
   */
  changeStatus?: string | null;
  /**
   * Visibility status: 'visible' or 'hidden'.
   */
  visibility?: string | null;
  /**
   * Text diff showing what changed between scrapes.
   */
  diff?: string | null;
  /**
   * Structured representation of changes.
   */
  json?: Record<string, any> | null;
  /**
   * ISO 8601 timestamp of the previous scrape operation.
   */
  previousScrapeAt?: string | null;
}

/**
 * Comprehensive metadata about the scraped page
 */
export interface Metadata {
  /**
   * Original URL that was requested for scraping.
   */
  sourceURL: string;
  /**
   * HTTP response status code from the scraping request.
   */
  statusCode: number;
  /**
   * Final resolved URL after following redirects.
   */
  url?: string | null;
  /**
   * Page title from the HTML title tag or meta tags.
   */
  title?: string | null;
  /**
   * Page description from meta description tag.
   */
  description?: string | null;
  /**
   * Keywords from meta keywords tag.
   */
  keywords?: string | null;
  /**
   * Detected or declared language code of the page content.
   */
  language?: string | null;
  /**
   * Open Graph title meta property.
   */
  ogTitle?: string | null;
  /**
   * Open Graph description meta property.
   */
  ogDescription?: string | null;
  /**
   * Open Graph image URL meta property.
   */
  ogImage?: string | null;
  /**
   * Open Graph canonical URL meta property.
   */
  ogUrl?: string | null;
  /**
   * Open Graph site name meta property.
   */
  ogSiteName?: string | null;
  /**
   * Array of alternate locale codes from Open Graph.
   */
  ogLocaleAlternate?: string[] | null;
  /**
   * Robots meta tag directives for crawlers. Can be a string or list of strings.
   */
  robots?: string | string[] | null;
  /**
   * MIME type of the scraped content.
   */
  content_type?: string | null;
  /**
   * Indicates cache hit or miss status.
   */
  cache_state?: string | null;
  /**
   * Number of API credits consumed by this scrape operation.
   */
  credits_used?: number | null;
  /**
   * Error message if an error occurred during scraping.
   */
  error?: string | null;
}

/**
 * Contains all scraped content and metadata
 */
export interface ScrapeData {
  /**
   * Comprehensive metadata about the scraped page including Open Graph tags and HTTP information.
   */
  metadata: Metadata;
  /**
   * Page content converted to LLM-ready markdown format.
   * Returned when 'markdown' is included in formats parameter.
   */
  markdown?: string | null;
  /**
   * Processed and cleaned HTML content of the page.
   * Returned when 'html' is included in formats parameter.
   */
  html?: string | null;
  /**
   * Unprocessed raw HTML as received from the server.
   * Returned when 'rawHtml' is included in formats parameter.
   */
  rawHtml?: string | null;
  /**
   * Array of URLs extracted from the page.
   */
  links?: string[] | null;
  /**
   * Base64-encoded screenshot image or screenshot URL.
   * Returned when 'screenshot' is included in formats parameter.
   */
  screenshot?: string | null;
  /**
   * Structured data extracted using LLM with optional schema or prompt.
   * Returned when using extract/JSON mode.
   */
  json?: Record<string, any> | null;
  /**
   * Concise AI-generated summary of the page content. Available in v2.5+.
   */
  summary?: string | null;
  /**
   * Warning message if any issues occurred during scraping that didn't cause failure.
   */
  warning?: string | null;
  /**
   * Results from browser automation actions. Only present when actions are specified in the request.
   */
  actions?: ActionsResult | null;
  /**
   * Brand identity information extracted from the website when 'branding' format is requested.
   */
  branding?: Branding | null;
  /**
   * Change detection information when using Firecrawl's change tracking feature.
   */
  changeTracking?: ChangeTracking | null;
}

/**
 * Internal response wrapper interface from Firecrawl API
 */
interface ScrapeResponse {
  /**
   * Indicates whether the scrape operation completed successfully.
   */
  success: boolean;
  /**
   * Whether or not the action execution was successful or not
   */
  successful: boolean;
  /**
   * Contains all scraped content and metadata. May be null when success is false due to errors.
   */
  data?: ScrapeData | null;
  /**
   * Error code when success is False. Firecrawl API codes include 'SCRAPE_ALL_ENGINES_FAILED',
   * 'SCRAPE_TIMEOUT'. Application may also return 'NO_EXTRACTABLE_CONTENT' for success responses
   * with empty content.
   */
  code?: string | null;
  /**
   * Error if any occurred during the execution of the action
   */
  error?: string | null;
}

/**
 * Scrapes a web page using Firecrawl, extracting content in various formats including markdown,
 * HTML, screenshots, and structured JSON data. Supports browser automation actions, geographic
 * location simulation, and LLM-powered data extraction.
 *
 * @param params - The scrape request parameters including URL and output format options
 * @returns Promise resolving to the scraped page data with content and metadata
 * @throws Error if the URL parameter is missing or if the scrape operation fails
 *
 * @example
 * const result = await request({
 *   url: 'https://example.com',
 *   formats: ['markdown', 'html'],
 *   onlyMainContent: true
 * });
 */
export async function request(params: ScrapeParams): Promise<ScrapeData> {
  // Validate required parameters
  if (!params.url) {
    throw new Error('Missing required parameter: url');
  }

  // CRITICAL: Use MCPToolResponse and parse JSON response
  const mcpResponse = await callMCPTool<MCPToolResponse, ScrapeParams>(
    '68f0a290f81ae7b79782adc9',
    'FIRECRAWL_SCRAPE',
    params
  );

  if (!mcpResponse.content?.[0]?.text) {
    throw new Error('Invalid MCP response format: missing content[0].text');
  }

  let toolData: ScrapeResponse;
  try {
    toolData = JSON.parse(mcpResponse.content[0].text);
  } catch (parseError) {
    throw new Error(
      `Failed to parse MCP response JSON: ${
        parseError instanceof Error ? parseError.message : 'Unknown error'
      }`
    );
  }

  if (!toolData.successful || !toolData.success) {
    const errorMessage = toolData.error || toolData.code || 'Firecrawl scrape operation failed';
    throw new Error(errorMessage);
  }

  if (!toolData.data) {
    throw new Error('Firecrawl returned successful response but no data');
  }

  return toolData.data;
}