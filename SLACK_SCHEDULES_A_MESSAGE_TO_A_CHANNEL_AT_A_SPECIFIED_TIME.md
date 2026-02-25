# Slack Schedule Message - Cheatsheet

## Overview

This module provides a function to schedule messages to Slack channels at a specified future time. Messages can be formatted with markdown, include attachments, and be sent to channels, private groups, or direct messages.

## Installation/Import

```typescript
import { request as scheduleSlackMessage } from '@/sdk/mcp-clients/688338e4ee9e1a9340d83b62/SLACK_SCHEDULES_A_MESSAGE_TO_A_CHANNEL_AT_A_SPECIFIED_TIME';
```

## Function Signature

```typescript
async function request(params: ScheduleMessageParams): Promise<ScheduleMessageData>
```

## Parameters

### `ScheduleMessageParams`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `channel` | `string` | No | Channel ID (e.g., `C1234567890`) or name (e.g., `#general`) |
| `markdown_text` | `string` | No* | **PREFERRED**: Markdown-formatted message text |
| `text` | `string` | No* | Plain text message (use `markdown_text` for formatting) |
| `post_at` | `string` | No | Unix EPOCH timestamp for when to send the message |
| `attachments` | `string` | No* | JSON array of structured attachments (URL-encoded string) |
| `blocks` | `string` | No* | **DEPRECATED**: JSON array of blocks (use `markdown_text` instead) |
| `thread_ts` | `string` | No | Parent message timestamp to reply in thread |
| `reply_broadcast` | `boolean` | No | Make thread reply visible to all (default: `false`) |
| `link_names` | `boolean` | No | Auto-link channel names and usernames |
| `unfurl_links` | `boolean` | No | Enable automatic link unfurling (default: `true`) |
| `unfurl_media` | `boolean` | No | Enable automatic media unfurling (default: `true`) |
| `parse` | `string` | No | Text treatment: `full` or `none` (default) |

\* At least one of `markdown_text`, `text`, `attachments`, or `blocks` must be provided.

## Return Value

### `ScheduleMessageData`

```typescript
{
  ok: boolean;                      // Whether the API call was successful
  channel: string;                  // Channel ID where message is scheduled
  scheduled_message_id: string;     // Unique ID for the scheduled message
  post_at: string;                  // Unix timestamp when message will be posted
  message: ScheduledMessage;        // Complete message object
  error?: string | null;            // Error code if ok is false
}
```

## Usage Examples

### Basic Scheduled Message with Markdown

```typescript
import { request as scheduleSlackMessage } from '@/sdk/mcp-clients/688338e4ee9e1a9340d83b62/SLACK_SCHEDULES_A_MESSAGE_TO_A_CHANNEL_AT_A_SPECIFIED_TIME';

async function scheduleTeamReminder() {
  try {
    const result = await scheduleSlackMessage({
      channel: '#general',
      markdown_text: '# Team Meeting Reminder\n\nDon\'t forget about the **team meeting** tomorrow at *2 PM*!\n\n```\nZoom: https://zoom.us/meeting-id\n```',
      post_at: '1678886400' // Unix timestamp for future time
    });

    console.log('Message scheduled successfully!');
    console.log('Scheduled Message ID:', result.scheduled_message_id);
    console.log('Will be posted at:', new Date(parseInt(result.post_at) * 1000));
  } catch (error) {
    console.error('Failed to schedule message:', error);
  }
}
```

### Schedule Message with Plain Text

```typescript
async function scheduleSimpleMessage() {
  const futureTimestamp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

  const result = await scheduleSlackMessage({
    channel: 'C1234567890',
    text: 'Hello, world! This is a scheduled message.',
    post_at: futureTimestamp.toString()
  });

  return result;
}
```

### Schedule Thread Reply

```typescript
async function scheduleThreadReply() {
  const result = await scheduleSlackMessage({
    channel: '#project-updates',
    markdown_text: '## Weekly Report\n\n- **Tasks completed**: 12\n- *In progress*: 3\n- ~~Blocked~~: **Resolved**',
    post_at: '1678886400',
    thread_ts: '1405894322.002768', // Parent message timestamp
    reply_broadcast: true // Make visible to all in channel
  });

  return result;
}
```

### Schedule Message with Attachments

```typescript
async function scheduleWithAttachments() {
  const attachments = JSON.stringify([
    {
      color: 'good',
      text: 'Yay! You did it!',
      fields: [
        {
          title: 'Priority',
          value: 'High',
          short: false
        }
      ]
    }
  ]);

  const result = await scheduleSlackMessage({
    channel: '#notifications',
    text: 'Check out this update:',
    attachments: attachments,
    post_at: '1678886400'
  });

  return result;
}
```

## Error Handling

The function may throw errors in the following cases:

- **Invalid MCP Response**: If the MCP tool returns a malformed response
- **JSON Parse Error**: If the response cannot be parsed as JSON
- **Tool Execution Failed**: If `successful` is `false` in the response
- **Missing Data**: If the response is successful but contains no data
- **Slack API Errors**: Common error codes include:
  - `time_in_past`: The specified `post_at` time is in the past
  - `time_too_far`: The specified time is too far in the future
  - `channel_not_found`: The specified channel doesn't exist
  - `invalid_time`: The timestamp format is invalid

### Error Handling Example

```typescript
try {
  const result = await scheduleSlackMessage({
    channel: '#general',
    markdown_text: '# Reminder',
    post_at: '1678886400'
  });
  
  console.log('Success:', result.scheduled_message_id);
} catch (error) {
  if (error instanceof Error) {
    console.error('Error scheduling message:', error.message);
    
    // Handle specific error cases
    if (error.message.includes('time_in_past')) {
      console.error('The scheduled time is in the past. Please use a future timestamp.');
    } else if (error.message.includes('channel_not_found')) {
      console.error('The specified channel does not exist.');
    }
  }
}
```

## Notes

- **Preferred Format**: Use `markdown_text` for formatted messages instead of the deprecated `blocks` parameter
- **Timestamp Format**: `post_at` must be a Unix EPOCH timestamp (seconds since 1970-01-01 00:00:00 UTC)
- **Future Time Only**: The timestamp must be in the future, not in the past
- **Cancellation**: Use the returned `scheduled_message_id` with `chat.deleteScheduledMessage` to cancel before sending
- **Thread Replies**: Use `thread_ts` to schedule a reply in an existing thread
- **Auto-linking**: Set `link_names: true` to automatically link @mentions and #channels

## Markdown Support

The `markdown_text` field supports:
- Headers: `#`, `##`, `###`
- Bold: `**text**`
- Italic: `*text*`
- Strikethrough: `~~text~~`
- Code blocks: ` ``` `
- Links: `[text](url)`
- Quotes: `>`
- Dividers: `---`