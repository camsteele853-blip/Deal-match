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
 * Input parameters for fetching a message thread from a Slack conversation
 */
export interface FetchMessageThreadParams {
  /**
   * ID of the conversation (channel, direct message, etc.) to fetch the thread from.
   * @example "C0123456789"
   */
  channel?: string;

  /**
   * Pagination cursor from `response_metadata.next_cursor` of a previous response to get subsequent pages. If omitted, fetches the first page.
   * @example "dXNlcjpVMEc5V0ZYTlo="
   */
  cursor?: string;

  /**
   * Whether to include messages with `latest` or `oldest` timestamps in results. Effective only if `latest` or `oldest` is specified.
   * @example true
   */
  inclusive?: boolean;

  /**
   * Latest message timestamp in the time range to include results.
   * @example "1678886400.000000"
   */
  latest?: string;

  /**
   * Maximum number of messages to return. Fewer may be returned even if more are available.
   * @example 100
   */
  limit?: number;

  /**
   * Oldest message timestamp in the time range to include results.
   * @example "1678836000.000000"
   */
  oldest?: string;

  /**
   * Required for org-wide apps: the workspace ID to use for this request. If using a workspace-level token, this parameter is optional and will be ignored.
   * @example "T1234567890"
   */
  team_id?: string;

  /**
   * Timestamp of the parent message in the thread. Must be an existing message. If no replies, only the parent message itself is returned.
   * @example "1234567890.123456"
   */
  ts?: string;
}

/**
 * Information about message edits
 */
export interface EditedInfo {
  /**
   * Timestamp when the edit occurred.
   */
  ts: string;

  /**
   * User ID of the editor.
   */
  user: string;
}

/**
 * Message metadata containing event_type and event_payload
 */
export interface MessageMetadata {
  /**
   * Type of the metadata event.
   */
  event_type: string;

  /**
   * Custom payload data for the metadata event.
   */
  event_payload: any;
}

/**
 * Reaction object containing emoji reactions added to the message
 */
export interface Reaction {
  /**
   * Name of the emoji reaction.
   */
  name: string;

  /**
   * Total number of users who added this reaction.
   */
  count: number;

  /**
   * Array of user IDs who added this reaction (may be incomplete).
   */
  users: string[];
}

/**
 * Individual message object in the thread
 */
export interface Message {
  /**
   * Message type, typically 'message'.
   */
  type: string;

  /**
   * The message text content.
   */
  text: string;

  /**
   * Timestamp that uniquely identifies the message within the channel or conversation.
   */
  ts: string;

  /**
   * Application ID associated with the message.
   */
  app_id?: string;

  /**
   * Array of legacy attachment objects for rich message formatting.
   */
  attachments?: any[];

  /**
   * Array of structured block elements that define the message layout.
   */
  blocks?: any[];

  /**
   * Bot ID that defines the name and icons to use for the message. Present on bot messages.
   */
  bot_id?: string;

  /**
   * Channel ID where the message was posted.
   */
  channel?: string;

  /**
   * Client-generated message identifier used to track messages.
   */
  client_msg_id?: string;

  /**
   * Information about message edits.
   */
  edited?: EditedInfo;

  /**
   * Array of file objects attached to the message.
   */
  files?: any[];

  /**
   * Present and true if the message has been starred by the calling user.
   */
  is_starred?: boolean;

  /**
   * Timestamp of the last message read by the current user in the thread.
   */
  last_read?: string;

  /**
   * Timestamp of the most recent reply in the thread.
   */
  latest_reply?: string;

  /**
   * Message metadata containing event_type and event_payload.
   */
  metadata?: MessageMetadata;

  /**
   * User ID of the parent message author. Present on reply messages.
   */
  parent_user_id?: string;

  /**
   * Array of channel IDs to which the message is currently pinned.
   */
  pinned_to?: string[];

  /**
   * Array of reaction objects containing emoji reactions added to the message.
   */
  reactions?: Reaction[];

  /**
   * Number of replies in the thread. Present on parent messages.
   */
  reply_count?: number;

  /**
   * Number of unique users who have replied to the thread.
   */
  reply_users_count?: number;

  /**
   * Whether the current user is subscribed to notifications for this thread.
   */
  subscribed?: boolean;

  /**
   * Message subtype that indicates special message types like 'bot_message', 'file_share', etc.
   */
  subtype?: string;

  /**
   * Team/workspace ID where the message was posted.
   */
  team?: string;

  /**
   * Timestamp of the parent message that identifies the thread this message belongs to.
   */
  thread_ts?: string;

  /**
   * Number of unread messages in the thread for the current user.
   */
  unread_count?: number;

  /**
   * User ID of the message author. Not present for bot messages.
   */
  user?: string;

  /**
   * Name for the bot to speak as. Typically used when bot_id is not present.
   */
  username?: string;
}

/**
 * Response metadata containing pagination information
 */
export interface ResponseMetadata {
  /**
   * Cursor value to use in subsequent requests for pagination. Empty string if no more results.
   */
  next_cursor?: string;
}

/**
 * Output data from fetching a message thread from a Slack conversation
 */
export interface MessageThreadData {
  /**
   * Indicates whether the API call was successful.
   */
  ok: boolean;

  /**
   * Additional context about the response, such as warnings about potential missing replies or pagination.
   */
  composio_execution_message?: string;

  /**
   * Error code when ok is false. Common errors include: channel_not_found, thread_not_found, missing_scope, not_authed, ratelimited.
   */
  error?: string;

  /**
   * Indicates whether there are more messages available beyond the current page.
   */
  has_more?: boolean;

  /**
   * Array of message objects in the thread, including the parent message and all replies. Not present when ok=false.
   */
  messages?: Message[];

  /**
   * Response metadata containing pagination information.
   */
  response_metadata?: ResponseMetadata;
}

/**
 * Internal response wrapper interface from outputSchema
 */
interface FetchMessageThreadResponse {
  successful: boolean;
  data?: MessageThreadData;
  error?: string;
}

/**
 * Fetches a message thread from a Slack conversation.
 * 
 * This function retrieves all messages in a thread, including the parent message and all replies.
 * Supports pagination for threads with many messages. If the specified timestamp has no replies,
 * only the parent message itself is returned.
 *
 * @param params - The input parameters for fetching the message thread
 * @returns Promise resolving to the message thread data including all messages and pagination info
 * @throws Error if the tool execution fails or returns an error
 *
 * @example
 * const thread = await request({ 
 *   channel: 'C0123456789', 
 *   ts: '1234567890.123456',
 *   limit: 50
 * });
 */
export async function request(params: FetchMessageThreadParams): Promise<MessageThreadData> {
  // CRITICAL: Use MCPToolResponse and parse JSON response
  const mcpResponse = await callMCPTool<MCPToolResponse, FetchMessageThreadParams>(
    '688338e4ee9e1a9340d83b62',
    'SLACK_FETCH_MESSAGE_THREAD_FROM_A_CONVERSATION',
    params
  );
  
  if (!mcpResponse.content?.[0]?.text) {
    throw new Error('Invalid MCP response format: missing content[0].text');
  }
  
  let toolData: FetchMessageThreadResponse;
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