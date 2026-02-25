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
 * Input parameters for getting spreadsheet information
 */
export interface GetSpreadsheetInfoParams {
  /**
   * Required. The Google Sheets spreadsheet ID or full URL. 
   * Accepts either the ID alone (e.g., '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms') 
   * or a full Google Sheets URL (e.g., 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit'). 
   * The ID will be automatically extracted from URLs.
   * 
   * @example "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
   * @example "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
   */
  spreadsheet_id: string;
}

/**
 * Data source schedule object
 */
export interface DataSourceSchedule {
  [key: string]: any;
}

/**
 * Data source object
 */
export interface DataSource {
  [key: string]: any;
}

/**
 * Developer metadata object
 */
export interface DeveloperMetadata {
  [key: string]: any;
}

/**
 * Named range object
 */
export interface NamedRange {
  [key: string]: any;
}

/**
 * Spreadsheet properties object
 */
export interface SpreadsheetProperties {
  /**
   * Overall spreadsheet properties including title, locale, timeZone, autoRecalc, 
   * defaultFormat, iterativeCalculationSettings, spreadsheetTheme, 
   * importFunctionsExternalUrlAccessAllowed.
   */
  [key: string]: any;
}

/**
 * Sheet object
 */
export interface Sheet {
  [key: string]: any;
}

/**
 * Output data containing spreadsheet information
 */
export interface GetSpreadsheetInfoData {
  /**
   * Refresh schedules for external data sources (output only).
   */
  dataSourceSchedules?: DataSourceSchedule[];
  
  /**
   * External data sources connected with the spreadsheet (e.g., BigQuery, Looker).
   */
  dataSources?: DataSource[];
  
  /**
   * Spreadsheet-level developer metadata entries.
   */
  developerMetadata?: DeveloperMetadata[];
  
  /**
   * Named ranges defined in the spreadsheet.
   */
  namedRanges?: NamedRange[];
  
  /**
   * Overall spreadsheet properties including title, locale, timeZone, autoRecalc, 
   * defaultFormat, iterativeCalculationSettings, spreadsheetTheme, 
   * importFunctionsExternalUrlAccessAllowed.
   */
  properties?: SpreadsheetProperties;
  
  /**
   * Sheets (tabs) in the spreadsheet with per-sheet properties like sheetId, 
   * title, index, sheetType, gridProperties, and more.
   */
  sheets?: Sheet[];
  
  /**
   * The spreadsheet ID. Read-only.
   */
  spreadsheetId: string;
  
  /**
   * The URL of the spreadsheet. Read-only.
   */
  spreadsheetUrl?: string;
}

/**
 * Internal response wrapper interface from outputSchema
 */
interface GetSpreadsheetInfoResponse {
  /**
   * Whether or not the action execution was successful or not
   */
  successful: boolean;
  
  /**
   * Data from the action execution
   */
  data?: GetSpreadsheetInfoData;
  
  /**
   * Error if any occurred during the execution of the action
   */
  error?: string;
}

/**
 * Retrieves comprehensive information about a Google Sheets spreadsheet.
 * 
 * This function fetches detailed metadata about a spreadsheet including its properties,
 * sheets (tabs), named ranges, data sources, developer metadata, and more. It accepts
 * either a spreadsheet ID or a full Google Sheets URL.
 *
 * @param params - The input parameters containing the spreadsheet ID or URL
 * @returns Promise resolving to the spreadsheet information data
 * @throws Error if spreadsheet_id parameter is missing or if the tool execution fails
 *
 * @example
 * const result = await request({ 
 *   spreadsheet_id: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms' 
 * });
 * console.log(result.spreadsheetId, result.properties, result.sheets);
 */
export async function request(params: GetSpreadsheetInfoParams): Promise<GetSpreadsheetInfoData> {
  // Validate required parameters
  if (!params.spreadsheet_id) {
    throw new Error('Missing required parameter: spreadsheet_id');
  }

  if (typeof params.spreadsheet_id !== 'string' || params.spreadsheet_id.trim().length === 0) {
    throw new Error('Parameter spreadsheet_id must be a non-empty string');
  }

  // CRITICAL: Use MCPToolResponse and parse JSON response
  const mcpResponse = await callMCPTool<MCPToolResponse, GetSpreadsheetInfoParams>(
    '686de48c6fd1cae1afbb55ba',
    'GOOGLESHEETS_GET_SPREADSHEET_INFO',
    params
  );

  if (!mcpResponse.content?.[0]?.text) {
    throw new Error('Invalid MCP response format: missing content[0].text');
  }

  let toolData: GetSpreadsheetInfoResponse;
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