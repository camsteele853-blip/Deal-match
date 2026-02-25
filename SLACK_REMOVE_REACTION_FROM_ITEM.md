# Slack Remove Reaction From Item

Remove an emoji reaction from a Slack message, file, or file comment.

## Installation/Import

```typescript
import { request as removeSlackReaction } from '@/sdk/mcp-clients/688338e4ee9e1a9340d83b62/SLACK_REMOVE_REACTION_FROM_ITEM';
```

## Function Signature

```typescript
async function request(params: RemoveReactionParams): Promise<RemoveReactionData>
```

## Parameters

### `RemoveReactionParams`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | `string` | Yes | Name of the emoji reaction to remove (e.g., 'thumbsup'), without colons |
| `channel` | `string` | Conditional | Channel ID of the message. Required if `timestamp` is provided |
| `timestamp` | `string` | Conditional | Timestamp of the message. Required if `channel` is provided |
| `file` | `string` | No | ID of the file to remove the reaction from |
| `file_comment` | `string` | No | ID of the file comment to remove the reaction from |

**Note**: You must provide either:
- Both `channel` AND `timestamp` (for message reactions), OR
- `file` (for file reactions), OR
- `file_comment` (for file comment reactions)

### Parameter Examples

```typescript
// Reaction name examples
name: "thumbsup"
name: "smile"
name: "robot_face"
```

## Return Value

### `RemoveReactionData`

| Property | Type | Description |
|----------|------|-------------|
| `ok` | `boolean` | Indicates whether the request succeeded |
| `error` | `string` (optional) | Error code if the request failed |
| `needed` | `string` (optional) | Required OAuth scopes (on permission errors) |
| `provided` | `string` (optional) | Granted OAuth scopes (on permission errors) |
| `response_metadata` | `ResponseMetadata` (optional) | Additional response context |
| `warning` | `string` (optional) | Top-level warning message |
| `warnings` | `string[]` (optional) | List of warning codes |

## Usage Examples

### Remove Reaction from a Message

```typescript
import { request as removeSlackReaction } from '@/sdk/mcp-clients/688338e4ee9e1a9340d83b62/SLACK_REMOVE_REACTION_FROM_ITEM';

async function removeMessageReaction() {
  try {
    const result = await removeSlackReaction({
      name: 'thumbsup',
      channel: 'C1234567890',
      timestamp: '1234567890.123456'
    });

    if (result.ok) {
      console.log('Reaction removed successfully');
    } else {
      console.error('Failed to remove reaction:', result.error);
    }
  } catch (error) {
    console.error('Error removing reaction:', error);
  }
}
```

### Remove Reaction from a File

```typescript
import { request as removeSlackReaction } from '@/sdk/mcp-clients/688338e4ee9e1a9340d83b62/SLACK_REMOVE_REACTION_FROM_ITEM';

async function removeFileReaction() {
  try {
    const result = await removeSlackReaction({
      name: 'smile',
      file: 'F1234567890'
    });

    if (result.ok) {
      console.log('Reaction removed from file');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Remove Reaction from a File Comment

```typescript
import { request as removeSlackReaction } from '@/sdk/mcp-clients/688338e4ee9e1a9340d83b62/SLACK_REMOVE_REACTION_FROM_ITEM';

async function removeFileCommentReaction() {
  try {
    const result = await removeSlackReaction({
      name: 'robot_face',
      file_comment: 'Fc1234567890'
    });

    console.log('Result:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

## Error Handling

### Common Errors

The function may throw errors in the following scenarios:

1. **Missing Required Parameters**
   - Error: `"Missing required parameter: name"`
   - Cause: The `name` parameter is required

2. **Conditional Parameter Validation**
   - Error: `"Parameter 'timestamp' is required when 'channel' is provided"`
   - Error: `"Parameter 'channel' is required when 'timestamp' is provided"`
   - Cause: Both `channel` and `timestamp` must be provided together

3. **MCP Tool Execution Errors**
   - Error: `"MCP tool execution failed"`
   - Cause: The Slack API returned an error (check `result.error` for details)

4. **API-Specific Errors** (returned in `result.error`)
   - `no_reaction`: The specified reaction was not found on the item
   - `message_not_found`: The specified message was not found
   - `bad_timestamp`: Invalid timestamp format
   - `channel_not_found`: The specified channel does not exist
   - `file_not_found`: The specified file does not exist
   - `file_comment_not_found`: The specified file comment does not exist
   - `invalid_name`: Invalid emoji name
   - `no_item_specified`: No target item (message, file, or file_comment) was specified
   - `missing_scope`: Missing required OAuth scopes
   - `not_authed`: Authentication token is missing or invalid
   - `invalid_auth`: Invalid authentication credentials
   - `account_inactive`: Account is inactive
   - `token_revoked`: Authentication token has been revoked

### Error Handling Example

```typescript
import { request as removeSlackReaction } from '@/sdk/mcp-clients/688338e4ee9e1a9340d83b62/SLACK_REMOVE_REACTION_FROM_ITEM';

async function safeRemoveReaction() {
  try {
    const result = await removeSlackReaction({
      name: 'thumbsup',
      channel: 'C1234567890',
      timestamp: '1234567890.123456'
    });

    if (!result.ok) {
      // Handle API-level errors
      switch (result.error) {
        case 'no_reaction':
          console.log('Reaction was not found on this item');
          break;
        case 'message_not_found':
          console.log('Message not found');
          break;
        case 'missing_scope':
          console.log('Missing OAuth scopes:', result.needed);
          break;
        default:
          console.error('API error:', result.error);
      }
      return;
    }

    console.log('Reaction removed successfully');
  } catch (error) {
    // Handle validation or execution errors
    if (error instanceof Error) {
      console.error('Error:', error.message);
    }
  }
}
```

## Notes

- Reaction names should be provided without colons (e.g., `"thumbsup"` not `":thumbsup:"`)
- You must specify at least one target item: message (via channel+timestamp), file, or file_comment
- The function validates that channel and timestamp are provided together
- Check the `ok` property in the response to determine success
- When `ok` is `false`, the `error` property contains a machine-readable error code