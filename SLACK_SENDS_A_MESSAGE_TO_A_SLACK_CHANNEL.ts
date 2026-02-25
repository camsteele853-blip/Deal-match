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
 * Input parameters for sending a message to a Slack channel
 */
export interface SendSlackMessageParams {
  /**
   * URL-encoded JSON array of message attachments, a legacy method for rich content.
   * See Slack API documentation for structure.
   * @example "%5B%7B%22fallback%22%3A%20%22Required%20plain-text%20summary%20of%20the%20attachment.%22%2C%20%22color%22%3A%20%22%2336a64f%22%7D%5D"
   */
  attachments?: string;

  /**
   * DEPRECATED: Use `markdown_text` field instead.
   * URL-encoded JSON array of layout blocks for rich/interactive messages.
   * See Slack API Block Kit docs for structure.
   * @example "%5B%7B%22type%22%3A%20%22section%22%2C%20%22text%22%3A%20%7B%22type%22%3A%20%22mrkdwn%22%2C%20%22text%22%3A%20%22Hello%2C%20world%21%22%7D%7D%5D"
   */
  blocks?: string;

  /**
   * ID or name of the channel, private group, or IM channel to send the message to.
   * @example "C1234567890" or "general"
   */
  channel: string;

  /**
   * Emoji for bot's icon (e.g., ':robot_face:').
   * Overrides `icon_url`. Applies if `as_user` is `false`.
   * @example ":tada:" or ":slack:"
   */
  icon_emoji?: string;

  /**
   * Image URL for bot's icon (must be HTTPS).
   * Applies if `as_user` is `false`.
   * @example "https://slack.com/img/icons/appDir_2019_01/Tonito64.png"
   */
  icon_url?: string;

  /**
   * Automatically hyperlink channel names (e.g., #channel) and usernames (e.g., @user) in message text.
   * Defaults to `false` for bot messages.
   */
  link_names?: boolean;

  /**
   * PREFERRED: Write your message in markdown for nicely formatted display.
   * Supports: headers (# ## ###), bold (**text** or __text__), italic (*text* or _text_),
   * strikethrough (~~text~~), inline code (`code`), code blocks (```), links ([text](url)),
   * block quotes (>), lists (- item, 1. item), dividers (--- or ***),
   * context blocks (:::context with images), and section buttons (:::section-button).
   * IMPORTANT: Use \n for line breaks (e.g., 'Line 1\nLine 2'), not actual newlines.
   * USER MENTIONS: To tag users, use their user ID with <@USER_ID> format (e.g., <@U1234567890>), not username.
   * @example "# Status Update\n\nSystem is **running smoothly** with *excellent* performance.\n\n```bash\nkubectl get pods\n```\n\n> All services operational ✅"
   */
  markdown_text?: string;

  /**
   * Disable Slack's markdown for `text` field if `false`.
   * Default `true` (allows *bold*, _italic_, etc.).
   */
  mrkdwn?: boolean;

  /**
   * Message text parsing behavior.
   * Default `none` (no special parsing). `full` parses as user-typed (links @mentions, #channels).
   * See Slack API docs for details.
   * @example "none" or "full"
   */
  parse?: string;

  /**
   * If `true` for a threaded reply, also posts to main channel.
   * Defaults to `false`.
   */
  reply_broadcast?: boolean;

  /**
   * DEPRECATED: This sends raw text only, use markdown_text field.
   * Primary textual content. Recommended fallback if using `blocks` or `attachments`.
   * Supports mrkdwn unless `mrkdwn` is `false`.
   * @example "Hello from your friendly bot!" or "Reminder: Team meeting at 3 PM today."
   */
  text?: string;

  /**
   * Timestamp (`ts`) of an existing message to make this a threaded reply.
   * Use `ts` of the parent message, not another reply.
   * @example "1618033790.001500"
   */
  thread_ts?: string;

  /**
   * Enable unfurling of text-based URLs.
   * Defaults `false` for bots, `true` if `as_user` is `true`.
   */
  unfurl_links?: boolean;

  /**
   * Disable unfurling of media content from URLs if `false`.
   * Defaults to `true`.
   */
  unfurl_media?: boolean;

  /**
   * Bot's name in Slack (max 80 chars).
   * Applies if `as_user` is `false`.
   * @example "MyBot" or "AlertBot"
   */
  username?: string;
}

/**
 * Text object structure used in interactive actions
 */
interface TextObject {
  /** Whether emoji is enabled */
  emoji?: boolean | null;
  /** Text content */
  text: string;
  /** Type of text object */
  type: string;
}

