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
 * Input parameters for extracting structured data from URLs
 */
export interface ExtractParams {
  /**
   * A list of URLs from which to extract data (maximum 10 URLs while in beta).
   * Wildcards (e.g., `https://example.com/blog/*`) can be used for crawling multiple pages under a specific path.
   * Note: You can also pass a single URL as 'url' (singular) which will be automatically converted to a list.
   * @example ["https://firecrawl.dev/", "https://docs.firecrawl.dev/"]
   */
  urls: string[];

  /**
   * If `True`, allows crawling links outside initial domains in `urls`; if `False`, restricts to same domains.
   * @default false
   * @example true
   */
  enable_web_search?: boolean;

  /**
   * Natural language query for information to extract from URL content.
   * E.g., 'Extract the company mission, whether it supports SSO, etc.'.
   * At least one of 'prompt' or 'schema' must be provided.
   * @example "Extract the company mission, whether it supports SSO, etc."
   */
  prompt?: string | null;

  /**
   * JSON object (dictionary) defining the desired structure for extracted data.
   * Must be a valid JSON Schema object with properties and types.
   * At least one of 'prompt' or 'schema' must be provided.
   * @example { "type": "object", "properties": { "company_mission": { "type": "string" }, "supports_sso": { "type": "boolean" } }, "required": ["company_mission", "supports_sso"] }
   */
  schema?: Record<string, any> | null;
}

/**
 * Extracted data response from Firecrawl
 */
export interface ExtractData {
  /**
   * Indicates whether the extraction request was successful.
   */
  success: boolean;

  /**
   * Whether or not the action execution was successful or not
   */
  successful: boolean;

  /**
   * The number of credits consumed by the extract job. Only available when the job status is 'completed'.
   */
  creditsUsed?: number | null;

  /**
   * Contains the extracted structured data based on the provided schema or prompt.
   * The structure varies according to the schema defined in the request. May be None during processing.
   */
  data?: Record<string, any> | null;

  /**
   * Error if any occurred during the execution of the action
   */
  error?: string | null;

  /**
   * ISO 8601 date-time timestamp indicating when the job data will expire (within 24 hours of creation).
   * May not be present in completed responses.
   */
  expiresAt?: string | null;

  /**
   * Unique identifier for the extraction job (UUID format).
   * Present in the initial POST response and during processing; may not be present in completed status responses.
   */
  id?: string | null;

  /**
   * Array of invalid URLs from the request when ignoreInvalidURLs parameter is set to true.
   * Returns empty array if no invalid URLs exist. Not present if ignoreInvalidURLs is false.
   */
  invalidURLs?: string[] | null;

  /**
   * Information about the sources used during data extraction.
   * Only present when showSources parameter is set to true in the request.
   */
  sources?: Array<Record<string, any>> | null;

  /**
   * Current status of the extract job.
   * Possible values: 'completed', 'processing', 'failed', 'cancelled'.
   * May not be present in completed responses.
   */
  status?: 'completed' | 'processing' | 'failed' | 'cancelled' | null;

  /**
   * The number of tokens used by the extract job. Only available when the job status is 'completed'.
   */
  tokensUsed?: number | null;

  /**
   * Array tracking the URLs processed during extraction.
   */
  urlTrace?: string[] | null;

  /**
   * Warning message providing additional information about the extraction.
   * Present when there are non-critical issues, otherwise null.
   */
  warning?: string | null;
}

/**
 * Internal response wrapper interface from outputSchema
 */
interface ExtractResponse {
  successful: boolean;
  data?: ExtractData;
  error?: string;
}

/**
 * Extracts structured data from URLs using Firecrawl.
 * 
 * This function allows you to extract structured information from web pages using either
 * a natural language prompt or a JSON schema definition. It supports crawling multiple URLs
 * (up to 10 in beta) and can optionally follow links outside the initial domains.
 *
 * @param params - The input parameters for the extraction request
 * @param params.urls - Array of URLs to extract data from (max 10, supports wildcards)
 * @param params.enable_web_search - Whether to allow crawling outside initial domains (default: false)
 * @param params.prompt - Natural language query describing what to extract
 * @param params.schema - JSON Schema object defining the structure of data to extract
 * @returns Promise resolving to the extracted data
 * @throws Error if required parameters are missing or if the tool execution fails
 *
 * @example
 * const result = await request({
 *   urls: ['https://firecrawl.dev/'],
 *   prompt: 'Extract the company mission and whether it supports SSO'
 * });
 */
export async function request(params: ExtractParams): Promise<ExtractData> {
  // Validate required parameters
  if (!params.urls || !Array.isArray(params.urls) || params.urls.length === 0) {
    throw new Error('Missing required parameter: urls (must be a non-empty array)');
  }

  if (params.urls.length > 10) {
    throw new Error('Maximum 10 URLs allowed (beta limitation)');
  }

  // Validate that at least one of prompt or schema is provided
  if (!params.prompt && !params.schema) {
    throw new Error('At least one of "prompt" or "schema" must be provided');
  }

  // CRITICAL: Use MCPToolResponse and parse JSON response
  const mcpResponse = await callMCPTool<MCPToolResponse, ExtractParams>(
    '68f0a290f81ae7b79782adc9',
    'FIRECRAWL_EXTRACT',
    params
  );

  if (!mcpResponse.content?.[0]?.text) {
    throw new Error('Invalid MCP response format: missing content[0].text');
  }

  let toolData: ExtractResponse;
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