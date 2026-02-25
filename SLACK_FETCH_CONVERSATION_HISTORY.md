# Slack Fetch Conversation History

Fetches conversation history from a Slack channel, direct message, or multi-person direct message. Returns messages from the main channel timeline with support for pagination and time-based filtering.

## Installation/Import

```typescript
import { request as fetchSlackConversationHistory } from '@/sdk/mcp-clients/688338e4ee9e1a9340d83b62/SLACK_FETCH_CONVERSATION_HISTORY';
```

## Function Signature

```typescript
async function request(params: FetchConversationHistoryParams): Promise<FetchConversationHistoryData>
```

## Parameters

### `FetchConversationHistoryParams`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `channel` | `string` | **Yes** | The ID of the channel, DM, or multi-person DM to fetch history from (e.g., "C1234567890", "G0123456789", "D0123456789") |
| `cursor` | `string` | No | Pagination cursor from `next_cursor` of a previous response to fetch subsequent pages |
| `inclusive` | `boolean` | No | When true, includes messages at exact 'oldest' or 'latest' boundary timestamps. Default: false |
| `latest` | `string` | No | End of time range (Unix timestamp or Slack timestamp like "1609459200.000000"). Only applies to main messages, not threaded replies |
| `limit` | `number` | No | Maximum number of messages to return (1-1000). Recommended: 200 or fewer for optimal performance |
| `oldest` | `string` | No | Start of time range (Unix timestamp or Slack timestamp like "1609372800.000000"). Only applies to main messages, not threaded replies |

## Return Value

### `FetchConversationHistoryData`

Returns an object containing:

- `ok` (boolean): Whether the API call was successful
- `messages` (Message[]): Array of message objects from the main channel timeline
- `has_more` (boolean): Whether there are more messages available beyond the current result set
- `response_metadata` (object): Contains `next_cursor` for pagination
- `pin_count` (number): Number of pinned messages in the conversation
- `composio_execution_message` (string): Informational message about execution results
- `error` (string): Error code if the API call was unsuccessful

### Message Object

Each message includes:
- `type`, `text`, `ts` (required)
- `user`: User ID of the message author
- `thread_ts`: Thread identifier (if message is part of a thread)
- `reply_count`: Number of replies (for parent messages)
- `reactions`: Array of reaction objects
- `edited`: Edit history information
- `blocks`, `attachments`: Rich formatting data
- And many more optional fields

## Usage Examples

### Basic Usage - Fetch Recent Messages

```typescript
import { request as fetchSlackConversationHistory } from '@/sdk/mcp-clients/688338e4ee9e1a9340d83b62/SLACK_FETCH_CONVERSATION_HISTORY';

async function getRecentMessages() {
  try {
    const history = await fetchSlackConversationHistory({
      channel: 'C1234567890',
      limit: 50
    });

    console.log(`Fetched ${history.messages?.length} messages`);
    console.log(`Has more: ${history.has_more}`);
    
    history.messages?.forEach(msg => {
      console.log(`[${msg.ts}] ${msg.user}: ${msg.text}`);
    });
  } catch (error) {
    console.error('Failed to fetch conversation history:', error);
  }
}
```

### Advanced Usage - Pagination with Time Range

```typescript
import { request as fetchSlackConversationHistory } from '@/sdk/mcp-clients/688338e4ee9e1a9340d83b62/SLACK_FETCH_CONVERSATION_HISTORY';

async function getAllMessagesInRange() {
  const allMessages = [];
  let cursor: string | undefined;

  try {
    do {
      const history = await fetchSlackConversationHistory({
        channel: 'C1234567890',
        oldest: '1609372800.000000',  // Jan 1, 2021
        latest: '1609459200.000000',  // Jan 2, 2021
        limit: 200,
        cursor: cursor,
        inclusive: true
      });

      if (history.messages) {
        allMessages.push(...history.messages);
      }

      cursor = history.response_metadata?.next_cursor;
      
      console.log(`Fetched ${history.messages?.length} messages, total: ${allMessages.length}`);
    } while (cursor);

    console.log(`Total messages fetched: ${allMessages.length}`);
    return allMessages;
  } catch (error) {
    console.error('Failed to fetch conversation history:', error);
    throw error;
  }
}
```

### Finding Threaded Conversations

```typescript
import { request as fetchSlackConversationHistory } from '@/sdk/mcp-clients/688338e4ee9e1a9340d83b62/SLACK_FETCH_CONVERSATION_HISTORY';

async function findThreadedMessages() {
  try {
    const history = await fetchSlackConversationHistory({
      channel: 'C1234567890',
      limit: 100
    });

    const threaded = history.messages?.filter(msg => 
      msg.thread_ts && msg.reply_count && msg.reply_count > 0
    );

    console.log(`Found ${threaded?.length} messages with replies`);
    
    threaded?.forEach(msg => {
      console.log(`Thread: "${msg.text}" - ${msg.reply_count} replies`);
      console.log(`  Thread TS: ${msg.thread_ts}`);
      console.log(`  Latest reply: ${msg.latest_reply}`);
      console.log(`  Reply users: ${msg.reply_users?.join(', ')}`);
    });
  } catch (error) {
    console.error('Failed to fetch conversation history:', error);
  }
}
```

## Error Handling

The function may throw errors in the following cases:

1. **Missing Required Parameters**: If `channel` is not provided
2. **Invalid MCP Response**: If the MCP response format is malformed
3. **JSON Parse Error**: If the response cannot be parsed as JSON
4. **Tool Execution Failure**: If the Slack API returns an error (check `error` field in response)
5. **No Data Returned**: If the tool returns successful but without data

### Error Handling Example

```typescript
try {
  const history = await fetchSlackConversationHistory({
    channel: 'C1234567890',
    limit: 100
  });
  
  if (history.error) {
    console.error('Slack API error:', history.error);
  }
} catch (error) {
  if (error instanceof Error) {
    if (error.message.includes('Missing required parameter')) {
      console.error('Validation error:', error.message);
    } else if (error.message.includes('Failed to parse')) {
      console.error('Response parsing error:', error.message);
    } else {
      console.error('Unexpected error:', error.message);
    }
  }
}
```

## Important Notes

### Threaded Replies

⚠️ **IMPORTANT**: This function retrieves only parent messages from the main channel timeline. Threaded replies are **NOT** included in the results.

- Parent messages with replies will have `thread_ts`, `reply_count`, and `latest_reply` fields
- To retrieve actual threaded replies, use `SLACK_FETCH_MESSAGE_THREAD_FROM_A_CONVERSATION` with the parent message's `thread_ts`

### Time Range Filtering

- The `oldest` and `latest` parameters only apply to main channel messages, not threaded replies
- Timestamps can be Unix timestamps or Slack timestamps (e.g., "1234567890.000000")
- Use `inclusive: true` to include messages at exact boundary timestamps

### Pagination

- Use `response_metadata.next_cursor` to fetch subsequent pages
- The `limit` parameter controls how many messages to return (1-1000)
- Recommended limit: 200 or fewer for optimal performance
- API limits vary by app type (Marketplace apps: up to 999 per request; non-Marketplace apps: 15 per request)

### Message Limits

- Free teams that have reached the message limit will have `is_limited: true` on messages
- The `has_more` field indicates if there are additional messages beyond the current result set