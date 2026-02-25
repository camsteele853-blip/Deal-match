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
 * Input parameters for inviting users to a Slack channel
 */
export interface InviteUsersToChannelParams {
  /**
   * ID of the public or private Slack channel to invite users to; must be an existing channel.
   * Typically starts with 'C' (public) or 'G' (private/group).
   * @example "C1234567890"
   * @example "G0987654321"
   */
  channel: string;

  /**
   * Comma-separated string of valid Slack User IDs to invite.
   * Up to 1000 user IDs can be included.
   * @example "U1234567890,U2345678901,U3456789012"
   */
  users: string;
}

/**
 * Purpose information for a channel
 */
interface ChannelPurpose {
  /**
   * User ID of the member who set the purpose.
   */
  creator?: string | null;

  /**
   * Unix timestamp when the purpose was last set.
   */
  last_set?: number | null;

  /**
   * The purpose text.
   */
  value?: string | null;
}

/**
 * Topic information for a channel
 */
interface ChannelTopic {
  /**
   * User ID of the member who set the topic.
   */
  creator?: string | null;

  /**
   * Unix timestamp when the topic was last set.
   */
  last_set?: number | null;

  /**
   * The topic text.
   */
  value?: string | null;
}

/**
 * Display counts for a channel
 */
interface DisplayCounts {
  display_counts: number;
  guest_counts: number;
}

/**
 * Team icon information
 */
interface TeamIcon {
  image_102?: string | null;
  image_132?: string | null;
  image_230?: string | null;
  image_34?: string | null;
  image_44?: string | null;
  image_68?: string | null;
  image_88?: string | null;
  image_default?: boolean | null;
}

/**
 * External organization migrations
 */
interface ExternalOrgMigrations {
  current: Array<{
    date_started: number;
    team_id: string;
  }>;
  date_updated: number;
}

/**
 * Primary owner information
 */
interface PrimaryOwner {
  email: string;
  id: string;
}

/**
 * SSO provider information
 */
interface SsoProvider {
  label?: string | null;
  name?: string | null;
  type?: string | null;
}

/**
 * Team object information
 */
interface TeamObject {
  archived?: boolean | null;
  avatar_base_url?: string | null;
  created?: number | null;
  date_create?: number | null;
  deleted?: boolean | null;
  description?: string | null;
  discoverable?: Array<any | string> | null;
  domain: string;
  email_domain: string;
  enterprise_id?: string | null;
  enterprise_name?: string | null;
  external_org_migrations?: ExternalOrgMigrations | null;
  has_compliance_export?: boolean | null;
  icon: TeamIcon;
  id: string;
  is_assigned?: boolean | null;
  is_enterprise?: number | null;
  is_over_storage_limit?: boolean | null;
  limit_ts?: number | null;
  locale?: string | null;
  messages_count?: number | null;
  msg_edit_window_mins?: number | null;
  name: string;
  over_integrations_limit?: boolean | null;
  over_storage_limit?: boolean | null;
  pay_prod_cur?: string | null;
  plan?: "" | "std" | "plus" | "compliance" | "enterprise" | null;
  primary_owner?: PrimaryOwner | null;
  sso_provider?: SsoProvider | null;
}

/**
 * Share information for a channel
 */
interface ShareInfo {
  accepted_user?: string | null;
  is_active: boolean;
  team: TeamObject;
  user: string;
}

/**
 * Reaction information
 */
interface Reaction {
  count: number;
  name: string;
  users: string[];
  [key: string]: any;
}

/**
 * Bot profile icons
 */
interface BotProfileIcons {
  image_36: string;
  image_48: string;
  image_72: string;
}

/**
 * Bot profile information
 */
interface BotProfile {
  app_id: string;
  deleted: boolean;
  icons: BotProfileIcons;
  id: string;
  name: string;
  team_id: string;
  updated: number;
}

/**
 * User profile information
 */
interface UserProfile {
  avatar_hash: string;
  display_name: string;
  display_name_normalized?: string | null;
  first_name: string;
  image_72: string;
  is_restricted: boolean;
  is_ultra_restricted: boolean;
  name: string;
  real_name: string;
  real_name_normalized?: string | null;
  team: string;
}

/**
 * File comment information
 */
interface FileComment {
  comment: string;
  created: number;
  id: string;
  is_intro: boolean;
  is_starred?: boolean | null;
  num_stars?: number | null;
  pinned_info?: Record<string, any> | null;
  pinned_to?: string[] | null;
  reactions?: Reaction[] | null;
  timestamp: number;
  user: string;
}

/**
 * File shares information
 */
interface FileShares {
  private?: any | null;
  public?: any | null;
}

/**
 * File object information
 */