/**
 * Interactive element action payload
 */
interface InteractiveAction {
  /** Action identifier */
  action_id: string;
  /** Action timestamp */
  action_ts?: string | null;
  /** Block identifier */
  block_id?: string | null;
  /** Text object */
  text?: TextObject | null;
  /** Action type */
  type: string;
  /** Action value */
  value?: string | null;
}

/**
 * Block Kit layout block
 */
interface Block {
  /** Block type */
  type: string;
  [key: string]: any;
}

/**
 * Attachment object for legacy rich content
 */
interface Attachment {
  /** Fallback text */
  fallback?: string | null;
  /** Attachment ID */
  id?: number | null;
  /** Attachment text */
  text?: string | null;
}

/**
 * Bot profile information
 */
interface BotProfile {
  /** App ID */
  app_id: string;
  /** Whether bot is deleted */
  deleted: boolean;
  /** Bot icons */
  icons: {
    image_36: string;
    image_48: string;
    image_72: string;
  };
  /** Bot ID */
  id: string;
  /** Bot name */
  name: string;
  /** Team ID */
  team_id: string;
  /** Last updated timestamp */
  updated: number;
}

/**
 * Reaction to a message
 */
interface Reaction {
  /** Number of reactions */
  count: number;
  /** Reaction name (emoji) */
  name: string;
  /** User IDs who reacted */
  users: string[];
}

/**
 * File comment details
 */
interface Comment {
  /** Comment text */
  comment: string;
  /** Creation timestamp */
  created: number;
  /** Comment ID */
  id: string;
  /** Whether this is an intro comment */
  is_intro: boolean;
  /** Whether comment is starred */
  is_starred?: boolean | null;
  /** Number of stars */
  num_stars?: number | null;
  /** Pinned info */
  pinned_info?: Record<string, any> | null;
  /** Channels pinned to */
  pinned_to?: string[] | null;
  /** Reactions to comment */
  reactions?: Reaction[] | null;
  /** Comment timestamp */
  timestamp: number;
  /** User ID */
  user: string;
}

/**
 * File shares information
 */
interface Shares {
  /** Private shares */
  private?: any | null;
  /** Public shares */
  public?: any | null;
}

/**
 * File object details
 */
interface File {
  /** Channels file is shared in */
  channels?: string[] | null;
  /** Number of comments */
  comments_count?: number | null;
  /** Creation timestamp */
  created?: number | null;
  /** Deletion date */
  date_delete?: number | null;
  /** Display as bot */
  display_as_bot?: boolean | null;
  /** Whether file is editable */
  editable?: boolean | null;
  /** Editor user ID */
  editor?: string | null;
  /** External ID */
  external_id?: string | null;
  /** External type */
  external_type?: string | null;
  /** External URL */
  external_url?: string | null;
  /** File type */
  filetype?: string | null;
  /** Groups file is shared in */
  groups?: string[] | null;
  /** Has rich preview */
  has_rich_preview?: boolean | null;
  /** File ID */
  id?: string | null;
  /** Image EXIF rotation */
  image_exif_rotation?: number | null;
  /** IMs file is shared in */
  ims?: string[] | null;
  /** Is external file */
  is_external?: boolean | null;
  /** Is public file */
  is_public?: boolean | null;
  /** Is starred */
  is_starred?: boolean | null;
  /** Is tombstoned */
  is_tombstoned?: boolean | null;
  /** Last editor user ID */
  last_editor?: string | null;
  /** MIME type */
  mimetype?: string | null;
  /** File mode */
  mode?: string | null;
  /** File name */
  name?: string | null;
  /** Non-owner editable */
  non_owner_editable?: boolean | null;
  /** Number of stars */
  num_stars?: number | null;
  /** Original height */
  original_h?: number | null;
  /** Original width */
  original_w?: number | null;
  /** Permalink */
  permalink?: string | null;
  /** Public permalink */
  permalink_public?: string | null;
  /** Pinned info */
  pinned_info?: Record<string, any> | null;
  /** Channels pinned to */
  pinned_to?: string[] | null;
  /** Pretty type name */
  pretty_type?: string | null;
  /** File preview */
  preview?: string | null;
  /** Public URL shared */
  public_url_shared?: boolean | null;
  /** Reactions to file */
  reactions?: Reaction[] | null;
  /** Share information */
  shares?: Shares | null;
  /** File size */
  size?: number | null;
  /** Source team */
  source_team?: string | null;
  /** File state */
  state?: string | null;
  /** Thumbnail 1024px */
  thumb_1024?: string | null;
  /** Thumbnail 1024px height */
  thumb_1024_h?: number | null;
  /** Thumbnail 1024px width */
  thumb_1024_w?: number | null;
  /** Thumbnail 160px */
  thumb_160?: string | null;
  /** Thumbnail 360px */
  thumb_360?: string | null;
  /** Thumbnail 360px height */
  thumb_360_h?: number | null;
  /** Thumbnail 360px width */
  thumb_360_w?: number | null;
  /** Thumbnail 480px */
  thumb_480?: string | null;
  /** Thumbnail 480px height */
  thumb_480_h?: number | null;
  /** Thumbnail 480px width */
  thumb_480_w?: number | null;
  /** Thumbnail 64px */
  thumb_64?: string | null;
  /** Thumbnail 720px */
  thumb_720?: string | null;
  /** Thumbnail 720px height */
  thumb_720_h?: number | null;
  /** Thumbnail 720px width */
  thumb_720_w?: number | null;
  /** Thumbnail 80px */
  thumb_80?: string | null;
  /** Thumbnail 800px */
  thumb_800?: string | null;
  /** Thumbnail 800px height */
  thumb_800_h?: number | null;
  /** Thumbnail 800px width */
  thumb_800_w?: number | null;
  /** Thumbnail 960px */
  thumb_960?: string | null;
  /** Thumbnail 960px height */
  thumb_960_h?: number | null;
  /** Thumbnail 960px width */
  thumb_960_w?: number | null;
  /** Tiny thumbnail */
  thumb_tiny?: string | null;
  /** File timestamp */
  timestamp?: number | null;
  /** File title */
  title?: string | null;
  /** Last updated timestamp */
  updated?: number | null;
  /** Private URL */
  url_private?: string | null;
  /** Private download URL */
  url_private_download?: string | null;
  /** User ID */
  user?: string | null;
  /** User team */
  user_team?: string | null;
  /** Username */
  username?: string | null;
}

