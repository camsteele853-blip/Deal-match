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
 * Input parameters for looking up a spreadsheet row
 */
export interface LookupSpreadsheetRowParams {
  /**
   * Identifier of the Google Spreadsheet to search.
   * @example "1BiexwqQYjfC_BXy6zDQYJqb6zxzRyP9"
   */
  spreadsheet_id: string;

  /**
   * Exact text value to find; matches the entire content of a cell in a row.
   * @example "John"
   * @example "Completed"
   * @example "ID-12345"
   */
  query: string;

  /**
   * A1 notation range to search within. Supports cell ranges (e.g., 'Sheet1!A1:D5'), 
   * column-only ranges (e.g., 'Sheet1!A:Z'), and row-only ranges (e.g., 'Sheet1!1:1'). 
   * Defaults to the first sheet if omitted. IMPORTANT: Sheet names with spaces must be 
   * single-quoted (e.g., "'My Sheet'!A1:Z"). Bare sheet names without ranges (e.g., 'Sheet1') 
   * are not supported - always specify a range.
   * @example "Sheet1!A1:D5"
   * @example "Sheet1!A:Z"
   * @example "Sheet1!1:1"
   * @example "'Admin tickets'!A:A"
   */
  range?: string;

  /**
   * If `true`, the query string search is case-sensitive.
   * @default false
   */
  case_sensitive?: boolean;

  /**
   * If `true`, strips leading and trailing whitespace from cell values before matching. 
   * This helps match cells like ' TOTAL ' or 'TOTAL ' when searching for 'TOTAL'.
   * @default true
   */
  normalize_whitespace?: boolean;
}

/**
 * Row data result from the spreadsheet lookup
 */
export interface RowDataResult {
  /**
   * Indicates if a matching row was found in the spreadsheet.
   */
  found: boolean;

  /**
   * If found is true: an ordered list of the matched row's cell values (each as a string). 
   * If found is false: an empty object.
   */
  row_data: string[] | Record<string, any>;
}

/**
 * Output data from the spreadsheet row lookup
 */
export interface LookupSpreadsheetRowData {
  /**
   * Encapsulates the outcome of the spreadsheet row lookup. Contains whether a matching 
   * row was found and the row's cell values when applicable.
   */
  row_data: RowDataResult;
}

/**
 * Internal response wrapper interface from outputSchema
 */
interface LookupSpreadsheetRowResponse {
  /**
   * Whether or not the action execution was successful or not
   */
  successful: boolean;

  /**
   * Data from the action execution
   */
  data?: LookupSpreadsheetRowData;

  /**
   * Error if any occurred during the execution of the action
   */
  error?: string;
}

/**
 * Looks up a row in a Google Spreadsheet by searching for an exact text match in a cell.
 * Searches within the specified range and returns the entire row's data if a match is found.
 *
 * @param params - The input parameters for the spreadsheet row lookup
 * @returns Promise resolving to the lookup result containing whether a row was found and its data
 * @throws Error if required parameters are missing or if the tool execution fails
 *
 * @example
 * const result = await request({
 *   spreadsheet_id: '1BiexwqQYjfC_BXy6zDQYJqb6zxzRyP9',
 *   query: 'John',
 *   range: 'Sheet1!A:Z'
 * });
 * if (result.row_data.found) {
 *   console.log('Found row:', result.row_data.row_data);
 * }
 */
export async function request(params: LookupSpreadsheetRowParams): Promise<LookupSpreadsheetRowData> {
  // Validate required parameters
  if (!params.spreadsheet_id) {
    throw new Error('Missing required parameter: spreadsheet_id');
  }
  
  if (!params.query) {
    throw new Error('Missing required parameter: query');
  }
  
  // CRITICAL: Use MCPToolResponse and parse JSON response
  const mcpResponse = await callMCPTool<MCPToolResponse, LookupSpreadsheetRowParams>(
    '686de48c6fd1cae1afbb55ba',
    'GOOGLESHEETS_LOOKUP_SPREADSHEET_ROW',
    params
  );
  
  if (!mcpResponse.content?.[0]?.text) {
    throw new Error('Invalid MCP response format: missing content[0].text');
  }
  
  let toolData: LookupSpreadsheetRowResponse;
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