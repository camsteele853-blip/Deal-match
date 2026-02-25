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
 * Input parameters for searching Google Sheets spreadsheets
 */
export interface SearchSpreadsheetsParams {
  /**
   * Return spreadsheets created after this date. Use RFC 3339 format like '2024-01-01T00:00:00Z'.
   * @example "2024-01-01T00:00:00Z"
   * @example "2024-12-01T12:00:00-08:00"
   */
  created_after?: string;

  /**
   * Whether to include spreadsheets from shared drives you have access to. Defaults to True.
   * @default true
   */
  include_shared_drives?: boolean;

  /**
   * Whether to include spreadsheets in trash. Defaults to False.
   * @default false
   */
  include_trashed?: boolean;

  /**
   * Maximum number of spreadsheets to return (1-1000). Defaults to 10.
   * @default 10
   * @minimum 1
   * @maximum 1000
   */
  max_results?: number;

  /**
   * Return spreadsheets modified after this date. Use RFC 3339 format like '2024-01-01T00:00:00Z'.
   * @example "2024-01-01T00:00:00Z"
   * @example "2024-12-01T12:00:00-08:00"
   */
  modified_after?: string;

  /**
   * Order results by field. Common options: 'modifiedTime desc', 'modifiedTime asc', 'name', 'createdTime desc'
   * @default "modifiedTime desc"
   * @example "modifiedTime desc"
   * @example "name"
   * @example "createdTime desc"
   * @example "viewedByMeTime desc"
   */
  order_by?: string;

  /**
   * Search query to filter spreadsheets. Behavior depends on the 'search_type' parameter. For advanced searches, use Google Drive query syntax with fields like 'name contains', 'fullText contains', or boolean filters like 'sharedWithMe = true'. DO NOT use spreadsheet IDs as search terms. Leave empty to get all spreadsheets.
   * @example "Budget Report"
   * @example "quarterly sales"
   * @example "name contains 'Budget'"
   * @example "fullText contains 'sales data'"
   * @example "sharedWithMe = true"
   */
  query?: string;

  /**
   * How to search: 'name' searches filenames (recommended for finding specific files), 'content' searches inside spreadsheet content, 'both' searches both name and content. Note: 'name' search only matches from the START of filenames (prefix matching). For example, searching 'Budget' finds 'Budget 2024' but NOT 'Q1 Budget'. If you need substring matching in filenames, use 'both' which also searches content.
   * @default "name"
   */
  search_type?: 'name' | 'content' | 'both';

  /**
   * Whether to return only spreadsheets shared with the current user. Defaults to False.
   * @default false
   */
  shared_with_me?: boolean;

  /**
   * Whether to return only starred spreadsheets. Defaults to False.
   * @default false
   */
  starred_only?: boolean;
}

/**
 * Google Drive user information
 */
export interface DriveUser {
  /** Display name of the user */
  displayName?: string;

  /** Email address of the user */
  emailAddress?: string;

  /** Kind of resource (e.g., "drive#user") */
  kind?: string;

  /** Whether this user is the authenticated user */
  me?: boolean;

  /** Permission ID for this user */
  permissionId?: string;

  /** Link to the user's profile photo */
  photoLink?: string;
}

/**
 * Google Drive permission information
 */
export interface DrivePermission {
  /** Whether the permission allows file discovery */
  allowFileDiscovery?: boolean;

  /** Whether the permission has been deleted */
  deleted?: boolean;

  /** Display name of the permission holder */
  displayName?: string;

  /** Domain name for domain permissions */
  domain?: string;

  /** Email address of the permission holder */
  emailAddress?: string;

  /** Permission ID */
  id?: string;

  /** Kind of resource (e.g., "drive#permission") */
  kind?: string;

  /** Whether the user is a pending owner */
  pendingOwner?: boolean;

  /** Link to the permission holder's profile photo */
  photoLink?: string;

  /** Role granted by this permission */
  role?: 'owner' | 'organizer' | 'fileOrganizer' | 'writer' | 'commenter' | 'reader';

  /** Type of permission */
  type?: 'user' | 'group' | 'domain' | 'anyone';
}

/**
 * Google Sheets spreadsheet file information
 */
export interface SpreadsheetFile {
  /** Timestamp when the spreadsheet was created */
  createdTime: string;

  /** Unique identifier for the spreadsheet */
  id: string;

  /** Information about the last user who modified the spreadsheet */
  lastModifyingUser?: DriveUser;

  /** MIME type of the file */
  mimeType: string;

  /** Timestamp when the spreadsheet was last modified */
  modifiedTime: string;

  /** Name of the spreadsheet */
  name: string;

  /** List of owners of the spreadsheet */
  owners?: DriveUser[];

  /** List of permissions for the spreadsheet */
  permissions?: DrivePermission[];

  /** Whether the spreadsheet is shared */
  shared?: boolean;

  /** Size of the spreadsheet in bytes */
  size?: string;

  /** Whether the spreadsheet is starred */
  starred: boolean;

  /** Whether the spreadsheet is in trash */
  trashed: boolean;

  /** Link to view the spreadsheet in a web browser */
  webViewLink: string;
}

/**
 * Output data from searching Google Sheets spreadsheets
 */
export interface SearchSpreadsheetsData {
  /**
   * Opaque token to retrieve the next page of results. Null indicates there are no additional pages.
   */
  next_page_token?: string;

  /**
   * Informational message about the search results, including suggestions when no results are found.
   */
  search_message?: string;

  /**
   * List of matching spreadsheets accessible to the authenticated user.
   */
  spreadsheets: SpreadsheetFile[];

  /**
   * Number of spreadsheet items returned in this response page.
   */
  total_found: number;
}

/**
 * Internal response wrapper interface from outputSchema
 */
interface SearchSpreadsheetsResponse {
  /** Whether or not the action execution was successful or not */
  successful: boolean;

  /** Data from the action execution */
  data?: SearchSpreadsheetsData;

  /** Error if any occurred during the execution of the action */
  error?: string;
}

/**
 * Search for Google Sheets spreadsheets based on various criteria including name, content, dates, and sharing status.
 * 
 * This function allows you to search for spreadsheets using flexible criteria such as:
 * - Text search in names or content
 * - Creation and modification date filters
 * - Sharing and ownership filters
 * - Starred and trashed status
 * - Custom ordering and pagination
 *
 * @param params - The search parameters for filtering spreadsheets
 * @returns Promise resolving to the search results containing matching spreadsheets
 * @throws Error if the tool execution fails or returns an error
 *
 * @example
 * // Search for spreadsheets by name
 * const result = await request({ query: 'Budget', search_type: 'name', max_results: 20 });
 *
 * @example
 * // Search for recently modified spreadsheets
 * const result = await request({ 
 *   modified_after: '2024-01-01T00:00:00Z', 
 *   order_by: 'modifiedTime desc' 
 * });
 */
export async function request(params: SearchSpreadsheetsParams): Promise<SearchSpreadsheetsData> {
  // Validate parameter constraints
  if (params.max_results !== undefined && (params.max_results < 1 || params.max_results > 1000)) {
    throw new Error('Parameter max_results must be between 1 and 1000');
  }

  // CRITICAL: Use MCPToolResponse and parse JSON response
  const mcpResponse = await callMCPTool<MCPToolResponse, SearchSpreadsheetsParams>(
    '686de48c6fd1cae1afbb55ba',
    'GOOGLESHEETS_SEARCH_SPREADSHEETS',
    params
  );

  if (!mcpResponse.content?.[0]?.text) {
    throw new Error('Invalid MCP response format: missing content[0].text');
  }

  let toolData: SearchSpreadsheetsResponse;
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