/**
 * Message icons
 */
interface Icons {
  /** Emoji icon */
  emoji?: string | null;
  /** Image icon 64px */
  image_64?: string | null;
}

/**
 * Message metadata
 */
interface MessageMetadata {
  /** Event payload */
  event_payload?: Record<string, any> | null;
  /** Event type */
  event_type: string;
}

/**
 * User profile information
 */
interface UserProfile {
  /** Avatar hash */
  avatar_hash: string;
  /** Display name */
  display_name: string;
  /** Normalized display name */
  display_name_normalized?: string | null;
  /** First name */
  first_name: string;
  /** Profile image 72px */
  image_72: string;
  /** Is restricted user */
  is_restricted: boolean;
  /** Is ultra restricted user */
  is_ultra_restricted: boolean;
  /** Username */
  name: string;
  /** Real name */
  real_name: string;
  /** Normalized real name */
  real_name_normalized?: string | null;
  /** Team ID */
  team: string;
}

/**
 * Complete message object as stored by Slack
 */
interface Message {
  /** App ID */
  app_id?: string | null;
  /** Message attachments */
  attachments?: Attachment[] | null;
  /** Block Kit blocks */
  blocks?: Block[] | null;
  /** Bot ID */
  bot_id?: string | null;
  /** Bot profile */
  bot_profile?: BotProfile | null;
  /** Client message ID */
  client_msg_id?: string | null;
  /** File comment */
  comment?: Comment | null;
  /** Display as bot */
  display_as_bot?: boolean | null;
  /** Single file */
  file?: File | null;
  /** Multiple files */
  files?: File[] | null;
  /** Message icons */
  icons?: Icons | null;
  /** Inviter user ID */
  inviter?: string | null;
  /** Is delayed message */
  is_delayed_message?: boolean | null;
  /** Is intro message */
  is_intro?: boolean | null;
  /** Is starred */
  is_starred?: boolean | null;
  /** Last read timestamp */
  last_read?: string | null;
  /** Latest reply timestamp */
  latest_reply?: string | null;
  /** Message metadata */
  metadata?: MessageMetadata | null;
  /** Entity name */
  name?: string | null;
  /** Old channel name */
  old_name?: string | null;
  /** Parent user ID */
  parent_user_id?: string | null;
  /** Permalink */
  permalink?: string | null;
  /** Channels pinned to */
  pinned_to?: string[] | null;
  /** Channel purpose */
  purpose?: string | null;
  /** Reactions */
  reactions?: Reaction[] | null;
  /** Reply count */
  reply_count?: number | null;
  /** Reply users */
  reply_users?: string[] | null;
  /** Reply users count */
  reply_users_count?: number | null;
  /** Source team */
  source_team?: string | null;
  /** Subscribed to thread */
  subscribed?: boolean | null;
  /** Message subtype */
  subtype?: string | null;
  /** Team ID */
  team?: string | null;
  /** Message text */
  text?: string | null;
  /** Thread timestamp */
  thread_ts?: string | null;
  /** Channel topic */
  topic?: string | null;
  /** Message timestamp */
  ts: string;
  /** Message type */
  type: string;
  /** Unread count */
  unread_count?: number | null;
  /** Is upload */
  upload?: boolean | null;
  /** User ID */
  user?: string | null;
  /** User profile */
  user_profile?: UserProfile | null;
  /** User team */
  user_team?: string | null;
  /** Username */
  username?: string | null;
}

