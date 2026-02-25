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
 * Input parameters for adding a reaction to a Slack message
 */
export interface AddReactionParams {
  /**
   * ID of the channel where the message to add the reaction to was posted.
   * @example "C1234567890"
   * @example "G0987654321"
   */
  channel: string;

  /**
   * Name of the emoji to add as a reaction (e.g., 'thumbsup'). This is the emoji name without colons.
   * For emojis with skin tone modifiers, append '::skin-tone-X' where X is a number from 2 to 6 (e.g., 'wave::skin-tone-3').
   * @example "thumbsup"
   * @example "grinning"
   * @example "robot_face"
   * @example "wave::skin-tone-3"
   */
  name: string;

  /**
   * Timestamp of the message to which the reaction will be added.
   * This is a unique identifier for the message, typically a string representing a float value like '1234567890.123456'.
   * @example "1234567890.123456"
   * @example "1609459200.000200"
   */
  timestamp: string;
}

/**
 * Response data from adding a reaction to a Slack message
 */
export interface AddReactionData {
  /**
   * Error code identifier if the call failed. Present only when ok is false.
   * Common values include 'already_reacted', 'channel_not_found', 'message_not_found',
   * 'invalid_name', 'no_reaction', 'too_many_emoji', 'too_many_reactions', 'not_reactable', 'thread_locked', etc.
   */
  error?: string;

  /**
   * Required scope(s) if permission is missing. Present in error responses related to missing permissions.
   */
  needed?: string;

  /**
   * Indicates whether the API call was successful.
   */
  ok: boolean;

  /**
   * Scope(s) that were provided with the token. Present in error responses related to missing permissions.
   */
  provided?: string;
}

/**
 * Internal response wrapper interface from outputSchema
 */
interface AddReactionResponse {
  /**
   * Whether or not the action execution was successful or not
   */
  successful: boolean;

  /**
   * Data from the action execution
   */
  data?: AddReactionData;

  /**
   * Error if any occurred during the execution of the action
   */
  error?: string;
}

/**
 * Adds an emoji reaction to a Slack message.
 *
 * This function allows you to add an emoji reaction to a specific message in a Slack channel.
 * You need to provide the channel ID, the emoji name (without colons), and the message timestamp.
 *
 * @param params - The input parameters for adding a reaction
 * @param params.channel - ID of the channel where the message was posted
 * @param params.name - Name of the emoji to add as a reaction (without colons)
 * @param params.timestamp - Timestamp of the message to react to
 * @returns Promise resolving to the reaction addition result data
 * @throws Error if required parameters are missing or if the tool execution fails
 *
 * @example
 * const result = await request({
 *   channel: 'C1234567890',
 *   name: 'thumbsup',
 *   timestamp: '1234567890.123456'
 * });
 */
export async function request(params: AddReactionParams): Promise<AddReactionData> {
  // Validate required parameters
  if (!params.channel) {
    throw new Error('Missing required parameter: channel');
  }
  if (!params.name) {
    throw new Error('Missing required parameter: name');
  }
  if (!params.timestamp) {
    throw new Error('Missing required parameter: timestamp');
  }

  // CRITICAL: Use MCPToolResponse and parse JSON response
  const mcpResponse = await callMCPTool<MCPToolResponse, AddReactionParams>(
    '688338e4ee9e1a9340d83b62',
    'SLACK_ADD_REACTION_TO_AN_ITEM',
    params
  );

  if (!mcpResponse.content?.[0]?.text) {
    throw new Error('Invalid MCP response format: missing content[0].text');
  }

  let toolData: AddReactionResponse;
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