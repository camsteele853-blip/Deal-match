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
 * Input parameters for listing Slack team channels with various filtering options
 */
export interface ListChannelsParams {
  /**
   * Filter channels by name (case-insensitive substring match).
   * This is a client-side filter applied after fetching from the API.
   * @example "general"
   * @example "announcements"
   */
  channel_name?: string;

  /**
   * Pagination cursor (from a previous response's `next_cursor`) for the next page of results.
   * Omit for the first page.
   * @example "dXNlcjpVMDYxTkZUVDI="
   * @example "bmV4dF90czoxNTEyMDg1ODYxMDAwNTQ5"
   */
  cursor?: string;

  /**
   * Excludes archived channels if true.
   * The API defaults to false (archived channels are included).
   * @example true
   * @example false
   */
  exclude_archived?: boolean;

  /**
   * Maximum number of channels to return per page (1 to 1000).
   * Fewer channels may be returned than requested.
   * This schema defaults to 1 if omitted.
   * @default 1
   * @example 100
   * @example 500
   * @example 1000
   */
  limit?: number;

  /**
   * Comma-separated list of channel types to include:
   * `public_channel`, `private_channel`, `mpim` (multi-person direct message), `im` (direct message).
   * The API defaults to `public_channel` if this parameter is omitted.
   * @example "public_channel,private_channel"
   * @example "im,mpim"
   */
  types?: string;
}

/**
 * Channel purpose with value, creator, and last_set timestamp
 */
export interface ChannelPurpose {
  /** Member ID who created the purpose */
  creator: string;
  /** Timestamp when purpose was last set */
  last_set: number;
  /** Purpose text value */
  value: string;
}

/**
 * Channel topic with value, creator, and last_set timestamp
 */
export interface ChannelTopic {
  /** Member ID who created the topic */
  creator: string;
  /** Timestamp when topic was last set */
  last_set: number;
  /** Topic text value */
  value: string;
}

/**
 * Channel-like conversation object returned in the channels array
 */
export interface ChannelItem {
  /** Associated workspace ID */
  context_team_id?: string | null;

  /** Shared channel host identifier */
  conversation_host_id?: string | null;

  /** Conversation creation timestamp */
  created: number;

  /** Member ID who created the conversation */
  creator?: string | null;

  /** Conversation identifier */
  id: string;

  /** Conversation is archived, frozen in time */
  is_archived: boolean;

  /** Whether it's a channel */
  is_channel: boolean;

  /** Part of a Shared Channel with remote organization */
  is_ext_shared?: boolean | null;

  /** Conversation is frozen */
  is_frozen?: boolean | null;

  /** Workspace's primary discussion channel */
  is_general: boolean;

  /** Private channel created before March 2021 */
  is_group: boolean;

  /** Direct message between individuals */
  is_im: boolean;

  /** User/bot is a member of this conversation */
  is_member?: boolean | null;

  /** Unnamed private conversation between multiple users */
  is_mpim: boolean;

  /** Shared between Enterprise organization workspaces */
  is_org_shared?: boolean | null;

  /** Ready to become externally shared */
  is_pending_ext_shared?: boolean | null;

  /** Conversation is privileged between two or more members */
  is_private: boolean;

  /** Cannot be written to */
  is_read_only?: boolean | null;

  /** Shared across workspaces */
  is_shared?: boolean | null;

  /** Cannot be written except in threads */
  is_thread_only?: boolean | null;

  /** Last message read timestamp */
  last_read?: string | null;

  /** Most recent message object */
  latest?: any | null;

  /** Channel-like thing name, without a leading hash sign */
  name: string;

  /** Normalized channel name */
  name_normalized?: string | null;

  /** Member count */
  num_members?: number | null;

  /** Workspaces awaiting connection */
  pending_connected_team_ids?: string[] | null;

  /** Array of pending shared connections */
  pending_shared?: string[] | null;

  /** Historical channel names */
  previous_names?: string[] | null;

  /**
   * Contains posting_restricted_to, threads_restricted_to, tabs, canvas, huddles, workflows,
   * and other channel-specific configurations
   */
  properties?: any | null;

  /** Channel purpose with value, creator, and last_set timestamp */
  purpose?: ChannelPurpose | null;

  /** Associated workspace IDs for shared channels */
  shared_team_ids?: string[] | null;

  /** Channel topic with value, creator, and last_set timestamp */
  topic?: ChannelTopic | null;

  /** Unlink status indicator */
  unlinked?: number | null;

  /** Unread message count. Included for DM conversations only */
  unread_count?: number | null;

  /** Filtered unread count for display. Included for DM conversations only */
  unread_count_display?: number | null;

  /** Timestamp, in milliseconds, when channel settings were updated */
  updated?: number | null;
}

/**
 * Response metadata containing pagination information
 */
export interface ResponseMetadata {
  /**
   * Cursor for pagination to retrieve the next page of results.
   * Empty, null, or non-existent value indicates no further results.
   */
  next_cursor?: string | null;
}

/**
 * Output data from listing Slack team channels
 */
export interface ListChannelsData {
  /** Indicates whether the API call was successful */
  ok: boolean;

  /** List of limited channel-like conversation objects in the workspace */
  channels: ChannelItem[];

  /** Response metadata containing pagination information */
  response_metadata?: ResponseMetadata | null;
}

/**
 * Internal response wrapper interface from outputSchema
 */
interface ListChannelsResponse {
  /** Whether or not the action execution was successful or not */
  successful: boolean;

  /** Data from the action execution */
  data?: ListChannelsData;

  /** Error if any occurred during the execution of the action */
  error?: string | null;
}

/**
 * Lists all Slack team channels with various filtering options.
 * 
 * This function retrieves channels from a Slack workspace with support for filtering by name,
 * channel type, archived status, and pagination. It can return public channels, private channels,
 * multi-person direct messages (mpim), and direct messages (im).
 *
 * @param params - The input parameters for filtering and paginating channels
 * @returns Promise resolving to the list of channels and pagination metadata
 * @throws Error if the tool execution fails or returns an error
 *
 * @example
 * // Get first 100 public channels
 * const result = await request({ limit: 100, types: 'public_channel' });
 * 
 * @example
 * // Get next page of results using cursor
 * const result = await request({ 
 *   limit: 100, 
 *   cursor: 'dXNlcjpVMDYxTkZUVDI=',
 *   exclude_archived: true 
 * });
 */
export async function request(params: ListChannelsParams): Promise<ListChannelsData> {
  // CRITICAL: Use MCPToolResponse and parse JSON response
  const mcpResponse = await callMCPTool<MCPToolResponse, ListChannelsParams>(
    '688338e4ee9e1a9340d83b62',
    'SLACK_LIST_ALL_SLACK_TEAM_CHANNELS_WITH_VARIOUS_FILTERS',
    params
  );
  
  if (!mcpResponse.content?.[0]?.text) {
    throw new Error('Invalid MCP response format: missing content[0].text');
  }
  
  let toolData: ListChannelsResponse;
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