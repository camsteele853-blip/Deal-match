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
 * Input parameters for fetching Slack conversation history
 */
export interface FetchConversationHistoryParams {
  /**
   * The ID of the public channel, private channel, direct message, or multi-person direct message to fetch history from.
   * @example "C1234567890", "G0123456789", "D0123456789"
   */
  channel: string;

  /**
   * Pagination cursor from `next_cursor` of a previous response to fetch subsequent pages. See Slack's pagination documentation for details.
   * @example "dXNlcjpVMDYxTkZUVDA="
   */
  cursor?: string;

  /**
   * When true, includes messages at the exact 'oldest' or 'latest' boundary timestamps in results. When false (default), excludes boundary messages. Only applies when 'oldest' or 'latest' is specified.
   * @example true, false
   */
  inclusive?: boolean;

  /**
   * End of the time range of messages to include in results. Accepts a Unix timestamp or a Slack timestamp (e.g., '1234567890.000000'). NOTE: This filter only applies to main channel messages, not threaded replies. Use SLACK_FETCH_MESSAGE_THREAD_FROM_A_CONVERSATION to retrieve replies.
   * @example "1609459200.000000"
   */
  latest?: string;

  /**
   * Maximum number of messages to return (1-1000). The action automatically paginates through API requests to fetch the requested number of messages. Note: Per-request API limits vary by app type (Marketplace/internal apps: up to 999 per request; non-Marketplace apps: 15 per request as of May 2025). Recommended: 200 or fewer for optimal performance.
   * @example 100, 200
   */
  limit?: number;

  /**
   * Start of the time range of messages to include in results. Accepts a Unix timestamp or a Slack timestamp (e.g., '1234567890.000000'). NOTE: This filter only applies to main channel messages, not threaded replies. Use SLACK_FETCH_MESSAGE_THREAD_FROM_A_CONVERSATION to retrieve replies.
   * @example "1609372800.000000"
   */
  oldest?: string;
}

/**
 * Edit history information for a message
 */
export interface MessageEdited {
  /**
   * Timestamp when the message was edited
   */
  ts: string;

  /**
   * User ID of the person who edited the message
   */
  user: string;
}

/**
 * Message metadata containing event_type and event_payload fields
 */
export interface MessageMetadata {
  /**
   * The type of metadata event
   */
  event_type: string;

  /**
   * The payload data for the metadata event
   */
  event_payload: Record<string, any>;
}

/**
 * Represents a reaction to a message or item
 */
export interface Reaction {
  /**
   * The emoji name of the reaction (e.g., 'grinning', 'thumbsup')
   */
  name: string;

  /**
   * Array of user IDs who added this reaction
   */
  users: string[];

  /**
   * Total number of users who added this reaction
   */
  count: number;
}

/**
 * Represents a message in a Slack conversation
 */
export interface Message {
  /**
   * The message type. Typically 'message' for user-entered text messages
   */
  type: string;

  /**
   * The message text content
   */
  text: string;

  /**
   * Timestamp of the message, serving as a unique identifier per channel. Format is a Unix timestamp with microsecond precision (e.g., '1512085950.000216')
   */
  ts: string;

  /**
   * User ID of the message author. Present for user messages, may be absent for bot messages or certain subtypes
   */
  user?: string;

  /**
   * App ID of the application that posted the message. Present for app-posted messages
   */
  app_id?: string;

  /**
   * Array of attachment objects. Legacy message attachments for rich formatting
   */
  attachments?: Array<Record<string, any>>;

  /**
   * Array of Block Kit block objects for rich message formatting
   */
  blocks?: Array<Record<string, any>>;

  /**
   * Bot ID of the bot that posted the message. Present for bot messages
   */
  bot_id?: string;

  /**
   * Edit history information for a message
   */
  edited?: MessageEdited;

  /**
   * Array of file objects attached to the message
   */
  files?: Array<Record<string, any>>;

  /**
   * Present and true for free teams that have reached the free message limit
   */
  is_limited?: boolean;

  /**
   * Present and true if the calling user has starred the message
   */
  is_starred?: boolean;

  /**
   * Timestamp of the last read message in the thread by the current user
   */
  last_read?: string;

  /**
   * Timestamp of the most recent reply in the thread
   */
  latest_reply?: string;

  /**
   * Message metadata containing event_type and event_payload fields
   */
  metadata?: MessageMetadata;

  /**
   * User ID of the parent message author. Present on threaded reply messages
   */
  parent_user_id?: string;

  /**
   * Array containing the IDs of any channels to which the message is currently pinned
   */
  pinned_to?: string[];

