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
 * Input parameters for retrieving the status of a specific crawl job
 */
export interface GetCrawlStatusParams {
  /**
   * Unique identifier (UUID) of the crawl job.
   * @example "f5e5a0c5-0b7c-455e-8c1a-31e0b0d1f3b0"
   */
  id: string;
}

/**
 * Metadata object containing information extracted from a crawled page
 */
export interface CrawledPageMetadata {
  /**
   * Description extracted from the page, can be a string or array of strings.
   */
  description?: string | string[] | null;

  /**
   * The error message of the page if an error occurred.
   */
  error?: string | null;

  /**
   * Keywords extracted from the page, can be a string or array of strings.
   */
  keywords?: string | string[] | null;

  /**
   * Language extracted from the page, can be a string or array of strings.
   */
  language?: string | string[] | null;

  /**
   * Alternative locales for the page.
   */
  ogLocaleAlternate?: string[] | null;

  /**
   * Source page URL.
   */
  sourceURL?: string | null;

  /**
   * The HTTP status code of the page.
   */
  statusCode?: number | null;

  /**
   * Title extracted from the page, can be a string or array of strings.
   */
  title?: string | string[] | null;
}

/**
 * Data for a single crawled page
 */
export interface CrawledPage {
  /**
   * HTML version of the content on page if includeHtml is true.
   */
  html?: string | null;

  /**
   * List of links on the page if includeLinks is true.
   */
  links?: string[] | null;

  /**
   * Markdown-formatted page content.
   */
  markdown?: string | null;

  /**
   * Metadata object containing information extracted from the page.
   */
  metadata: CrawledPageMetadata;

  /**
   * Raw HTML content of the page if includeRawHtml is true.
   */
  rawHtml?: string | null;

  /**
   * Screenshot of the page if includeScreenshot is true.
   */
  screenshot?: string | null;

  [key: string]: unknown;
}

/**
 * Output data containing the status and results of a crawl job
 */
export interface GetCrawlStatusData {
  /**
   * The number of pages that have been successfully crawled.
   */
  completed: number;

  /**
   * The number of credits used for the crawl.
   */
  creditsUsed: number;

  /**
   * Array of crawled page objects containing the extracted content.
   */
  data: CrawledPage[];

  /**
   * Error if any occurred during the execution of the action
   */
  error?: string | null;

  /**
   * The date and time when the crawl will expire.
   */
  expiresAt: string;

  /**
   * The URL to retrieve the next 10MB of data. Returned if the crawl is not completed or if the response is larger than 10MB. Null when no additional data remains.
   */
  next?: string | null;

  /**
   * The current status of the crawl. Can be 'scraping', 'completed', or 'failed'.
   */
  status: string;

  /**
   * Whether or not the action execution was successful or not
   */
  successful: boolean;

  /**
   * The total number of pages that were attempted to be crawled.
   */
  total: number;
}

/**
 * Internal response wrapper interface from outputSchema
 */
interface GetCrawlStatusResponse {
  successful: boolean;
  data?: GetCrawlStatusData;
  error?: string;
}

/**
 * Retrieves the status of a specific Firecrawl crawl job by its unique identifier.
 * Returns information about the crawl progress, completed pages, credits used, and the crawled data.
 *
 * @param params - The input parameters containing the crawl job ID
 * @returns Promise resolving to the crawl job status and data
 * @throws Error if the id parameter is missing or if the tool execution fails
 *
 * @example
 * const result = await request({ id: 'f5e5a0c5-0b7c-455e-8c1a-31e0b0d1f3b0' });
 * console.log(`Crawl status: ${result.status}, Completed: ${result.completed}/${result.total}`);
 */
export async function request(params: GetCrawlStatusParams): Promise<GetCrawlStatusData> {
  // Validate required parameters
  if (!params.id) {
    throw new Error('Missing required parameter: id');
  }

  // CRITICAL: Use MCPToolResponse and parse JSON response
  const mcpResponse = await callMCPTool<MCPToolResponse, GetCrawlStatusParams>(
    '68f0a290f81ae7b79782adc9',
    'FIRECRAWL_GET_THE_STATUS_OF_A_CRAWL_JOB',
    params
  );

  if (!mcpResponse.content?.[0]?.text) {
    throw new Error('Invalid MCP response format: missing content[0].text');
  }

  let toolData: GetCrawlStatusResponse;
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