/**
 * Response metadata
 */
interface ResponseMetadata {
  /** Human-readable messages */
  messages?: string[] | null;
  /** Warning codes */
  warnings?: string[] | null;
}

/**
 * Message context for Slack Functions
 */
interface MessageContext {
  /** Channel ID */
  channel_id?: string | null;
  /** Message timestamp */
  message_ts: string;
}

/**
 * Output data from sending a Slack message
 */
export interface SendSlackMessageData {
  /** Interactive action payload */
  action?: InteractiveAction | null;
  /** Channel ID where message was posted */
  channel?: string | null;
  /** Deprecated argument name */
  deprecated_argument?: string | null;
  /** Error code if request failed */
  error?: string | null;
  /** Array of error strings */
  errors?: string[] | null;
  /** Interactivity context */
  interactivity?: Record<string, any> | null;
  /** Complete message object */
  message?: Message | null;
  /** Message context (Slack Functions) */
  message_context?: MessageContext | null;
  /** Permalink URL (Slack Functions) */
  message_link?: string | null;
  /** Message timestamp (Slack Functions) */
  message_ts?: string | null;
  /** Required OAuth scope */
  needed?: string | null;
  /** Whether request was successful */
  ok: boolean;
  /** Provided OAuth scopes */
  provided?: string | null;
  /** Response metadata */
  response_metadata?: ResponseMetadata | null;
  /** Message timestamp ID */
  ts?: string | null;
  /** Top-level warning */
  warning?: string | null;
  /** Warning codes */
  warnings?: string[] | null;
}

/**
 * Internal response wrapper from MCP tool
 */
interface SendSlackMessageResponse {
  /** Whether execution was successful */
  successful: boolean;
  /** Response data */
  data?: SendSlackMessageData;
  /** Error message if execution failed */
  error?: string;
}

/**
 * Sends a message to a Slack channel using the Slack API.
 * 
 * This function supports various message formatting options including markdown text,
 * attachments, blocks, threading, and bot customization. The preferred method is to
 * use the `markdown_text` parameter for rich formatting.
 *
 * @param params - The input parameters for sending the Slack message
 * @returns Promise resolving to the message data including channel ID, timestamp, and full message object
 * @throws Error if the required `channel` parameter is missing
 * @throws Error if the MCP response format is invalid
 * @throws Error if JSON parsing fails
 * @throws Error if the tool execution fails
 *
 * @example
 * const result = await request({
 *   channel: 'C1234567890',
 *   markdown_text: '# Hello World\n\nThis is a **bold** message with *italic* text.'
 * });
 */
export async function request(params: SendSlackMessageParams): Promise<SendSlackMessageData> {
  // Validate required parameters
  if (!params.channel) {
    throw new Error('Missing required parameter: channel');
  }

  // Call MCP tool with proper response type
  const mcpResponse = await callMCPTool<MCPToolResponse, SendSlackMessageParams>(
    '688338e4ee9e1a9340d83b62',
    'SLACK_SENDS_A_MESSAGE_TO_A_SLACK_CHANNEL',
    params
  );

  // Validate MCP response structure
  if (!mcpResponse.content?.[0]?.text) {
    throw new Error('Invalid MCP response format: missing content[0].text');
  }

  // Parse JSON response
  let toolData: SendSlackMessageResponse;
  try {
    toolData = JSON.parse(mcpResponse.content[0].text);
  } catch (parseError) {
    throw new Error(
      `Failed to parse MCP response JSON: ${
        parseError instanceof Error ? parseError.message : 'Unknown error'
      }`
    );
  }

  // Check execution success
  if (!toolData.successful) {
    throw new Error(toolData.error || 'MCP tool execution failed');
  }

  // Validate data presence
  if (!toolData.data) {
    throw new Error('MCP tool returned successful response but no data');
  }

  return toolData.data;
}