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
 * Input parameters for creating a Slack channel
 */
export interface CreateChannelParams {
  /**
   * Create a private channel instead of a public one
   * @example true
   */
  is_private?: boolean | null;
  
  /**
   * Name of the public or private channel to create
   * @example "mychannel"
   */
  name: string;
  
  /**
   * Encoded team id to create the channel in, required if org token is used
   * @example "T1234567890"
   */
  team_id?: string | null;
}

/**
 * Conversation canvas metadata, when a channel canvas is associated
 */
export interface ConversationCanvas {
  file_id?: string | null;
  is_empty?: boolean | null;
  quip_thread_id?: string | null;
}

/**
 * Conversation properties
 */
export interface ConversationProperties {
  /**
   * Channel canvas metadata, when a channel canvas is associated
   */
  canvas?: ConversationCanvas | null;
}

/**
 * Conversation purpose metadata
 */
export interface ConversationPurpose {
  /**
   * User ID of who set the purpose
   */
  creator?: string | null;
  
  /**
   * Unix timestamp when the purpose was last set (seconds)
   */
  last_set?: number | null;
  
  /**
   * The purpose text
   */
  value?: string | null;
}

/**
 * Conversation topic metadata
 */
export interface ConversationTopic {
  /**
   * User ID of who set the topic
   */
  creator?: string | null;
  
  /**
   * Unix timestamp when the topic was last set (seconds)
   */
  last_set?: number | null;
  
  /**
   * The topic text
   */
  value?: string | null;
}

/**
 * Slack Conversation (channel) object (subset; extra fields allowed)
 */
export interface Conversation {
  context_team_id?: string | null;
  created?: number | null;
  creator?: string | null;
  id: string;
  is_archived?: boolean | null;
  is_channel?: boolean | null;
  is_ext_shared?: boolean | null;
  is_general?: boolean | null;
  is_group?: boolean | null;
  is_im?: boolean | null;
  is_member?: boolean | null;
  is_mpim?: boolean | null;
  is_open?: boolean | null;
  is_org_shared?: boolean | null;
  is_pending_ext_shared?: boolean | null;
  is_private?: boolean | null;
  is_shared?: boolean | null;
  last_read?: string | null;
  latest?: Record<string, any> | null;
  name?: string | null;
  name_normalized?: string | null;
  parent_conversation?: string | null;
  pending_connected_team_ids?: string[] | null;
  pending_shared?: string[] | null;
  previous_names?: string[] | null;
  priority?: number | null;
  properties?: ConversationProperties | null;
  purpose?: ConversationPurpose | null;
  shared_team_ids?: string[] | null;
  topic?: ConversationTopic | null;
  unlinked?: number | null;
  unread_count?: number | null;
  unread_count_display?: number | null;
  updated?: number | null;
  [key: string]: any;
}

/**
 * Response metadata containing warnings or additional response details
 */
export interface ResponseMetadata {
  warnings?: string[] | null;
}

/**
 * Output data from creating a Slack channel
 */
export interface CreateChannelData {
  /**
   * Slack Conversation (channel) object (subset; extra fields allowed)
   */
  channel?: Conversation | null;
  
  /**
   * Present when ok is false. Machine-readable error code (e.g., name_taken, cannot_create_channel, invalid_name)
   */
  error?: string | null;
  
  /**
   * Indicates whether the request was successful
   */
  ok: boolean;
  
  /**
   * Metadata containing warnings or additional response details
   */
  response_metadata?: ResponseMetadata | null;
  
  /**
   * Optional human-readable warning string that may be returned (e.g., missing_charset, superfluous_charset)
   */
  warning?: string | null;
}

/**
 * Internal response wrapper interface from outputSchema
 */
interface CreateChannelResponse {
  /**
   * Whether or not the action execution was successful or not
   */
  successful: boolean;
  
  /**
   * Data from the action execution
   */
  data?: CreateChannelData;
  
  /**
   * Error if any occurred during the execution of the action
   */
  error?: string | null;
}

/**
 * Creates a new Slack channel (public or private)
 *
 * This function initiates a channel-based conversation in Slack by creating
 * a new public or private channel with the specified name.
 *
 * @param params - The input parameters for creating the channel
 * @param params.name - Name of the public or private channel to create (required)
 * @param params.is_private - Create a private channel instead of a public one (optional)
 * @param params.team_id - Encoded team id to create the channel in, required if org token is used (optional)
 * @returns Promise resolving to the created channel data
 * @throws Error if required parameters are missing or if the tool execution fails
 *
 * @example
 * const result = await request({ name: 'mychannel', is_private: false });
 */
export async function request(params: CreateChannelParams): Promise<CreateChannelData> {
  // Validate required parameters
  if (!params.name) {
    throw new Error('Missing required parameter: name');
  }
  
  // CRITICAL: Use MCPToolResponse and parse JSON response
  const mcpResponse = await callMCPTool<MCPToolResponse, CreateChannelParams>(
    '688338e4ee9e1a9340d83b62',
    'SLACK_INITIATES_CHANNEL_BASED_CONVERSATIONS',
    params
  );
  
  if (!mcpResponse.content?.[0]?.text) {
    throw new Error('Invalid MCP response format: missing content[0].text');
  }
  
  let toolData: CreateChannelResponse;
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