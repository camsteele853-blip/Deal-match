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
 * Input parameters for Firecrawl search operation
 */
export interface FirecrawlSearchParams {
  /**
   * The search query to execute. Can be provided as 'query' or 'q'.
   * @example "what is firecrawl?"
   */
  q: string;

  /**
   * Country code to tailor search results (e.g., 'us' for United States, default 'us').
   * @example "us", "uk", "fr"
   * @default "us"
   */
  country?: string | null;

  /**
   * Desired output formats for scraped content of each search result (e.g., 'markdown', 'html'). 
   * If None, default scraping applies. 
   * Available: 'markdown', 'html', 'rawHtml', 'links', 'screenshot', 'screenshot@fullPage'.
   * @example ["markdown", "html"]
   * @default null
   */
  formats?: string[] | null;

  /**
   * Language code for search results (e.g., 'en' for English, default 'en').
   * @example "en", "es", "fr"
   * @default "en"
   */
  lang?: string | null;

  /**
   * Maximum number of search results to return (1-100, default 5).
   * @example 5, 10, 50, 100
   * @default 5
   */
  limit?: number | null;

  /**
   * Maximum time in milliseconds for search and scrape operations (1000-300000, default 60000).
   * @example 10000, 60000, 300000
   * @default 60000
   */
  timeout?: number | null;
}

/**
 * Metadata about a scraped page
 */
export interface MetadataResponse {
  /**
   * Meta description tag content.
   */
  description?: string | null;

  /**
   * Error message if scraping failed or encountered issues.
   */
  error?: string | null;

  /**
   * Original source URL of the page.
   */
  sourceURL?: string | null;

  /**
   * HTTP response status code.
   */
  statusCode?: number | null;

  /**
   * Page title from metadata.
   */
  title?: string | null;
}

/**
 * Image search result
 */
export interface ImageSearchResult {
  /**
   * Height of the image in pixels.
   */
  imageHeight?: number | null;

  /**
   * URL of the image.
   */
  imageUrl?: string | null;

  /**
   * Width of the image in pixels.
   */
  imageWidth?: number | null;

  /**
   * Position/ranking of the result.
   */
  position?: number | null;

  /**
   * Title of the image.
   */
  title?: string | null;

  /**
   * Source page URL where the image was found.
   */
  url?: string | null;
}

/**
 * News search result
 */
export interface NewsSearchResult {
  /**
   * Title of the news article.
   */
  title: string;

  /**
   * URL of the news article.
   */
  url: string;

  /**
   * Publication date of the news article.
   */
  date?: string | null;

  /**
   * HTML content of the article.
   */
  html?: string | null;

  /**
   * URL of the article's image.
   */
  imageUrl?: string | null;

  /**
   * Array of extracted hyperlinks from the article.
   */
  links?: string[] | null;

  /**
   * Cleaned, structured content in markdown format.
   */
  markdown?: string | null;

  /**
   * Contains metadata about the scraped article.
   */
  metadata?: MetadataResponse | null;

  /**
   * Position/ranking of the result.
   */
  position?: number | null;

  /**
   * Unprocessed raw HTML markup.
   */
  rawHtml?: string | null;

  /**
   * Base64-encoded screenshot of the article.
   */
  screenshot?: string | null;

  /**
   * Brief excerpt from the news article.
   */
  snippet?: string | null;
}

/**
 * Web search result
 */
export interface WebSearchResult {
  /**
   * Page title of the search result.
   */
  title: string;

  /**
   * Meta description or summary of the page content.
   */
  description: string;

  /**
   * URL of the search result.
   */
  url: string;

  /**
   * Content classification category (e.g., 'github', 'research').
   */
  category?: string | null;

  /**
   * HTML content of the page. Included when scraping is enabled with html format.
   */
  html?: string | null;

  /**
   * Array of extracted hyperlinks from the page. Included when scraping is enabled with links format.
   */
  links?: string[] | null;

  /**
   * Cleaned, structured content in markdown format. Included when scrapeOptions specify markdown format.
   */
  markdown?: string | null;

  /**
   * Contains metadata about the scraped page.
   */
  metadata?: MetadataResponse | null;

  /**
   * Position/ranking of the result in search results.
   */
  position?: number | null;

  /**
   * Unprocessed raw HTML markup. Included when scraping is enabled with rawHtml format.
   */
  rawHtml?: string | null;

  /**
   * Base64-encoded screenshot of the page. Included when scraping is enabled with screenshot format.
   */
  screenshot?: string | null;
}

/**
 * Search results data organized by source type
 */
export interface FirecrawlSearchData {
  /**
   * List of web search results.
   */
  web?: WebSearchResult[] | null;

  /**
   * List of image search results.
   */
  images?: ImageSearchResult[] | null;

  /**
   * List of news search results.
   */
  news?: NewsSearchResult[] | null;
}

/**
 * Internal response wrapper interface from outputSchema
 */
interface FirecrawlSearchResponse {
  /**
   * Indicates whether the API request was successful.
   */
  success: boolean;

  /**
   * Search results organized by source type (web, images, news).
   */
  data: FirecrawlSearchData;

  /**
   * Whether or not the action execution was successful or not
   */
  successful: boolean;

  /**
   * Number of API credits consumed by this search.
   */
  creditsUsed?: number | null;

  /**
   * Error if any occurred during the execution of the action
   */
  error?: string | null;

  /**
   * Unique identifier for the search job.
   */
  id?: string | null;

  /**
   * Optional warning message about the request or response.
   */
  warning?: string | null;
}

/**
 * Executes a Firecrawl search operation with optional scraping of search results.
 * 
 * This function performs a web search using Firecrawl's search API and can optionally
 * scrape the content of search results in various formats (markdown, html, links, screenshots).
 * Results are organized by type: web, images, and news.
 *
 * @param params - The search parameters including query, country, language, formats, limit, and timeout
 * @returns Promise resolving to the search results data organized by source type
 * @throws Error if required parameter 'q' is missing or if the tool execution fails
 *
 * @example
 * const results = await request({ 
 *   q: 'what is firecrawl?',
 *   limit: 10,
 *   formats: ['markdown', 'html']
 * });
 */
export async function request(params: FirecrawlSearchParams): Promise<FirecrawlSearchData> {
  // Validate required parameters
  if (!params.q) {
    throw new Error('Missing required parameter: q (search query)');
  }

  // Validate limit range if provided
  if (params.limit !== undefined && params.limit !== null) {
    if (params.limit < 1 || params.limit > 100) {
      throw new Error('Parameter "limit" must be between 1 and 100');
    }
  }

  // Validate timeout range if provided
  if (params.timeout !== undefined && params.timeout !== null) {
    if (params.timeout < 1000 || params.timeout > 300000) {
      throw new Error('Parameter "timeout" must be between 1000 and 300000 milliseconds');
    }
  }

  // CRITICAL: Use MCPToolResponse and parse JSON response
  const mcpResponse = await callMCPTool<MCPToolResponse, FirecrawlSearchParams>(
    '68f0a290f81ae7b79782adc9',
    'FIRECRAWL_SEARCH',
    params
  );

  if (!mcpResponse.content?.[0]?.text) {
    throw new Error('Invalid MCP response format: missing content[0].text');
  }

  let toolData: FirecrawlSearchResponse;
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