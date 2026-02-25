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
 * Input parameters for canceling a Firecrawl crawl job
 */
export interface CancelCrawlJobParams {
  /**
   * The unique identifier (UUID) of the crawl job to be canceled.
   * @example "c72c3457-79c2-4212-a7ac-25350a2785f3"
   */
  id: string;
}

/**
 * Output data returned after successfully canceling a crawl job
 */
export interface CancelCrawlJobData {
  /**
   * Indicates the operation outcome. Value is 'cancelled' when the crawl job has been successfully cancelled.
   */
  status: 'cancelled';
}

/**
 * Internal response wrapper interface from outputSchema
 */
interface CancelCrawlJobResponse {
  /**
   * Whether or not the action execution was successful or not
   */
  successful: boolean;
  /**
   * Data from the action execution
   */
  data?: CancelCrawlJobData;
  /**
   * Error if any occurred during the execution of the action
   */
  error?: string | null;
}

/**
 * Cancels an active Firecrawl crawl job using its unique identifier.
 * 
 * This function allows you to stop a running crawl job by providing its UUID.
 * Once canceled, the crawl job will be terminated and return a 'cancelled' status.
 *
 * @param params - The input parameters containing the crawl job ID
 * @param params.id - The unique identifier (UUID) of the crawl job to be canceled
 * @returns Promise resolving to the cancellation confirmation data
 * @throws Error if the id parameter is missing or if the tool execution fails
 *
 * @example
 * const result = await request({ id: 'c72c3457-79c2-4212-a7ac-25350a2785f3' });
 * console.log(result.status); // 'cancelled'
 */
export async function request(params: CancelCrawlJobParams): Promise<CancelCrawlJobData> {
  // Validate required parameters
  if (!params.id) {
    throw new Error('Missing required parameter: id');
  }
  
  // CRITICAL: Use MCPToolResponse and parse JSON response
  const mcpResponse = await callMCPTool<MCPToolResponse, CancelCrawlJobParams>(
    '68f0a290f81ae7b79782adc9',
    'FIRECRAWL_CANCEL_A_CRAWL_JOB',
    params
  );
  
  if (!mcpResponse.content?.[0]?.text) {
    throw new Error('Invalid MCP response format: missing content[0].text');
  }
  
  let toolData: CancelCrawlJobResponse;
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