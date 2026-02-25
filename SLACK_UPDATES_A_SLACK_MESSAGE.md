# Slack Update Message Module

Updates an existing Slack message in a channel or thread using the Slack MCP tool.

## Installation/Import

```typescript
import { request as updateSlackMessage } from '@/sdk/mcp-clients/688338e4ee9e1a9340d83b62/SLACK_UPDATES_A_SLACK_MESSAGE';
```

## Function Signature

```typescript
async function request(params: UpdateSlackMessageParams): Promise<UpdateSlackMessageData>
```

## Parameters

### UpdateSlackMessageParams

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `channel` | `string` | ✅ Yes | The ID of the channel containing the message to be updated (e.g., "C1234567890") |
| `ts` | `string` | ✅ Yes | Timestamp of the message to update (Unix time with microseconds, e.g., "1625247600.000200") |
| `markdown_text` | `string` | No | **PREFERRED**: Write your updated message in markdown for nicely formatted display. Supports headers (#), bold (**text**), italic (*text*), strikethrough (~~text~~), code (```), links, quotes (>), and dividers (---) |
| `text` | `string` | No | Raw text only (plain or mrkdwn). Use `markdown_text` for formatting. Not required if `blocks` or `attachments` are provided |
| `blocks` | `string` | No | **DEPRECATED**: Use `markdown_text` instead. URL-encoded JSON array of layout blocks |
| `attachments` | `string` | No | Legacy 'secondary attachments' field for rich formatting elements. Pass as JSON string array. Use `[]` to clear |
| `link_names` | `string` | No | Set to `'true'` to link channel/user names in text |
| `parse` | `string` | No | Parse mode for text: `'full'` (mrkdwn), `'none'` (literal), or `'client'` |

## Return Value

### UpdateSlackMessageData

```typescript
{
  ok: boolean;              // Indicates whether the API call was successful
  channel?: string;         // Channel identifier where the message was updated
  ts?: string;              // Timestamp of the updated message
  text?: string;            // The updated text content of the message
  message?: SlackMessage;   // Complete updated message details
  error?: string;           // Error code if the request failed
  warning?: string;         // Warning message about deprecated features
  response_metadata?: {     // Metadata for warnings and deprecations
    messages?: string[];
    warnings?: string[];
  };
}
```

### SlackMessage Object

```typescript
{
  text?: string;            // The text content of the message
  ts?: string;              // Timestamp of the message
  type?: string;            // Message type, typically 'message'
  user?: string;            // User ID of the message author
  bot_id?: string;          // Bot ID if posted by a bot
  thread_ts?: string;       // Thread timestamp if in a thread
  blocks?: any[];           // Array of Block Kit blocks
  attachments?: any[];      // Array of legacy message attachments
  edited?: {                // Edit information
    ts?: string;            // Timestamp of the edit
    user?: string;          // User ID of the editor
  };
  metadata?: {              // Message metadata
    event_type: string;
    event_payload: Record<string, any>;
  };
}
```

## Usage Examples

### Example 1: Update message with markdown formatting

```typescript
import { request as updateSlackMessage } from '@/sdk/mcp-clients/688338e4ee9e1a9340d83b62/SLACK_UPDATES_A_SLACK_MESSAGE';

async function updateStatusMessage() {
  try {
    const result = await updateSlackMessage({
      channel: 'C1234567890',
      ts: '1625247600.000200',
      markdown_text: `# Updated Status

The issue has been **resolved** and systems are *fully operational*.

\`\`\`bash
# All services running
kubectl get services
\`\`\`

---

**Next steps**: Monitor for 24 hours`
    });

    console.log('Message updated successfully:', result.ts);
    console.log('Updated text:', result.text);
  } catch (error) {
    console.error('Failed to update message:', error);
  }
}
```

### Example 2: Update message with plain text

```typescript
import { request as updateSlackMessage } from '@/sdk/mcp-clients/688338e4ee9e1a9340d83b62/SLACK_UPDATES_A_SLACK_MESSAGE';

async function updateSimpleMessage() {
  try {
    const result = await updateSlackMessage({
      channel: 'C1234567890',
      ts: '1625247600.000200',
      text: 'Hello world, this is an *updated* message with mrkdwn formatting.',
      parse: 'full',
      link_names: 'true'
    });

    if (result.ok) {
      console.log('Message updated in channel:', result.channel);
      console.log('Message details:', result.message);
    }
  } catch (error) {
    console.error('Failed to update message:', error);
  }
}
```

### Example 3: Clear attachments from a message

```typescript
import { request as updateSlackMessage } from '@/sdk/mcp-clients/688338e4ee9e1a9340d83b62/SLACK_UPDATES_A_SLACK_MESSAGE';

async function clearAttachments() {
  try {
    const result = await updateSlackMessage({
      channel: 'C1234567890',
      ts: '1625247600.000200',
      text: 'Updated message without attachments',
      attachments: '[]'  // Clear all attachments
    });

    console.log('Attachments cleared:', result.ok);
  } catch (error) {
    console.error('Failed to clear attachments:', error);
  }
}
```

## Error Handling

The function throws errors in the following cases:

1. **Missing Required Parameters**: If `channel` or `ts` is not provided
   ```typescript
   Error: Missing required parameter: channel
   Error: Missing required parameter: ts
   ```

2. **Invalid MCP Response**: If the MCP response format is incorrect
   ```typescript
   Error: Invalid MCP response format: missing content[0].text
   ```

3. **JSON Parse Error**: If the response cannot be parsed as JSON
   ```typescript
   Error: Failed to parse MCP response JSON: [error details]
   ```

4. **Tool Execution Failure**: If the Slack API returns an error
   ```typescript
   Error: MCP tool execution failed
   Error: [specific error from Slack API]
   ```

5. **Missing Data**: If the response is successful but contains no data
   ```typescript
   Error: MCP tool returned successful response but no data
   ```

### Common Slack API Errors

- `message_not_found`: The message with the specified timestamp doesn't exist
- `channel_not_found`: The specified channel doesn't exist
- `cant_update_message`: The message cannot be updated (e.g., not authorized)
- `edit_window_closed`: The message is too old to be edited
- `is_archived`: The channel is archived

### Error Handling Example

```typescript
try {
  const result = await updateSlackMessage({
    channel: 'C1234567890',
    ts: '1625247600.000200',
    markdown_text: '# Updated Content'
  });
  
  if (result.ok) {
    console.log('Success:', result.ts);
  } else {
    console.error('Slack API error:', result.error);
  }
} catch (error) {
  if (error instanceof Error) {
    if (error.message.includes('Missing required parameter')) {
      console.error('Validation error:', error.message);
    } else if (error.message.includes('parse')) {
      console.error('Response parsing error:', error.message);
    } else {
      console.error('Unexpected error:', error.message);
    }
  }
}
```

## Notes

- **Preferred Method**: Use `markdown_text` for rich formatting instead of the deprecated `blocks` parameter
- **Message Timestamp**: The `ts` parameter is a unique identifier for the message (Unix timestamp with microseconds)
- **Channel ID**: Use the channel ID (starts with 'C' for public channels, 'G' for private channels/groups)
- **Edit Window**: Slack may have time limits on how long after posting a message can be edited
- **Permissions**: The bot/user must have permission to edit messages in the channel
- **File Uploads**: To send files or images, use the 'SLACK_UPLOAD_OR_CREATE_A_FILE_IN_SLACK' tool instead