interface FileObject {
  channels?: string[] | null;
  comments_count?: number | null;
  created?: number | null;
  date_delete?: number | null;
  display_as_bot?: boolean | null;
  editable?: boolean | null;
  editor?: string | null;
  external_id?: string | null;
  external_type?: string | null;
  external_url?: string | null;
  filetype?: string | null;
  groups?: string[] | null;
  has_rich_preview?: boolean | null;
  id?: string | null;
  image_exif_rotation?: number | null;
  ims?: string[] | null;
  is_external?: boolean | null;
  is_public?: boolean | null;
  is_starred?: boolean | null;
  is_tombstoned?: boolean | null;
  last_editor?: string | null;
  mimetype?: string | null;
  mode?: string | null;
  name?: string | null;
  non_owner_editable?: boolean | null;
  num_stars?: number | null;
  original_h?: number | null;
  original_w?: number | null;
  permalink?: string | null;
  permalink_public?: string | null;
  pinned_info?: Record<string, any> | null;
  pinned_to?: string[] | null;
  pretty_type?: string | null;
  preview?: string | null;
  public_url_shared?: boolean | null;
  reactions?: Reaction[] | null;
  shares?: FileShares | null;
  size?: number | null;
  source_team?: string | null;
  state?: string | null;
  thumb_1024?: string | null;
  thumb_1024_h?: number | null;
  thumb_1024_w?: number | null;
  thumb_160?: string | null;
  thumb_360?: string | null;
  thumb_360_h?: number | null;
  thumb_360_w?: number | null;
  thumb_480?: string | null;
  thumb_480_h?: number | null;
  thumb_480_w?: number | null;
  thumb_64?: string | null;
  thumb_720?: string | null;
  thumb_720_h?: number | null;
  thumb_720_w?: number | null;
  thumb_80?: string | null;
  thumb_800?: string | null;
  thumb_800_h?: number | null;
  thumb_800_w?: number | null;
  thumb_960?: string | null;
  thumb_960_h?: number | null;
  thumb_960_w?: number | null;
  thumb_tiny?: string | null;
  timestamp?: number | null;
  title?: string | null;
  updated?: number | null;
  url_private?: string | null;
  url_private_download?: string | null;
  user?: string | null;
  user_team?: string | null;
  username?: string | null;
}

/**
 * Message attachment information
 */
interface MessageAttachment {
  fallback?: string | null;
  id: number;
  image_bytes?: number | null;
  image_height?: number | null;
  image_url?: string | null;
  image_width?: number | null;
}

/**
 * Block Kit block
 */
interface BlockKitBlock {
  type: string;
  [key: string]: any;
}

/**
 * Message icons
 */
interface MessageIcons {
  emoji?: string | null;
  image_64?: string | null;
}

/**
 * Message information
 */
interface MessageInfo {
  attachments?: MessageAttachment[] | null;
  blocks?: BlockKitBlock[] | null;
  bot_id?: Array<string | any> | null;
  bot_profile?: BotProfile | null;
  client_msg_id?: string | null;
  comment?: FileComment | null;
  display_as_bot?: boolean | null;
  file?: FileObject | null;
  files?: FileObject[] | null;
  icons?: MessageIcons | null;
  inviter?: string | null;
  is_delayed_message?: boolean | null;
  is_intro?: boolean | null;
  is_starred?: boolean | null;
  last_read?: string | null;
  latest_reply?: string | null;
  name?: string | null;
  old_name?: string | null;
  parent_user_id?: string | null;
  permalink?: string | null;
  pinned_to?: string[] | null;
  purpose?: string | null;
  reactions?: Reaction[] | null;
  reply_count?: number | null;
  reply_users?: string[] | null;
  reply_users_count?: number | null;
  source_team?: string | null;
  subscribed?: boolean | null;
  subtype?: string | null;
  team?: string | null;
  text: string;
  thread_ts?: string | null;
  topic?: string | null;
  ts: string;
  type: string;
  unread_count?: number | null;
  upload?: boolean | null;
  user?: string | null;
  user_profile?: UserProfile | null;
  user_team?: string | null;
  username?: string | null;
}

/**
 * Channel conversation object containing details about the channel where users were invited.
 */
