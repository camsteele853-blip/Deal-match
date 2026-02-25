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
 * Recurrence settings for a reminder.
 */
export interface ReminderRecurrence {
  /**
   * The frequency of the reminder. Available options: daily, weekly, monthly, or yearly.
   * @example "daily"
   * @example "weekly"
   * @example "monthly"
   * @example "yearly"
   */
  frequency: string;
  
  /**
   * If frequency is 'weekly', specifies the days of the week for the reminder.
   * @example ["monday", "wednesday", "friday"]
   */
  weekdays?: string[];
}

/**
 * Input parameters for creating a new reminder in Slack.
 */
export interface CreateReminderParams {
  /**
   * Recurrence settings for a reminder.
   * @example { "frequency": "weekly", "weekdays": ["monday", "wednesday", "friday"] }
   */
  recurrence?: ReminderRecurrence;
  
  /**
   * Encoded team id. Required if using an org-level token to specify which workspace the reminder should be created in.
   * @example "T1234567890"
   */
  team_id?: string;
  
  /**
   * The textual content of the reminder message.
   * @example "Submit weekly report"
   * @example "Follow up with Jane Doe"
   */
  text: string;
  
  /**
   * Specifies when the reminder should occur. This can be a Unix timestamp (integer, up to five years from now), 
   * the number of seconds until the reminder (integer, if within 24 hours, e.g., '300' for 5 minutes), 
   * or a natural language description (string, e.g., "in 15 minutes," or "every Thursday at 2pm", "daily").
   * @example "1735689600"
   * @example "900"
   * @example "in 20 minutes"
   * @example "every Monday at 10am"
   */
  time: string;
  
  /**
   * The ID of the user who will receive the reminder (e.g., 'U012AB3CD4E'). 
   * If not specified, the reminder will be sent to the user who created it. 
   * NOTE: Setting reminders for other users is no longer supported for user tokens - only bot tokens can set reminders for other users.
   * @example "U012AB3CD4E"
   * @example "W1234567890"
   */
  user?: string;
}

/**
 * Slack Reminder object as returned by reminders.add.
 */
export interface SlackReminder {
  /**
   * Unix timestamp indicating when the reminder was marked as complete (0 if not completed). 
   * Only present for non-recurring reminders.
   */
  complete_ts?: number;
  
  /**
   * User ID of the user who created the reminder.
   */
  creator: string;
  
  /**
   * Unique identifier for the reminder (e.g., 'Rm12345678').
   */
  id: string;
  
  /**
   * Whether the reminder recurs (false for one-time reminders).
   */
  recurring: boolean;
  
  /**
   * The content or description of the reminder.
   */
  text: string;
  
  /**
   * Unix timestamp for when the reminder will trigger. Only present for non-recurring reminders.
   */
  time?: number;
  
  /**
   * User ID of the user who will receive the reminder.
   */
  user: string;
}

/**
 * Output data from creating a reminder in Slack.
 */
export interface CreateReminderData {
  /**
   * Error code when ok is false. Possible values include: 'cannot_add_bot' (reminders cannot target bots), 
   * 'cannot_add_others' (guests cannot set reminders for team members), 'cannot_parse' (timing phrasing is unclear), 
   * 'missing_scope' (token lacks required permissions), 'not_authed' (no authentication token provided), 
   * 'user_not_found' (specified user cannot be located), 'invalid_auth' (invalid authentication), among others.
   */
  error?: string;
  
  /**
   * Indicates whether the API call was successful.
   */
  ok: boolean;
  
  /**
   * Slack Reminder object as returned by reminders.add.
   */
  reminder?: SlackReminder;
}

/**
 * Internal response wrapper interface from outputSchema
 */
interface CreateReminderResponse {
  /**
   * Whether or not the action execution was successful or not
   */
  successful: boolean;
  
  /**
   * Data from the action execution
   */
  data?: CreateReminderData;
  
  /**
   * Error if any occurred during the execution of the action
   */
  error?: string;
}

/**
 * Creates a new reminder in Slack.
 * 
 * This function allows you to create reminders for yourself or other users (bot tokens only).
 * Reminders can be one-time or recurring, and can be specified using Unix timestamps,
 * relative time (e.g., "in 20 minutes"), or natural language descriptions.
 *
 * @param params - The input parameters for creating a reminder
 * @param params.text - The textual content of the reminder message (required)
 * @param params.time - When the reminder should occur (required) - Unix timestamp, seconds until reminder, or natural language
 * @param params.user - The ID of the user who will receive the reminder (optional)
 * @param params.team_id - Encoded team id for org-level tokens (optional)
 * @param params.recurrence - Recurrence settings for the reminder (optional)
 * @returns Promise resolving to the created reminder data
 * @throws Error if required parameters are missing or if the tool execution fails
 *
 * @example
 * const result = await request({ 
 *   text: 'Submit weekly report', 
 *   time: 'every Monday at 10am' 
 * });
 */
export async function request(params: CreateReminderParams): Promise<CreateReminderData> {
  // Validate required parameters
  if (!params.text) {
    throw new Error('Missing required parameter: text');
  }
  
  if (!params.time) {
    throw new Error('Missing required parameter: time');
  }
  
  // Validate recurrence object if provided
  if (params.recurrence && !params.recurrence.frequency) {
    throw new Error('Missing required property in recurrence: frequency');
  }
  
  // CRITICAL: Use MCPToolResponse and parse JSON response
  const mcpResponse = await callMCPTool<MCPToolResponse, CreateReminderParams>(
    '688338e4ee9e1a9340d83b62',
    'SLACK_CREATE_A_REMINDER',
    params
  );
  
  if (!mcpResponse.content?.[0]?.text) {
    throw new Error('Invalid MCP response format: missing content[0].text');
  }
  
  let toolData: CreateReminderResponse;
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