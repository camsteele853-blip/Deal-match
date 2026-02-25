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
 * Input parameters for retrieving sheet names from a Google Spreadsheet
 */
export interface GetSheetNamesParams {
  /**
   * The unique identifier of the Google Spreadsheet (alphanumeric string, typically 44 characters).
   * Extract only the ID portion from URLs - do not include leading/trailing slashes, '/edit' suffixes,
   * query parameters, or URL fragments.
   * 
   * @example "1qpyC0XzvTcKT6EISywY_7H7D7No1tpxEXAMPLE_ID"
   * @example From 'https://docs.google.com/spreadsheets/d/1qpyC0XzvTcKT6EISywY/edit#gid=0', use only '1qpyC0XzvTcKT6EISywY'
   */
  spreadsheet_id: string;
}

/**
 * Output data containing sheet names from a Google Spreadsheet
 */
export interface GetSheetNamesData {
  /**
   * List of sheet/tab names in the spreadsheet, in the order they appear.
   * Names are unique within a spreadsheet and may be empty if the spreadsheet has no sheets.
   * This is the primary response field. An alias 'sheets' is also available with identical data.
   */
  sheet_names: string[];

  /**
   * Alias for 'sheet_names' provided for compatibility with common API naming patterns.
   * Contains the same list of worksheet names as 'sheet_names'.
   * Prefer using 'sheet_names' as the canonical field.
   */
  sheets?: string[];
}

/**
 * Internal response wrapper interface from outputSchema
 */
interface GetSheetNamesResponse {
  /**
   * Whether or not the action execution was successful or not
   */
  successful: boolean;

  /**
   * Data from the action execution
   */
  data?: GetSheetNamesData;

  /**
   * Error if any occurred during the execution of the action
   */
  error?: string;
}

/**
 * Retrieves the list of sheet/tab names from a Google Spreadsheet.
 * 
 * This function fetches all sheet names from the specified Google Spreadsheet in the order they appear.
 * Sheet names are unique within a spreadsheet and can be used to identify specific worksheets for
 * further operations.
 *
 * @param params - The input parameters containing the spreadsheet ID
 * @returns Promise resolving to the sheet names data
 * @throws Error if spreadsheet_id is missing or if the tool execution fails
 *
 * @example
 * const result = await request({ spreadsheet_id: '1qpyC0XzvTcKT6EISywY_7H7D7No1tpxEXAMPLE_ID' });
 * console.log(result.sheet_names); // ['Sheet1', 'Sheet2', 'Data']
 */
export async function request(params: GetSheetNamesParams): Promise<GetSheetNamesData> {
  // Validate required parameters
  if (!params.spreadsheet_id) {
    throw new Error('Missing required parameter: spreadsheet_id');
  }

  // Validate spreadsheet_id format (basic validation)
  if (typeof params.spreadsheet_id !== 'string' || params.spreadsheet_id.trim().length === 0) {
    throw new Error('Invalid spreadsheet_id: must be a non-empty string');
  }

  // CRITICAL: Use MCPToolResponse and parse JSON response
  const mcpResponse = await callMCPTool<MCPToolResponse, GetSheetNamesParams>(
    '686de48c6fd1cae1afbb55ba',
    'GOOGLESHEETS_GET_SHEET_NAMES',
    params
  );

  if (!mcpResponse.content?.[0]?.text) {
    throw new Error('Invalid MCP response format: missing content[0].text');
  }

  let toolData: GetSheetNamesResponse;
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