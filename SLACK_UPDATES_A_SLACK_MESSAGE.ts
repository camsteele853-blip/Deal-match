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
 * Input parameters for updating a Slack message
 */
export interface UpdateSlackMessageParams {
  /**
   * This is Slack's legacy 'secondary attachments' field for adding rich formatting elements like colored sidebars, structured fields, and author info. Pass as a JSON string array. Replaces existing attachments if provided; use `[]` to clear. NOT for file/image uploads. To send files or images, use 'SLACK_UPLOAD_OR_CREATE_A_FILE_IN_SLACK' instead.
   * @example "[{\"fallback\": \"Summary text\", \"color\": \"#36a64f\", \"title\": \"Title\", \"text\": \"Content\", \"fields\": [{\"title\": \"Field\", \"value\": \"Value\", \"short\": true}]}]"
   * @example "[]"
   */
  attachments?: string;

  /**
   * **DEPRECATED**: Use `markdown_text` field instead. URL-encoded JSON array of layout blocks. Replaces existing blocks if field is provided; use `[]` (empty array string) to clear. Omit field to leave blocks untouched. Required if `text` and `attachments` are absent. See Slack API for format.
   * @example "[{\"type\": \"section\", \"text\": {\"type\": \"mrkdwn\", \"text\": \"This is an updated section block.\"}}]"
   * @example "[]"
   */
  blocks?: string;

  /**
   * The ID of the channel containing the message to be updated.
   * @example "C1234567890"
   * @example "G0abcdefh"
   */
  channel: string;

  /**
   * Set to `'true'` to link channel/user names in `text`. If not provided, Slack's default update behavior may override original message's linking settings.
   * @example "true"
   */
  link_names?: string;

  /**
   * **PREFERRED**: Write your updated message in markdown for nicely formatted display. Supports headers (#), bold (**text**), italic (*text*), strikethrough (~~text~~), code (```), links ([text](url)), quotes (>), and dividers (---). Your message will be posted with beautiful formatting.
   * @example "# Updated Status\n\nThe issue has been **resolved** and systems are *fully operational*.\n\n```bash\n# All services running\nkubectl get services\n```"
   * @example "## Progress Update\n\n- **Phase 1**: ✅ Complete\n- *Phase 2*: In progress (80%)\n- ~~Phase 3~~: **Started early**\n\n---\n\n**ETA**: Tomorrow"
   */
  markdown_text?: string;

  /**
   * Parse mode for `text`: `'full'` (mrkdwn) or `'none'` (literal). If not provided, defaults to `'client'` behavior, overriding original message's `parse` setting.
   * @example "full"
   * @example "none"
   * @example "client"
   */
  parse?: string;

  /**
   * This sends raw text only, use markdown_text field for formatting. New message text (plain or mrkdwn). Not required if `blocks` or `attachments` are provided. See Slack formatting rules.
   * @example "Hello world, this is an *updated* message."
   * @example "Check out this link: <https://example.com>"
   */
  text?: string;

  /**
   * Timestamp of the message to update (string, Unix time with microseconds, e.g., `'1234567890.123456'`).
   * @example "1625247600.000200"
   */
  ts: string;
}

/**
 * Information about when and by whom a message was edited
 */
export interface SlackEdited {
  /**
   * Timestamp of when the edit occurred.
   */
  ts?: string;

  /**
   * User ID of the editor.
   */
  user?: string;
}

/**
 * Message metadata containing event type and payload
 */
export interface SlackMessageMetadata {
  /**
   * Type of the metadata event.
   */
  event_type: string;

  /**
   * Custom payload data for the metadata event.
   */
  event_payload: Record<string, any>;
}

/**
 * Complete Slack message details
 */
export interface SlackMessage {
  /**
   * Array of legacy message attachments.
   */
  attachments?: any[];

  /**
   * Array of Block Kit blocks that define the message layout and interactivity.
   */
  blocks?: any[];

  /**
   * Bot ID if the message was posted by a bot.
   */
  bot_id?: string;

  /**
   * Information about when and by whom the message was edited.
   */
  edited?: SlackEdited;

  /**
   * Message metadata containing event type and payload.
   */
  metadata?: SlackMessageMetadata;

  /**
   * The text content of the message.
   */
  text?: string;

  /**
   * Thread timestamp that identifies the thread this message belongs to, if applicable.
   */
  thread_ts?: string;

  /**
   * Timestamp of the message.
   */
  ts?: string;

  /**
   * Message type, typically 'message'.
   */
  type?: string;

  /**
   * User ID of the message author.
   */
  user?: string;
}

/**
 * Metadata included in Slack API responses for warnings and deprecations
 */
export interface SlackResponseMetadata {
  /**
   * List of messages from the API response.
   */
  messages?: string[];

  /**
   * List of warning messages about deprecated features or parameters.
   */
  warnings?: string[];
}

/**
 * Output data from updating a Slack message
 */
export interface UpdateSlackMessageData {
  /**
   * Indicates whether the API call was successful.
   */
  ok: boolean;

  /**
   * Channel identifier where the message was updated. Present when ok is true.
   */
  channel?: string;

  /**
   * Error code if the request failed (only present when ok is false).
   */
  error?: string;

  /**
   * Object containing the complete updated message details.
   */
  message?: SlackMessage;

  /**
   * Metadata included in Slack API responses for warnings and deprecations.
   */
  response_metadata?: SlackResponseMetadata;

  /**
   * The updated text content of the message. Present when ok is true.
   */
  text?: string;

  /**
   * Timestamp of the updated message, serving as a unique identifier for the message. Present when ok is true.
   */
  ts?: string;

  /**
   * Warning message about deprecated features or issues with the request.
   */
  warning?: string;
}

/**
 * Internal response wrapper interface from outputSchema
 */
interface UpdateSlackMessageResponse {
  /**
   * Whether or not the action execution was successful or not
   */
  successful: boolean;

  /**
   * Data from the action execution
   */
  data: UpdateSlackMessageData;

  /**
   * Error if any occurred during the execution of the action
   */
  error?: string;
}

/**
 * Updates an existing Slack message in a channel or thread.
 * 
 * This tool allows you to modify the content of a previously sent message using its timestamp.
 * You can update the text, markdown formatting, blocks, or attachments. Use the `markdown_text`
 * parameter for rich formatting with headers, bold, italic, code blocks, and more.
 *
 * @param params - The input parameters for updating the Slack message
 * @returns Promise resolving to the updated message data including channel, timestamp, and message details
 * @throws Error if required parameters (channel, ts) are missing or if the tool execution fails
 *
 * @example
 * const result = await request({
 *   channel: 'C1234567890',
 *   ts: '1625247600.000200',
 *   markdown_text: '# Updated Status\n\nThe issue has been **resolved**.'
 * });
 */
export async function request(params: UpdateSlackMessageParams): Promise<UpdateSlackMessageData> {
  // Validate required parameters
  if (!params.channel) {
    throw new Error('Missing required parameter: channel');
  }
  
  if (!params.ts) {
    throw new Error('Missing required parameter: ts');
  }
  
  // CRITICAL: Use MCPToolResponse and parse JSON response
  const mcpResponse = await callMCPTool<MCPToolResponse, UpdateSlackMessageParams>(
    '688338e4ee9e1a9340d83b62',
    'SLACK_UPDATES_A_SLACK_MESSAGE',
    params
  );
  
  if (!mcpResponse.content?.[0]?.text) {
    throw new Error('Invalid MCP response format: missing content[0].text');
  }
  
  let toolData: UpdateSlackMessageResponse;
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