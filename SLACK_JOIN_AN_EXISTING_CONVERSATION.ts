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
 * Input parameters for joining an existing Slack conversation
 */
export interface JoinConversationParams {
  /**
   * ID of the Slack conversation (public channel, private channel, or multi-person direct message) to join.
   * @example "C1234567890"
   * @example "G0987654321"
   * @example "D123ABCDEF0"
   */
  channel?: string;
}

/**
 * Purpose information for a channel
 */
export interface PurposeInfo {
  /**
   * The purpose text.
   */
  value: string;
  /**
   * User ID of the purpose creator.
   */
  creator: string;
  /**
   * Timestamp when purpose was last set.
   */
  last_set: number;
}

/**
 * Topic information for a channel
 */
export interface TopicInfo {
  /**
   * The topic text.
   */
  value: string;
  /**
   * User ID of the topic creator.
   */
  creator: string;
  /**
   * Timestamp when topic was last set.
   */
  last_set: number;
}

/**
 * The conversation object for the joined channel
 */
export interface ChannelObject {
  /**
   * Unique conversation identifier.
   */
  id: string;
  /**
   * Name of the channel-like thing, without a leading hash sign.
   */
  name: string;
  /**
   * Indicates public/private channel status.
   */
  is_channel: boolean;
  /**
   * Private channels created before March 2021.
   */
  is_group: boolean;
  /**
   * Direct message between two users/bot.
   */
  is_im: boolean;
  /**
   * Privileged conversation between members.
   */
  is_private: boolean;
  /**
   * Archived, frozen in time.
   */
  is_archived: boolean;
  /**
   * Member ID who created conversation.
   */
  creator: string;
  /**
   * Creation timestamp.
   */
  created: number;
  /**
   * Associated workspace ID.
   */
  context_team_id?: string;
  /**
   * Shared channel host ID.
   */
  conversation_host_id?: string;
  /**
   * Channel frozen status.
   */
  is_frozen?: boolean;
  /**
   * Workspace's primary discussion channel.
   */
  is_general?: boolean;
  /**
   * Calling user is conversation member.
   */
  is_member?: boolean;
  /**
   * Multi-person direct message.
   */
  is_mpim?: boolean;
  /**
   * Shared within Enterprise organization.
   */
  is_org_shared?: boolean;
  /**
   * Awaiting shared channel approval.
   */
  is_pending_ext_shared?: boolean;
  /**
   * Cannot be written to.
   */
  is_read_only?: boolean;
  /**
   * Shared across multiple workspaces.
   */
  is_shared?: boolean;
  /**
   * Part of external shared channel.
   */
  is_ext_shared?: boolean;
  /**
   * Write-only in thread replies.
   */
  is_thread_only?: boolean;
  /**
   * User's last read timestamp.
   */
  last_read?: string;
  /**
   * Most recent message.
   */
  latest?: string;
  /**
   * Standardized name format.
   */
  name_normalized?: string;
  /**
   * Member count.
   */
  num_members?: number;
  /**
   * Teams awaiting connection.
   */
  pending_connected_team_ids?: string[];
  /**
   * Pending shared channel invitations.
   */
  pending_shared?: string[];
  /**
   * Historical channel names.
   */
  previous_names?: string[];
  /**
   * Advanced channel properties including posting restrictions, threads, tabs, canvas, workflow, huddles, membership limits, and other settings.
   */
  properties?: Record<string, any>;
  /**
   * Purpose information for a channel.
   */
  purpose?: PurposeInfo;
  /**
   * Associated workspace IDs.
   */
  shared_team_ids?: string[];
  /**
   * Topic information for a channel.
   */
  topic?: TopicInfo;
  /**
   * Unlink count.
   */
  unlinked?: number;
  /**
   * Unread message count.
   */
  unread_count?: number;
  /**
   * Relevant unread messages.
   */
  unread_count_display?: number;
  /**
   * Milliseconds, when the channel settings were updated.
   */
  updated?: number;
  [key: string]: any;
}

/**
 * Response metadata containing warnings and other API information
 */
export interface ResponseMetadata {
  /**
   * Array of warning messages.
   */
  warnings?: string[];
}

/**
 * Output data from joining a Slack conversation
 */
export interface JoinConversationData {
  /**
   * Indicates whether the API call was successful.
   */
  ok: boolean;
  /**
   * The conversation object for the joined channel.
   */
  channel?: ChannelObject;
  error?: string;
  needed?: string;
  provided?: string;
  /**
   * Response metadata containing warnings and other API information.
   */
  response_metadata?: ResponseMetadata;
  /**
   * Warning message, such as 'already_in_channel' when the calling token has already joined the channel.
   */
  warning?: string;
}

/**
 * Internal response wrapper interface from outputSchema
 */
interface JoinConversationResponse {
  /**
   * Whether or not the action execution was successful or not
   */
  successful: boolean;
  /**
   * Data from the action execution
   */
  data?: JoinConversationData;
  /**
   * Error if any occurred during the execution of the action
   */
  error?: string;
}

/**
 * Join an existing Slack conversation (public channel, private channel, or multi-person direct message).
 * This allows the authenticated user/bot to become a member of the specified conversation.
 *
 * @param params - The input parameters containing the channel ID to join
 * @returns Promise resolving to the joined conversation data including channel details
 * @throws Error if the tool execution fails or returns an error
 *
 * @example
 * const result = await request({ channel: 'C1234567890' });
 * console.log(result.channel?.name); // Channel name
 */
export async function request(params: JoinConversationParams): Promise<JoinConversationData> {
  // CRITICAL: Use MCPToolResponse and parse JSON response
  const mcpResponse = await callMCPTool<MCPToolResponse, JoinConversationParams>(
    '688338e4ee9e1a9340d83b62',
    'SLACK_JOIN_AN_EXISTING_CONVERSATION',
    params
  );
  
  if (!mcpResponse.content?.[0]?.text) {
    throw new Error('Invalid MCP response format: missing content[0].text');
  }
  
  let toolData: JoinConversationResponse;
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