  /**
   * Array of reaction objects added to the message by team members
   */
  reactions?: Reaction[];

  /**
   * Deprecated array containing user and ts information for each reply. Scheduled for removal
   */
  replies?: Array<Record<string, any>>;

  /**
   * Number of replies in the thread. Present on parent messages that have replies
   */
  reply_count?: number;

  /**
   * Array of user IDs who have replied to the thread. Maximum of 5 user IDs shown
   */
  reply_users?: string[];

  /**
   * Total count of users who have replied to the thread
   */
  reply_users_count?: number;

  /**
   * Whether the current user is subscribed to the thread
   */
  subscribed?: boolean;

  /**
   * Optional subtype indicating the specific kind of message event (e.g., 'bot_message', 'channel_join', 'message_changed', 'thread_broadcast')
   */
  subtype?: string;

  /**
   * Timestamp identifier for a thread. If present and equal to ts, this is a parent message. If present and different from ts, this is a threaded reply
   */
  thread_ts?: string;

  /**
   * Number of unread messages in the thread for the current user
   */
  unread_count?: number;

  /**
   * Username of the bot or app. Present for bot messages
   */
  username?: string;
}

/**
 * Response metadata containing pagination information
 */
export interface ResponseMetadata {
  /**
   * Cursor for pagination to retrieve the next page of results. Use this value in the cursor parameter of subsequent requests
   */
  next_cursor?: string;
}

/**
 * Output data from fetching Slack conversation history
 */
export interface FetchConversationHistoryData {
  /**
   * Indicates whether the API call was successful
   */
  ok: boolean;

  /**
   * Count of channel actions
   */
  channel_actions_count?: number;

  /**
   * Timestamp of channel actions
   */
  channel_actions_ts?: string;

  /**
   * Informational message about the execution result, such as hints when empty results may be due to threaded replies not being included
   */
  composio_execution_message?: string;

  /**
   * Error code if the API call was unsuccessful (e.g., 'channel_not_found')
   */
  error?: string;

  /**
   * Boolean indicating whether there are more messages available beyond the current result set. True if there were more than 100 messages between oldest and latest timestamps
   */
  has_more?: boolean;

  /**
   * Optional timestamp field that may appear in responses
   */
  latest?: string;

  /**
   * Array of message objects from the main channel timeline. Contains up to 100 messages between the oldest and latest timestamps. NOTE: Threaded replies are NOT included - only parent messages. Parent messages will have thread_ts, reply_count, and latest_reply fields if they have replies. Use SLACK_FETCH_MESSAGE_THREAD_FROM_A_CONVERSATION to retrieve actual reply content
   */
  messages?: Message[];

  /**
   * The number of pinned messages in the conversation
   */
  pin_count?: number;

  /**
   * Response metadata containing pagination information
   */
  response_metadata?: ResponseMetadata;
}

/**
 * Internal response wrapper interface from outputSchema
 */
interface FetchConversationHistoryResponse {
  /**
   * Whether or not the action execution was successful or not
   */
  successful: boolean;

  /**
   * Data from the action execution
   */
  data?: FetchConversationHistoryData;

  /**
   * Error if any occurred during the execution of the action
   */
  error?: string;
}

/**
 * Fetches conversation history from a Slack channel, direct message, or multi-person direct message.
 * Returns up to the specified limit of messages from the main channel timeline.
 * 
 * NOTE: This function retrieves only parent messages from the main timeline. Threaded replies are NOT included.
 * To retrieve threaded replies, use SLACK_FETCH_MESSAGE_THREAD_FROM_A_CONVERSATION with the parent message's thread_ts.
 *
 * @param params - The input parameters for fetching conversation history
 * @returns Promise resolving to the conversation history data including messages and pagination metadata
 * @throws Error if the channel parameter is missing or if the tool execution fails
 *
 * @example
 * const history = await request({ 
 *   channel: 'C1234567890', 
 *   limit: 100 
 * });
 */
export async function request(params: FetchConversationHistoryParams): Promise<FetchConversationHistoryData> {
  // Validate required parameters
  if (!params.channel) {
    throw new Error('Missing required parameter: channel');
  }

  // CRITICAL: Use MCPToolResponse and parse JSON response
  const mcpResponse = await callMCPTool<MCPToolResponse, FetchConversationHistoryParams>(
    '688338e4ee9e1a9340d83b62',
    'SLACK_FETCH_CONVERSATION_HISTORY',
    params
  );

  if (!mcpResponse.content?.[0]?.text) {
    throw new Error('Invalid MCP response format: missing content[0].text');
  }

  let toolData: FetchConversationHistoryResponse;
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