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
 * Input parameters for removing a reaction from a Slack item
 */
export interface RemoveReactionParams {
  /**
   * Channel ID of the message. Required if `timestamp` is provided.
   */
  channel?: string;

  /**
   * ID of the file to remove the reaction from.
   */
  file?: string;

  /**
   * ID of the file comment to remove the reaction from.
   */
  file_comment?: string;

  /**
   * Name of the emoji reaction to remove (e.g., 'thumbsup'), without colons.
   * @example "thumbsup"
   * @example "smile"
   * @example "robot_face"
   */
  name: string;

  /**
   * Timestamp of the message. Required if `channel` is provided.
   */
  timestamp?: string;
}

/**
 * Response metadata providing additional context about the response
 */
export interface ResponseMetadata {
  /**
   * Optional list of human-readable messages providing more detail about warnings or validation errors.
   */
  messages?: string[];

  /**
   * Optional list of warning codes/messages duplicated within response metadata. Examples observed: missing_charset.
   */
  warnings?: string[];
}

/**
 * Output data returned after removing a reaction from a Slack item
 */
export interface RemoveReactionData {
  /**
   * Only present when ok is false. Machine-readable error code describing why the request failed. 
   * Common values for reactions.remove include: bad_timestamp, channel_not_found, external_channel_migrating, 
   * file_not_found, file_comment_not_found, invalid_name, message_not_found, no_item_specified, no_reaction, 
   * not_authed, invalid_auth, account_inactive, token_revoked, missing_scope, accesslimited, internal_error, 
   * service_unavailable, and other standard Web API errors. Observed in real responses: no_reaction, message_not_found.
   */
  error?: string;

  /**
   * Only present in some error responses (for example, when error is missing_scope). 
   * The OAuth scopes required to access the requested resource.
   */
  needed?: string;

  /**
   * Indicates whether the request succeeded. true on success, false on failure.
   */
  ok: boolean;

  /**
   * Only present in some error responses (for example, when error is missing_scope). 
   * The OAuth scopes granted to the token used in the request.
   */
  provided?: string;

  /**
   * Optional metadata providing additional context about the response, warnings, or validation messages.
   */
  response_metadata?: ResponseMetadata;

  /**
   * Optional top-level warning message observed in real responses (for example, missing_charset). 
   * When present, additional details may also appear in response_metadata.warnings.
   */
  warning?: string;

  /**
   * Optional list of warning codes related to the request.
   */
  warnings?: string[];
}

/**
 * Internal response wrapper interface from outputSchema
 */
interface RemoveReactionResponse {
  /**
   * Whether or not the action execution was successful or not
   */
  successful: boolean;

  /**
   * Data from the action execution
   */
  data?: RemoveReactionData;

  /**
   * Error if any occurred during the execution of the action
   */
  error?: string;
}

/**
 * Removes an emoji reaction from a Slack message, file, or file comment.
 * 
 * This function allows you to remove a previously added reaction (emoji) from various Slack items.
 * You must specify the reaction name and at least one target item (message via channel+timestamp, file, or file_comment).
 *
 * @param params - The input parameters for removing the reaction
 * @returns Promise resolving to the reaction removal result data
 * @throws Error if required parameters are missing or if the tool execution fails
 *
 * @example
 * // Remove a reaction from a message
 * const result = await request({
 *   name: 'thumbsup',
 *   channel: 'C1234567890',
 *   timestamp: '1234567890.123456'
 * });
 *
 * @example
 * // Remove a reaction from a file
 * const result = await request({
 *   name: 'smile',
 *   file: 'F1234567890'
 * });
 */
export async function request(params: RemoveReactionParams): Promise<RemoveReactionData> {
  // Validate required parameters
  if (!params.name) {
    throw new Error('Missing required parameter: name');
  }

  // Validate conditional requirements
  if (params.channel && !params.timestamp) {
    throw new Error('Parameter "timestamp" is required when "channel" is provided');
  }

  if (params.timestamp && !params.channel) {
    throw new Error('Parameter "channel" is required when "timestamp" is provided');
  }

  // CRITICAL: Use MCPToolResponse and parse JSON response
  const mcpResponse = await callMCPTool<MCPToolResponse, RemoveReactionParams>(
    '688338e4ee9e1a9340d83b62',
    'SLACK_REMOVE_REACTION_FROM_ITEM',
    params
  );

  if (!mcpResponse.content?.[0]?.text) {
    throw new Error('Invalid MCP response format: missing content[0].text');
  }

  let toolData: RemoveReactionResponse;
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