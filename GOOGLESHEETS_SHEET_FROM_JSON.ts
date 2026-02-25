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
 * Input parameters for creating a Google Sheet from JSON data
 */
export interface CreateSheetFromJsonParams {
  /**
   * A list of dictionaries representing the rows of the sheet. Each dictionary must have the same set of keys,
   * which will form the header row. Values can be strings, numbers, booleans, or null (represented as empty cells).
   * An empty list [] is allowed and will create a spreadsheet with an empty worksheet.
   * 
   * @example
   * [{"Name": "Alice", "Age": 30, "City": "New York"}, {"Name": "Bob", "Age": 24, "City": "London"}]
   * @example
   * [{"Product ID": "A123", "Quantity": 10, "Price": 25.50}, {"Product ID": "B456", "Quantity": 5, "Price": 100.00}]
   * @example
   * []
   */
  sheet_json: Array<Record<string, string | number | boolean | null>>;

  /**
   * The name for the first worksheet within the newly created spreadsheet.
   * This name will appear as a tab at the bottom of the sheet.
   * 
   * @example "Sheet1"
   * @example "Data Summary"
   * @example "October Metrics"
   */
  sheet_name: string;

  /**
   * The desired title for the new Google Spreadsheet.
   * 
   * @example "Q3 Sales Report"
   * @example "Project Plan Alpha"
   */
  title: string;
}

/**
 * Value range data structure for Google Sheets
 */
export interface ValueRange {
  /**
   * The major dimension of the values. For output, if the spreadsheet data is: A1=1,B1=2,A2=3,B2=4,
   * then requesting range=A1:B2,majorDimension=ROWS will return [[1,2],[3,4]],
   * whereas requesting range=A1:B2,majorDimension=COLUMNS will return [[1,3],[2,4]].
   */
  majorDimension?: 'ROWS' | 'COLUMNS';

  /**
   * The range the values cover, in A1 notation. For output, this range indicates the entire requested range,
   * even though the values will exclude trailing rows and columns. When updating values, this field represents
   * the range that was updated.
   */
  range?: string;

  /**
   * The data that was read or to be written. This is an array of arrays, the outer array representing all the data
   * and each inner array representing a major dimension. Each item in the inner array corresponds with one cell.
   */
  values: Array<Array<string | number | boolean>>;
}

/**
 * Output data from creating a Google Sheet from JSON
 */
export interface CreateSheetFromJsonData {
  /**
   * The spreadsheet the updates were applied to.
   */
  spreadsheetId: string;

  /**
   * The number of cells updated.
   */
  updatedCells: number;

  /**
   * The number of columns updated.
   */
  updatedColumns: number;

  /**
   * The values of the cells that were updated. Only present if the request's includeValuesInResponse field was true.
   */
  updatedData?: ValueRange;

  /**
   * The range (in A1 notation) that updates were applied to.
   */
  updatedRange: string;

  /**
   * The number of rows updated.
   */
  updatedRows: number;
}

/**
 * Internal response wrapper interface from outputSchema
 */
interface CreateSheetFromJsonResponse {
  /**
   * Whether or not the action execution was successful or not
   */
  successful: boolean;

  /**
   * Data from the action execution
   */
  data?: CreateSheetFromJsonData;

  /**
   * Error if any occurred during the execution of the action
   */
  error?: string;
}

/**
 * Creates a new Google Spreadsheet from JSON data.
 * 
 * This tool creates a new Google Spreadsheet with a specified title and populates it with data
 * from a JSON array. Each object in the array represents a row, with keys forming the header row.
 * The tool returns information about the created spreadsheet including the spreadsheet ID and
 * details about the cells that were updated.
 *
 * @param params - The input parameters for creating the sheet
 * @param params.title - The desired title for the new Google Spreadsheet
 * @param params.sheet_name - The name for the first worksheet within the spreadsheet
 * @param params.sheet_json - Array of objects representing rows (keys become headers)
 * @returns Promise resolving to the sheet creation result data
 * @throws Error if required parameters are missing or if the tool execution fails
 *
 * @example
 * const result = await request({
 *   title: 'Q3 Sales Report',
 *   sheet_name: 'Sales Data',
 *   sheet_json: [
 *     { Name: 'Alice', Age: 30, City: 'New York' },
 *     { Name: 'Bob', Age: 24, City: 'London' }
 *   ]
 * });
 * console.log(`Created spreadsheet: ${result.spreadsheetId}`);
 */
export async function request(params: CreateSheetFromJsonParams): Promise<CreateSheetFromJsonData> {
  // Validate required parameters
  if (!params.title) {
    throw new Error('Missing required parameter: title');
  }
  
  if (!params.sheet_name) {
    throw new Error('Missing required parameter: sheet_name');
  }
  
  if (!params.sheet_json) {
    throw new Error('Missing required parameter: sheet_json');
  }
  
  if (!Array.isArray(params.sheet_json)) {
    throw new Error('Parameter sheet_json must be an array');
  }
  
  // CRITICAL: Use MCPToolResponse and parse JSON response
  const mcpResponse = await callMCPTool<MCPToolResponse, CreateSheetFromJsonParams>(
    '686de48c6fd1cae1afbb55ba',
    'GOOGLESHEETS_SHEET_FROM_JSON',
    params
  );
  
  if (!mcpResponse.content?.[0]?.text) {
    throw new Error('Invalid MCP response format: missing content[0].text');
  }
  
  let toolData: CreateSheetFromJsonResponse;
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