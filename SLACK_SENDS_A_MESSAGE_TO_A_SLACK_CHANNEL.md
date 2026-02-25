# Slack Send Message Module

Send messages to Slack channels with rich formatting support including markdown, attachments, blocks, and threading.

## Installation

```typescript
import { request as sendSlackMessage } from '@/sdk/mcp-clients/688338e4ee9e1a9340d83b62/SLACK_SENDS_A_MESSAGE_TO_A_SLACK_CHANNEL';
```

## Function Signature

```typescript
async function sendSlackMessage(params: SendSlackMessageParams): Promise<SendSlackMessageData>
```

## Parameters

### Required Parameters

- **`channel`** (string): ID or name of the channel, private group, or IM channel to send the message to
  - Examples: `"C1234567890"`, `"general"`

### Optional Parameters

- **`markdown_text`** (string): **PREFERRED** - Write your message in markdown for nicely formatted display
  - Supports: headers, bold, italic, strikethrough, code blocks, links, lists, etc.
  - Use `\n` for line breaks (e.g., `'Line 1\nLine 2'`)
  - User mentions: Use `<@USER_ID>` format (e.g., `<@U1234567890>`)
  
- **`text`** (string): DEPRECATED - Use `markdown_text` instead. Plain text message content

- **`thread_ts`** (string): Timestamp of an existing message to make this a threaded reply
  - Example: `"1618033790.001500"`

- **`username`** (string): Bot's display name in Slack (max 80 chars)
  - Examples: `"MyBot"`, `"AlertBot"`

- **`icon_emoji`** (string): Emoji for bot's icon (overrides `icon_url`)
  - Examples: `":tada:"`, `":robot_face:"`

- **`icon_url`** (string): HTTPS image URL for bot's icon

- **`attachments`** (string): URL-encoded JSON array of message attachments (legacy method)

- **`blocks`** (string): DEPRECATED - Use `markdown_text` instead. URL-encoded JSON array of Block Kit blocks

- **`link_names`** (boolean): Auto-hyperlink channel names and usernames (default: `false`)

- **`mrkdwn`** (boolean): Enable markdown formatting for `text` field (default: `true`)

- **`parse`** (string): Message parsing behavior - `"none"` or `"full"`

- **`reply_broadcast`** (boolean): If `true`, threaded reply also posts to main channel (default: `false`)

- **`unfurl_links`** (boolean): Enable URL unfurling (default: `false` for bots)

- **`unfurl_media`** (boolean): Enable media unfurling (default: `true`)

## Return Value

Returns a `Promise<SendSlackMessageData>` containing:

- **`ok`** (boolean): Whether the request was successful
- **`channel`** (string): Channel ID where message was posted
- **`ts`** (string): Message timestamp (unique identifier)
- **`message`** (Message): Complete message object with all details
- **`error`** (string): Error code if request failed

## Usage Examples

### Basic Message

```typescript
import { request as sendSlackMessage } from '@/sdk/mcp-clients/688338e4ee9e1a9340d83b62/SLACK_SENDS_A_MESSAGE_TO_A_SLACK_CHANNEL';

const result = await sendSlackMessage({
  channel: 'general',
  markdown_text: 'Hello, team! 👋'
});

console.log(`Message sent with timestamp: ${result.ts}`);
```

### Rich Formatted Message

```typescript
const result = await sendSlackMessage({
  channel: 'C1234567890',
  markdown_text: `# Deployment Status Update

## Summary
Deployment to production completed successfully! 🚀

### Details
- **Environment**: Production
- **Version**: v2.5.0
- **Duration**: 5 minutes
- *Status*: ✅ All systems operational

\`\`\`bash
kubectl get pods -n production
\`\`\`

> Next steps: Monitor for 24 hours

---

**Questions?** Contact <@U1234567890>`
});
```

### Threaded Reply

```typescript
const result = await sendSlackMessage({
  channel: 'C1234567890',
  thread_ts: '1618033790.001500',
  markdown_text: 'Thanks for the update! Looking good. 👍'
});
```

### Custom Bot Appearance

```typescript
const result = await sendSlackMessage({
  channel: 'alerts',
  markdown_text: '⚠️ **Alert**: High CPU usage detected on server-01',
  username: 'Monitoring Bot',
  icon_emoji: ':warning:'
});
```

### Message with Code Block

```typescript
const result = await sendSlackMessage({
  channel: 'engineering',
  markdown_text: `## Code Review Request

Please review this function:

\`\`\`typescript
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}
\`\`\`

**Reviewer**: <@U9876543210>`
});
```

## Error Handling

The function throws errors in the following cases:

- **Missing required parameter**: `channel` is required
- **Invalid MCP response**: Response format is incorrect
- **JSON parsing error**: Response cannot be parsed
- **Tool execution failure**: Slack API returns an error
- **No data returned**: Successful response but missing data

### Example Error Handling

```typescript
try {
  const result = await sendSlackMessage({
    channel: 'general',
    markdown_text: 'Hello, world!'
  });
  console.log('Message sent successfully:', result.ts);
} catch (error) {
  if (error instanceof Error) {
    console.error('Failed to send message:', error.message);
    
    // Handle specific error cases
    if (error.message.includes('channel')) {
      console.error('Invalid channel specified');
    } else if (error.message.includes('parse')) {
      console.error('Response parsing failed');
    }
  }
}
```

## Common Error Codes

When `ok` is `false`, the `error` field may contain:

- `channel_not_found`: Channel does not exist
- `not_in_channel`: Bot is not a member of the channel
- `is_archived`: Channel is archived
- `msg_too_long`: Message text is too long
- `no_text`: No message text provided
- `invalid_auth`: Authentication token is invalid
- `account_inactive`: Account is inactive

## Tips

1. **Prefer `markdown_text`**: Use `markdown_text` instead of deprecated `text` or `blocks` fields
2. **Line breaks**: Use `\n` for line breaks in markdown text
3. **User mentions**: Use `<@USER_ID>` format, not `@username`
4. **Threading**: Use `thread_ts` to reply in threads and keep channels organized
5. **Bot customization**: Set `username` and `icon_emoji` for better bot identification
6. **Error handling**: Always wrap calls in try-catch blocks
7. **Channel IDs**: Prefer channel IDs over names for reliability

## Related Documentation

- [Slack API: chat.postMessage](https://api.slack.com/methods/chat.postMessage)
- [Slack Block Kit](https://api.slack.com/block-kit)
- [Slack Markdown Formatting](https://api.slack.com/reference/surfaces/formatting)