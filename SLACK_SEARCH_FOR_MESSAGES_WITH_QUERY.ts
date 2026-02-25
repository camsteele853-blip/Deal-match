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
 * Input parameters for searching Slack messages with query
 */
export interface SearchMessagesParams {
  /**
   * Search query supporting various modifiers for precise filtering:
   * 
   * **Date Modifiers:**
   * - `on:YYYY-MM-DD` - Messages on specific date (e.g., `on:2025-09-25`)
   * - `before:YYYY-MM-DD` - Messages before date
   * - `after:YYYY-MM-DD` - Messages after date  
   * - `during:YYYY-MM-DD` or `during:month` or `during:YYYY` - Messages during day/month/year
   *
   * **Location Modifiers:**
   * - `in:#channel-name` - Messages in specific channel
   * - `in:@username` - Direct messages with user
   *
   * **User Modifiers:**
   * - `from:@username` - Messages from specific user
   * - `from:botname` - Messages from bot
   *
   * **Content Modifiers:**
   * - `has:link` - Messages with links
   * - `has:file` - Messages with files
   * - `has::star:` - Starred messages
   * - `has::pin:` - Pinned messages
   *
   * **Special Characters:**
   * - `"exact phrase"` - Search exact phrase
   * - `*wildcard` - Wildcard matching
   * - `-exclude` - Exclude words
   *
   * **Combinations:** Mix modifiers like `"project update" on:2025-09-25 in:#marketing from:@john`
   */
  query: string;

  /**
   * When enabled, 'count' becomes the total messages desired instead of per-page limit. 
   * System automatically handles pagination to collect the specified total. 
   * Cannot be used with 'page' parameter - choose either automatic collection or manual page control. 
   * Usage: If you fetched 100 messages but pagination shows 500 total available, 
   * set auto_paginate=true and count=500 to get all results at once.
   */
  auto_paginate?: boolean;

  /**
   * Without auto_paginate: Number of messages per page (max 100). 
   * With auto_paginate: Total messages desired. 
   * Set count=500 to get 500 messages with automatic pagination handling.
   */
  count?: number;

  /**
   * Enable highlighting of search terms in results.
   */
  highlight?: boolean;

  /**
   * Page number for manual pagination control. 
   * Cannot be used with auto_paginate - choose either automatic collection OR manual page control, not both.
   */
  page?: number;

  /**
   * Sort results by `score` (relevance) or `timestamp` (chronological).
   */
  sort?: string;

  /**
   * Sort direction: `asc` (ascending) or `desc` (descending).
   */
  sort_dir?: string;
}

/**
 * A reaction added to a message
 */
export interface Reaction {
  /**
   * Name of the emoji reaction.
   */
  name: string;

  /**
   * Number of users who added this reaction.
   */
  count: number;

  /**
   * Array of user IDs who added this reaction.
   */
  users: string[];
}

/**
 * Information about message edits
 */
export interface EditedInfo {
  /**
   * User ID of the editor.
   */
  user: string;

  /**
   * Timestamp when the edit occurred.
   */
  ts: string;
}

/**
 * Structured metadata payload with event_type and event_payload fields
 */
export interface MessageMetadata {
  /**
   * The type of metadata event.
   */
  event_type?: string | null;

  /**
   * The payload data for the metadata event.
   */
  event_payload?: Record<string, any> | null;
}

/**
 * Channel information where the message was posted
 */
export interface Channel {
  /**
   * Unique identifier of the channel.
   */
  id: string;

  /**
   * Name of the channel. For IM results, contains the user ID of the target user.
   */
  name: string;

  /**
   * Whether the channel is externally shared.
   */
  is_ext_shared?: boolean | null;

  /**
   * Whether the channel is a multi-party instant message.
   */
  is_mpim?: boolean | null;

  /**
   * Whether the channel is shared across the organization.
   */
  is_org_shared?: boolean | null;

  /**
   * Whether the channel has pending external sharing.
   */
  is_pending_ext_shared?: boolean | null;

  /**
   * Whether the channel is private.
   */
  is_private?: boolean | null;

  /**
   * Whether the channel is shared.
   */
  is_shared?: boolean | null;

  /**
   * Array of pending shares for the channel.
   */
  pending_shared?: string[] | null;
}

/**
 * A message object matching the search query
 */
export interface MessageMatch {
  /**
   * Message type, typically 'message'. For IM results, set to 'im'; for private groups, set to 'group'.
   */
  type: string;

  /**
   * The message text content. When highlights=true is used, matching query terms are wrapped 
   * with U+E000 (start) and U+E001 (end) markers.
   */
  text: string;

  /**
   * Unix timestamp of the message, serves as a unique identifier within the channel.
   */
  ts: string;

  /**
   * Channel information where the message was posted.
   */
  channel: Channel;

  /**
   * Permanent URL link to the specific message.
   */
  permalink: string;

  /**
   * Internal identifier for the message in search results.
   */
  iid: string;

  /**
   * App ID if the message was posted by an app.
   */
  app_id?: string | null;

  /**
   * Array of attachment objects associated with the message.
   */
  attachments?: any[] | null;

  /**
   * Array of block objects for structured message layout.
   */
  blocks?: any[] | null;

  /**
   * Bot ID if the message was posted by a bot.
   */
  bot_id?: string | null;

