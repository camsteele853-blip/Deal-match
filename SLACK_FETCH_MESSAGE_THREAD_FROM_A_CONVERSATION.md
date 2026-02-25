# Slack Fetch Message Thread from a Conversation

Fetches a complete message thread from a Slack conversation, including the parent message and all replies.

## Installation/Import

```typescript
import { request as fetchSlackMessageThread } from '@/sdk/mcp-clients/688338e4ee9e1a9340d83b62/SLACK_FETCH_MESSAGE_THREAD_FROM_A_CONVERSATION';
```

## Function Signature

```typescript
async function request(params: FetchMessageThreadParams): Promise<MessageThreadData>
```

## Parameters

### `FetchMessageThreadParams`

All parameters are optional, but typically you'll want to provide at least `channel` and `ts`:

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `channel` | `string` | ID of the conversation to fetch the thread from | `"C0123456789"` |
| `ts` | `string` | Timestamp of the parent message in the thread | `"1234567890.123456"` |
| `limit` | `number` | Maximum number of messages to return | `100` |
| `cursor` | `string` | Pagination cursor for subsequent pages | `"dXNlcjpVMEc5V0ZYTlo="` |
| `oldest` | `string` | Oldest message timestamp in the time range | `"1678836000.000000"` |
| `latest` | `string` | Latest message timestamp in the time range | `"1678886400.000000"` |
| `inclusive` | `boolean` | Include messages with latest/oldest timestamps | `true` |
| `team_id` | `string` | Workspace ID (required for org-wide apps) | `"T1234567890"` |

## Return Value

### `MessageThreadData`

```typescript
{
  ok: boolean;                          // Whether the API call was successful
  messages?: Message[];                 // Array of message objects in the thread
  has_more?: boolean;                   // Whether more messages are available
  response_metadata?: {
    next_cursor?: string;               // Cursor for next page of results
  };
  error?: string;                       // Error code if ok is false
  composio_execution_message?: string;  // Additional context about the response
}
```

### `Message` Object

Each message in the `messages` array contains:

- `type`: Message type (typically "message")
- `text`: The message text content
- `ts`: Unique timestamp identifier
- `user`: User ID of the message author
- `thread_ts`: Timestamp of the parent message
- `reply_count`: Number of replies (on parent messages)
- `reactions`: Array of emoji reactions
- `edited`: Edit information if the message was edited
- `files`: Attached files
- `blocks`: Structured block elements
- And many more optional fields...

## Usage Examples

### Basic: Fetch a Thread

```typescript
import { request as fetchSlackMessageThread } from '@/sdk/mcp-clients/688338e4ee9e1a9340d83b62/SLACK_FETCH_MESSAGE_THREAD_FROM_A_CONVERSATION';

async function getThreadMessages() {
  try {
    const threadData = await fetchSlackMessageThread({
      channel: 'C0123456789',
      ts: '1234567890.123456'
    });

    if (threadData.ok && threadData.messages) {
      console.log(`Found ${threadData.messages.length} messages in thread`);
      threadData.messages.forEach(msg => {
        console.log(`${msg.user}: ${msg.text}`);
      });
    }
  } catch (error) {
    console.error('Failed to fetch thread:', error);
  }
}
```

### Advanced: Paginated Thread Fetching

```typescript
import { request as fetchSlackMessageThread } from '@/sdk/mcp-clients/688338e4ee9e1a9340d83b62/SLACK_FETCH_MESSAGE_THREAD_FROM_A_CONVERSATION';

async function getAllThreadMessages(channel: string, threadTs: string) {
  const allMessages = [];
  let cursor: string | undefined = undefined;

  try {
    do {
      const threadData = await fetchSlackMessageThread({
        channel,
        ts: threadTs,
        limit: 100,
        cursor
      });

      if (!threadData.ok) {
        throw new Error(threadData.error || 'Failed to fetch thread');
      }

      if (threadData.messages) {
        allMessages.push(...threadData.messages);
      }

      cursor = threadData.response_metadata?.next_cursor;
    } while (cursor);

    return allMessages;
  } catch (error) {
    console.error('Error fetching all thread messages:', error);
    throw error;
  }
}
```

### Filter Thread by Time Range

```typescript
import { request as fetchSlackMessageThread } from '@/sdk/mcp-clients/688338e4ee9e1a9340d83b62/SLACK_FETCH_MESSAGE_THREAD_FROM_A_CONVERSATION';

async function getRecentThreadReplies(channel: string, threadTs: string) {
  const oneDayAgo = (Date.now() / 1000 - 86400).toFixed(6);

  try {
    const threadData = await fetchSlackMessageThread({
      channel,
      ts: threadTs,
      oldest: oneDayAgo,
      inclusive: true
    });

    if (threadData.ok && threadData.messages) {
      console.log(`Found ${threadData.messages.length} messages from the last 24 hours`);
      return threadData.messages;
    }
  } catch (error) {
    console.error('Failed to fetch recent replies:', error);
    throw error;
  }
}
```

## Error Handling

The function may throw errors in the following cases:

1. **Invalid MCP Response**: If the MCP tool returns a malformed response
2. **JSON Parse Error**: If the response cannot be parsed as JSON
3. **Tool Execution Failure**: If `successful` is false in the response
4. **Missing Data**: If the response is successful but contains no data

Common Slack API errors (returned in `error` field when `ok` is false):

- `channel_not_found`: The specified channel does not exist or is not accessible
- `thread_not_found`: The specified thread timestamp does not exist
- `missing_scope`: The token lacks required OAuth scopes
- `not_authed`: Authentication token is invalid or missing
- `ratelimited`: Too many requests - need to slow down

### Error Handling Example

```typescript
try {
  const threadData = await fetchSlackMessageThread({
    channel: 'C0123456789',
    ts: '1234567890.123456'
  });

  if (!threadData.ok) {
    switch (threadData.error) {
      case 'channel_not_found':
        console.error('Channel does not exist or is not accessible');
        break;
      case 'thread_not_found':
        console.error('Thread does not exist');
        break;
      case 'missing_scope':
        console.error('Missing required OAuth scopes');
        break;
      default:
        console.error('API error:', threadData.error);
    }
  }
} catch (error) {
  console.error('Request failed:', error);
}
```

## Notes

- If the specified timestamp has no replies, only the parent message itself is returned
- The `messages` array includes both the parent message and all replies
- Use pagination (`cursor` and `has_more`) for threads with many messages
- The `composio_execution_message` field may contain warnings about potential missing replies or pagination issues
- Timestamps in Slack are in the format `"1234567890.123456"` (Unix timestamp with microseconds)