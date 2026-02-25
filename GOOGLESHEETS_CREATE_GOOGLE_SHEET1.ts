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
 * Input parameters for creating a new Google Sheet
 */
export interface CreateGoogleSheetParams {
  /**
   * The title for the new Google Sheet. If omitted, Google will create a spreadsheet with a default name like 'Untitled spreadsheet'.
   * @example "Q4 Financial Report"
   * @example "Project Plan Ideas"
   * @example "Meeting Notes"
   */
  title?: string;
}

/**
 * Grid properties describing the layout of a sheet
 */
export interface GridProperties {
  /**
   * Number of columns in the sheet grid
   */
  columnCount?: number;
  
  /**
   * Number of rows in the sheet grid
   */
  rowCount?: number;
}

/**
 * Properties describing a sheet tab
 */
export interface SheetProperties {
  /**
   * Grid layout configuration for the sheet tab
   */
  gridProperties?: GridProperties;
  
  /**
   * Zero-based position of the sheet tab
   */
  index?: number;
  
  /**
   * Numeric identifier of the sheet tab
   */
  sheetId?: number;
  
  /**
   * Type of the sheet (e.g., 'GRID')
   */
  sheetType?: string;
  
  /**
   * Display name of the sheet tab
   */
  title?: string;
}

/**
 * Represents a single sheet in the spreadsheet
 */
export interface Sheet {
  /**
   * Core properties describing the sheet tab
   */
  properties?: SheetProperties;
}

/**
 * Output data returned after creating a Google Sheet
 */
export interface CreateGoogleSheetData {
  /**
   * Output only. Data source refresh schedules in the spreadsheet
   */
  dataSourceSchedules?: Array<Record<string, any>>;
  
  /**
   * External data sources connected to the spreadsheet
   */
  dataSources?: Array<Record<string, any>>;
  
  /**
   * Developer metadata attached to the spreadsheet
   */
  developerMetadata?: Array<Record<string, any>>;
  
  /**
   * Named ranges defined in the spreadsheet
   */
  namedRanges?: Array<Record<string, any>>;
  
  /**
   * Overall spreadsheet properties (SpreadsheetProperties object)
   */
  properties?: Record<string, any>;
  
  /**
   * All sheets in the spreadsheet
   */
  sheets?: Sheet[];
  
  /**
   * The ID of the spreadsheet; read-only.
   */
  spreadsheetId: string;
  
  /**
   * The URL of the spreadsheet; read-only.
   */
  spreadsheetUrl?: string;
}

/**
 * Internal response wrapper interface from outputSchema
 */
interface CreateGoogleSheetResponse {
  /**
   * Whether or not the action execution was successful or not
   */
  successful: boolean;
  
  /**
   * Data from the action execution
   */
  data?: CreateGoogleSheetData;
  
  /**
   * Error if any occurred during the execution of the action
   */
  error?: string;
}

/**
 * Creates a new Google Sheet with the specified title.
 * 
 * This function creates a new Google Sheets spreadsheet in the authenticated user's Google Drive.
 * If no title is provided, Google will create a spreadsheet with a default name like 'Untitled spreadsheet'.
 *
 * @param params - The input parameters for creating the Google Sheet
 * @returns Promise resolving to the created spreadsheet data including spreadsheet ID and URL
 * @throws Error if the tool execution fails or returns an error
 *
 * @example
 * const result = await request({ title: 'Q4 Financial Report' });
 * console.log(result.spreadsheetId); // The ID of the newly created spreadsheet
 * console.log(result.spreadsheetUrl); // The URL to access the spreadsheet
 */
export async function request(params: CreateGoogleSheetParams = {}): Promise<CreateGoogleSheetData> {
  // No required parameters to validate for this tool
  
  // CRITICAL: Use MCPToolResponse and parse JSON response
  const mcpResponse = await callMCPTool<MCPToolResponse, CreateGoogleSheetParams>(
    '686de48c6fd1cae1afbb55ba',
    'GOOGLESHEETS_CREATE_GOOGLE_SHEET1',
    params
  );
  
  if (!mcpResponse.content?.[0]?.text) {
    throw new Error('Invalid MCP response format: missing content[0].text');
  }
  
  let toolData: CreateGoogleSheetResponse;
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