  /**
   * Bot profile information if posted by a bot.
   */
  bot_profile?: any | null;

  /**
   * Client-side message identifier.
   */
  client_msg_id?: string | null;

  /**
   * Information about message edits.
   */
  edited?: EditedInfo | null;

  /**
   * Array of file objects attached to the message.
   */
  files?: any[] | null;

  /**
   * Whether the message is starred by the user.
   */
  is_starred?: boolean | null;

  /**
   * Timestamp of the most recent reply in the thread.
   */
  latest_reply?: string | null;

  /**
   * Structured metadata payload with event_type and event_payload fields.
   */
  metadata?: MessageMetadata | null;

  /**
   * User ID of the parent message author (for reply messages).
   */
  parent_user_id?: string | null;

  /**
   * Array of channel IDs where this message is pinned.
   */
  pinned_to?: string[] | null;

  /**
   * Array of reactions added to the message.
   */
  reactions?: Reaction[] | null;

  /**
   * Number of replies in the thread.
   */
  reply_count?: number | null;

  /**
   * Array of user IDs who participated in the thread.
   */
  reply_users?: string[] | null;

  /**
   * Number of unique users who replied to the thread.
   */
  reply_users_count?: number | null;

  /**
   * Message subtype for special message types.
   */
  subtype?: string | null;

  /**
   * Team/workspace ID where the message was posted.
   */
  team?: string | null;

  /**
   * Thread timestamp that identifies the thread this message belongs to. 
   * When equal to ts, indicates this is a parent message.
   */
  thread_ts?: string | null;

  /**
   * User ID of the message author.
   */
  user?: string | null;

  /**
   * Display username of the message author.
   */
  username?: string | null;
}

/**
 * Pagination information for the search results
 */
export interface Paging {
  /**
   * Number of records per page.
   */
  count: number;

  /**
   * Total records matching the query.
   */
  total: number;

  /**
   * Current page number of records returned.
   */
  page: number;

  /**
   * Total number of pages matching the query.
   */
  pages: number;
}

/**
 * Alternative pagination metadata format
 */
export interface Pagination {
  /**
   * First page number.
   */
  first?: number | null;

  /**
   * Last page number.
   */
  last?: number | null;

  /**
   * Current page number.
   */
  page?: number | null;

  /**
   * Total number of pages.
   */
  page_count?: number | null;

  /**
   * Results per page.
   */
  per_page?: number | null;

  /**
   * Total number of results.
   */
  total_count?: number | null;
}

/**
 * Container object for search results and pagination information
 */
export interface MessagesContainer {
  /**
   * Array of message objects that match the search query.
   */
  matches: MessageMatch[];

  /**
   * Total number of messages matching the search query.
   */
  total: number;

  /**
   * Pagination information for the search results.
   */
  paging: Paging;

  /**
   * Alternative pagination metadata format.
   */
  pagination?: Pagination | null;
}

/**
 * Additional metadata about the response including warnings
 */
export interface ResponseMetadata {
  /**
   * Array of warning codes.
   */
  warnings?: string[] | null;

  /**
   * Array of human-readable warning or error descriptions.
   */
  messages?: string[] | null;
}

/**
 * Output data from searching Slack messages
 */
export interface SearchMessagesData {
  /**
   * Indicates whether the API call was successful.
   */
  ok: boolean;

  /**
   * Container object for search results and pagination information.
   */
  messages?: MessagesContainer | null;

  /**
   * The search query string that was executed.
   */
  query?: string | null;

  /**
   * Error code when ok is false. Common values include: not_authed, invalid_auth, 
   * account_inactive, token_revoked, no_permission, missing_scope, invalid_arguments, 
   * invalid_cursor, fatal_error, internal_error.
   */
  error?: string | null;

  /**
   * Additional metadata about the response including warnings.
   */
  response_metadata?: ResponseMetadata | null;
}

/**
 * Internal response wrapper interface
 */
interface SearchMessagesResponse {
  successful: boolean;
  data: SearchMessagesData;
  error?: string | null;
}

/**
 * Search for messages in Slack using a query with support for various modifiers 
 * (date, location, user, content filters) and pagination options.
 *
 * @param params - The search parameters including query string and optional filters
 * @returns Promise resolving to the search results with messages and pagination info
 * @throws Error if required parameters are missing or if the tool execution fails
 *
 * @example
 * const result = await request({ 
 *   query: 'project update on:2025-09-25 in:#marketing',
 *   count: 50,
 *   sort: 'timestamp',
 *   sort_dir: 'desc'
 * });
 */
export async function request(params: SearchMessagesParams): Promise<SearchMessagesData> {
  // Validate required parameters
  if (!params.query) {
    throw new Error('Missing required parameter: query');
  }

  // CRITICAL: Use MCPToolResponse and parse JSON response
  const mcpResponse = await callMCPTool<MCPToolResponse, SearchMessagesParams>(
    '688338e4ee9e1a9340d83b62',
    'SLACK_SEARCH_FOR_MESSAGES_WITH_QUERY',
    params
  );

  if (!mcpResponse.content?.[0]?.text) {
    throw new Error('Invalid MCP response format: missing content[0].text');
  }

  let toolData: SearchMessagesResponse;
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