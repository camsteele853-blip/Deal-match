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
 * Input parameters for mapping multiple URLs based on options
 */
export interface MapUrlsParams {
  /**
   * The primary base URL from which the mapping process will begin.
   * @example "https://example.com"
   * @example "https://sub.example.com/path"
   */
  url: string;

  /**
   * If true, excludes URLs with query parameters from results. Defaults to true.
   * @example true
   * @example false
   */
  ignoreQueryParameters?: boolean | null;

  /**
   * If true, includes subdomains of the base URL in the mapping. E.g., if `url` is example.com, blog.example.com is mapped. Defaults to true.
   * @example true
   * @example false
   */
  includeSubdomains?: boolean | null;

  /**
   * Maximum number of links to return. Defaults to 5000. Maximum allowed is 100000.
   * @example 100
   * @example 1000
   * @example 10000
   */
  limit?: number | null;

  /**
   * Optional search query to guide URL mapping, prioritizing or finding specific page types. 'Smart' search is limited to 1000 initial results in Alpha, but overall mapping can exceed this.
   * @example "product reviews"
   * @example "articles about AI"
   * @example "contact us page"
   */
  search?: string | null;

  /**
   * Timeout in milliseconds. No timeout is applied by default.
   * @example 30000
   * @example 60000
   */
  timeout?: number | null;
}

/**
 * Represents a discovered URL with optional metadata
 */
export interface LinkResult {
  /**
   * Full URL of the discovered page
   */
  url: string;

  /**
   * Page title or heading, not always present depending on website
   */
  title?: string | null;

  /**
   * Page summary or meta description, availability varies by site
   */
  description?: string | null;
}

/**
 * Output data from the URL mapping operation
 */
export interface MapUrlsData {
  /**
   * Indicates whether the API call was successful
   */
  success: boolean;

  /**
   * Collection of discovered URLs with metadata, ordered from most relevant to least relevant when using search parameter
   */
  links: LinkResult[];

  /**
   * Warning message for alerts such as low results, robots.txt limitations, or other issues during mapping
   */
  warning?: string | null;
}

/**
 * Internal response wrapper interface from outputSchema
 */
interface MapUrlsResponse {
  /**
   * Whether or not the action execution was successful or not
   */
  successful: boolean;

  /**
   * Data from the action execution
   */
  data?: MapUrlsData;

  /**
   * Error if any occurred during the execution of the action
   */
  error?: string | null;
}

/**
 * Maps multiple URLs from a base URL based on various filtering and search options.
 * This tool discovers and returns a collection of URLs from a website, with support for
 * subdomain inclusion, query parameter filtering, result limits, and smart search queries.
 *
 * @param params - The input parameters for the URL mapping operation
 * @returns Promise resolving to the discovered URLs with metadata
 * @throws Error if required parameters are missing or if the tool execution fails
 *
 * @example
 * const result = await request({ 
 *   url: 'https://example.com',
 *   limit: 100,
 *   search: 'product reviews'
 * });
 */
export async function request(params: MapUrlsParams): Promise<MapUrlsData> {
  // Validate required parameters
  if (!params.url) {
    throw new Error('Missing required parameter: url');
  }

  // CRITICAL: Use MCPToolResponse and parse JSON response
  const mcpResponse = await callMCPTool<MCPToolResponse, MapUrlsParams>(
    '68f0a290f81ae7b79782adc9',
    'FIRECRAWL_MAP_MULTIPLE_URLS_BASED_ON_OPTIONS',
    params
  );

  if (!mcpResponse.content?.[0]?.text) {
    throw new Error('Invalid MCP response format: missing content[0].text');
  }

  let toolData: MapUrlsResponse;
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