interface ChannelConversation {
  accepted_user?: string | null;
  connected_team_ids?: string[] | null;
  conversation_host_id?: string | null;
  created: number;
  creator: string;
  display_counts?: DisplayCounts | null;
  enterprise_id?: string | null;
  has_pins?: boolean | null;
  id: string;
  internal_team_ids?: string[] | null;
  is_archived: boolean;
  is_channel: boolean;
  is_ext_shared?: boolean | null;
  is_frozen?: boolean | null;
  is_general: boolean;
  is_global_shared?: boolean | null;
  is_group: boolean;
  is_im: boolean;
  is_member?: boolean | null;
  is_moved?: number | null;
  is_mpim: boolean;
  is_non_threadable?: boolean | null;
  is_open?: boolean | null;
  is_org_default?: boolean | null;
  is_org_mandatory?: boolean | null;
  is_org_shared: boolean;
  is_pending_ext_shared?: boolean | null;
  is_private: boolean;
  is_read_only?: boolean | null;
  is_shared: boolean;
  is_starred?: boolean | null;
  is_thread_only?: boolean | null;
  is_user_deleted?: boolean | null;
  last_read?: string | null;
  latest?: string | Array<MessageInfo | any> | null;
  members?: string[] | null;
  name: string;
  name_normalized: string;
  num_members?: number | null;
  parent_conversation?: Array<string | any> | null;
  pending_connected_team_ids?: string[] | null;
  pending_shared?: string[] | null;
  pin_count?: number | null;
  previous_names?: string[] | null;
  priority?: number | null;
  properties?: Record<string, any> | null;
  purpose?: ChannelPurpose | null;
  shared_team_ids?: string[] | null;
  shares?: ShareInfo[] | null;
  timezone_count?: number | null;
  topic?: ChannelTopic | null;
  unlinked?: number | null;
  unread_count?: number | null;
  unread_count_display?: number | null;
  updated?: number | null;
  use_case?: string | null;
  user?: string | null;
  version?: number | null;
}

/**
 * Per-user invite failure details for multi-user requests
 */
interface ErrorItem {
  error: string;
  ok: boolean;
  user: string;
}

/**
 * Additional response information from Slack
 */
interface ResponseMetadata {
  /**
   * OAuth scopes accepted for this method.
   */
  acceptedScopes?: string[];

  /**
   * Human-readable descriptions of errors or warnings with [WARN] or [ERROR] prefixes.
   */
  messages?: string[];

  /**
   * Cursor for pagination to retrieve the next page of results.
   */
  next_cursor?: string;

  /**
   * Number of seconds to wait before retrying the request.
   */
  retryAfter?: number;

  /**
   * OAuth scopes available.
   */
  scopes?: string[];

  /**
   * Array of warning strings.
   */
  warnings?: string[];
}

/**
 * Data from the action execution
 */
export interface InviteUsersToChannelData {
  /**
   * The conversation object containing details about the channel where users were invited.
   */
  channel?: ChannelConversation;

  /**
   * Error code indicating what went wrong. Only present when ok is false.
   */
  error?: string;

  /**
   * Array containing details about each failed user invitation when multiple users cannot be invited.
   * Only present in error responses.
   */
  errors?: ErrorItem[];

  /**
   * The OAuth scope needed to perform the action. Only present in missing_scope errors.
   */
  needed?: string;

  /**
   * Indicates whether the API call was successful. Always true for successful responses, false for errors.
   */
  ok: boolean;

  /**
   * Comma-separated list of OAuth scopes the token currently has. Only present in missing_scope errors.
   */
  provided?: string;

  /**
   * Additional response information from Slack.
   */
  response_metadata?: ResponseMetadata;

  /**
   * Warning message for deprecations or other non-critical issues.
   */
  warning?: string;

  /**
   * Array of warning strings about the request.
   */
  warnings?: string[];
}

/**
 * Internal response wrapper interface from outputSchema
 */
interface InviteUsersToChannelResponse {
  successful: boolean;
  data?: InviteUsersToChannelData;
  error?: string;
}

/**
 * Invites users to a Slack channel.
 * 
 * This function invites one or more users to a public or private Slack channel.
 * Up to 1000 user IDs can be invited in a single request.
 *
 * @param params - The input parameters for inviting users to a channel
 * @param params.channel - ID of the Slack channel (starts with 'C' for public or 'G' for private/group)
 * @param params.users - Comma-separated string of Slack User IDs to invite
 * @returns Promise resolving to the channel conversation data after inviting users
 * @throws Error if required parameters are missing or if the tool execution fails
 *
 * @example
 * const result = await request({
 *   channel: 'C1234567890',
 *   users: 'U1234567890,U2345678901'
 * });
 */
export async function request(params: InviteUsersToChannelParams): Promise<InviteUsersToChannelData> {
  // Validate required parameters
  if (!params.channel) {
    throw new Error('Missing required parameter: channel');
  }
  
  if (!params.users) {
    throw new Error('Missing required parameter: users');
  }
  
  // CRITICAL: Use MCPToolResponse and parse JSON response
  const mcpResponse = await callMCPTool<MCPToolResponse, InviteUsersToChannelParams>(
    '688338e4ee9e1a9340d83b62',
    'SLACK_INVITE_USERS_TO_A_SLACK_CHANNEL',
    params
  );
  
  if (!mcpResponse.content?.[0]?.text) {
    throw new Error('Invalid MCP response format: missing content[0].text');
  }
  
  let toolData: InviteUsersToChannelResponse;
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