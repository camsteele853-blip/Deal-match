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
 * Input parameters for scheduling a Slack message
 */
export interface ScheduleMessageParams {
  /**
   * JSON array of structured attachments as a URL-encoded string for rich content.
   * Required if `text` and `blocks` are not provided.
   * @example "[{\"color\": \"good\", \"text\": \"Yay! You did it!\", \"fields\": [{\"title\": \"Priority\", \"value\": \"High\", \"short\": false}]}]"
   */
  attachments?: string;

  /**
   * **DEPRECATED**: Use `markdown_text` field instead.
   * JSON array of structured blocks as a URL-encoded string for message layout and design.
   * Required if `text` and `attachments` are not provided.
   * @example "[{\"type\": \"section\", \"text\": {\"type\": \"mrkdwn\", \"text\": \"New Paid Time Off request from <example.com|Fred Enriquez>\"}}]"
   */
  blocks?: string;

  /**
   * Channel, private group, or DM channel ID (e.g., C1234567890) or name (e.g., #general) to send the message to.
   * @example "C1234567890"
   * @example "#general"
   * @example "U1234567890"
   */
  channel?: string;

  /**
   * Pass true to automatically link channel names (e.g., #general) and usernames (e.g., @user).
   */
  link_names?: boolean;

  /**
   * **PREFERRED**: Write your scheduled message in markdown for nicely formatted display.
   * Supports headers (#), bold (**text**), italic (*text*), strikethrough (~~text~~), code (```), links ([text](url)), quotes (>), and dividers (---).
   * Your message will be posted with beautiful formatting.
   * @example "# Scheduled Reminder\n\nDon't forget about the **team meeting** tomorrow at *2 PM*!\n\n```\nZoom: https://zoom.us/meeting-id\n```"
   */
  markdown_text?: string;

  /**
   * Message text treatment: `full` for special formatting, `none` otherwise (default).
   * See Slack's `chat.postMessage` docs for options.
   * @example "none"
   * @example "full"
   */
  parse?: string;

  /**
   * Unix EPOCH timestamp (integer seconds since 1970-01-01 00:00:00 UTC) for the future message send time.
   * @example "1678886400"
   */
  post_at?: string;

  /**
   * With `thread_ts`, makes reply visible to all in channel, not just thread members.
   * Defaults to `false`.
   */
  reply_broadcast?: boolean;

  /**
   * This sends raw text only, use markdown_text field for formatting.
   * Primary text of the message; formatting with `mrkdwn` applies.
   * Required if `blocks` and `attachments` are not provided.
   * @example "Hello, world!"
   */
  text?: string;

  /**
   * Timestamp of the parent message for the scheduled message to be a thread reply.
   * Must be float seconds (e.g., `1234567890.123456`).
   * @example "1405894322.002768"
   */
  thread_ts?: string;

  /**
   * Pass false to disable automatic link unfurling. Defaults to true.
   */
  unfurl_links?: boolean;

  /**
   * Pass false to disable automatic media unfurling. Defaults to true.
   */
  unfurl_media?: boolean;
}

/**
 * Attachment structure for scheduled messages
 */
export interface MessageAttachment {
  /**
   * Fallback text for the attachment.
   */
  fallback?: string | null;

  /**
   * Numeric identifier for the attachment.
   */
  id?: number | null;

  /**
   * The attachment text content.
   */
  text?: string | null;
}

/**
 * The complete message object as parsed by Slack's servers
 */
export interface ScheduledMessage {
  /**
   * Array of message attachments with structured content.
   */
  attachments?: MessageAttachment[] | null;

  /**
   * Array of layout blocks for rich message formatting.
   */
  blocks?: any[] | null;

  /**
   * The bot identifier associated with the scheduled message.
   */
  bot_id?: string | null;

  /**
   * Message subtype, set to 'bot_message' when posted by a bot.
   */
  subtype?: string | null;

  /**
   * The text content of the message.
   */
  text?: string | null;

  /**
   * Message type, set to 'delayed_message' for scheduled messages.
   */
  type?: string | null;

  /**
   * The bot's display username that will post the message.
   */
  username?: string | null;
}

/**
 * Output data from scheduling a Slack message
 */
export interface ScheduleMessageData {
  /**
   * The channel ID where the message is scheduled to be posted.
   */
  channel: string;

  /**
   * Error code returned when ok is false (e.g., 'time_in_past', 'time_too_far', 'channel_not_found').
   */
  error?: string | null;

  /**
   * The complete message object as parsed by Slack's servers, containing the scheduled message details.
   */
  message: ScheduledMessage;

  /**
   * Indicates whether the API call was successful.
   */
  ok: boolean;

  /**
   * Unix timestamp representing the future time the message will be posted to Slack.
   */
  post_at: string;

  /**
   * Unique identifier assigned to the scheduled message, used with chat.deleteScheduledMessage to delete before sending.
   */
  scheduled_message_id: string;
}

/**
 * Internal response wrapper interface from outputSchema
 */
interface ScheduleMessageResponse {
  /**
   * Whether or not the action execution was successful or not
   */
  successful: boolean;

  /**
   * Data from the action execution
   */
  data?: ScheduleMessageData;

  /**
   * Error if any occurred during the execution of the action
   */
  error?: string | null;
}

/**
 * Schedules a message to be sent to a Slack channel at a specified future time.
 * 
 * This function allows you to schedule messages in advance using Unix timestamps.
 * You can use markdown formatting for rich text display, include attachments,
 * or send plain text messages. The scheduled message can be posted to channels,
 * private groups, or direct messages.
 *
 * @param params - The input parameters for scheduling the Slack message
 * @returns Promise resolving to the scheduled message data including the scheduled_message_id
 * @throws Error if the tool execution fails or returns an error
 *
 * @example
 * const result = await request({
 *   channel: '#general',
 *   markdown_text: '# Meeting Reminder\n\nTeam meeting at **2 PM** today!',
 *   post_at: '1678886400'
 * });
 */
export async function request(params: ScheduleMessageParams): Promise<ScheduleMessageData> {
  // Call the MCP tool with proper response type
  const mcpResponse = await callMCPTool<MCPToolResponse, ScheduleMessageParams>(
    '688338e4ee9e1a9340d83b62',
    'SLACK_SCHEDULES_A_MESSAGE_TO_A_CHANNEL_AT_A_SPECIFIED_TIME',
    params
  );

  // Validate MCP response format
  if (!mcpResponse.content?.[0]?.text) {
    throw new Error('Invalid MCP response format: missing content[0].text');
  }

  // Parse the JSON response
  let toolData: ScheduleMessageResponse;
  try {
    toolData = JSON.parse(mcpResponse.content[0].text);
  } catch (parseError) {
    throw new Error(
      `Failed to parse MCP response JSON: ${
        parseError instanceof Error ? parseError.message : 'Unknown error'
      }`
    );
  }

  // Check if the tool execution was successful
  if (!toolData.successful) {
    throw new Error(toolData.error || 'MCP tool execution failed');
  }

  // Validate that data is present
  if (!toolData.data) {
    throw new Error('MCP tool returned successful response but no data');
  }

  return toolData.data;
}