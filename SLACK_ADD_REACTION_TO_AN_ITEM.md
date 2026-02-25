# Slack Add Reaction to Message

Add an emoji reaction to a Slack message.

## Installation/Import

```typescript
import { request as addSlackReaction } from '@/sdk/mcp-clients/688338e4ee9e1a9340d83b62/SLACK_ADD_REACTION_TO_AN_ITEM';
```

## Function Signature

```typescript
async function request(params: AddReactionParams): Promise<AddReactionData>
```

## Parameters

### `AddReactionParams`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `channel` | `string` | Yes | ID of the channel where the message was posted (e.g., "C1234567890") |
| `name` | `string` | Yes | Name of the emoji without colons (e.g., "thumbsup", "wave::skin-tone-3") |
| `timestamp` | `string` | Yes | Timestamp of the message (e.g., "1234567890.123456") |

**Emoji Name Format:**
- Use emoji name without colons: `"thumbsup"` not `":thumbsup:"`
- For skin tone modifiers: `"wave::skin-tone-3"` (where tone is 2-6)

## Return Value

### `AddReactionData`

```typescript
{
  ok: boolean;           // Whether the API call was successful
  error?: string;        // Error code if failed (e.g., 'already_reacted', 'channel_not_found')
  needed?: string;       // Required scopes if permission missing
  provided?: string;     // Scopes provided with the token
}
```

## Usage Examples

### Basic Usage

```typescript
import { request as addSlackReaction } from '@/sdk/mcp-clients/688338e4ee9e1a9340d83b62/SLACK_ADD_REACTION_TO_AN_ITEM';

async function reactToMessage() {
  try {
    const result = await addSlackReaction({
      channel: 'C1234567890',
      name: 'thumbsup',
      timestamp: '1234567890.123456'
    });
    
    if (result.ok) {
      console.log('Reaction added successfully!');
    }
  } catch (error) {
    console.error('Failed to add reaction:', error);
  }
}
```

### Using Emoji with Skin Tone

```typescript
async function reactWithSkinTone() {
  const result = await addSlackReaction({
    channel: 'C1234567890',
    name: 'wave::skin-tone-3',
    timestamp: '1609459200.000200'
  });
  
  console.log('Reaction status:', result.ok);
}
```

### Handling Different Channels

```typescript
// Public channel
await addSlackReaction({
  channel: 'C1234567890',
  name: 'rocket',
  timestamp: '1234567890.123456'
});

// Private group
await addSlackReaction({
  channel: 'G0987654321',
  name: 'eyes',
  timestamp: '1234567890.123456'
});
```

## Error Handling

### Common Errors

The function may throw errors in the following cases:

1. **Missing Required Parameters**
   ```typescript
   // Throws: "Missing required parameter: channel"
   await addSlackReaction({ name: 'thumbsup', timestamp: '123.456' });
   ```

2. **API Errors** (via `error` field in response)
   - `already_reacted` - You've already reacted with this emoji
   - `channel_not_found` - Channel doesn't exist or bot lacks access
   - `message_not_found` - Message with that timestamp doesn't exist
   - `invalid_name` - Emoji name is invalid
   - `no_reaction` - Reaction couldn't be added
   - `too_many_emoji` - Too many unique reactions on the message
   - `too_many_reactions` - Too many total reactions on the message
   - `not_reactable` - Message cannot receive reactions
   - `thread_locked` - Thread is locked

3. **Permission Errors**
   ```typescript
   // Response will include 'needed' and 'provided' fields
   {
     ok: false,
     error: 'missing_scope',
     needed: 'reactions:write',
     provided: 'reactions:read'
   }
   ```

### Error Handling Example

```typescript
try {
  const result = await addSlackReaction({
    channel: 'C1234567890',
    name: 'thumbsup',
    timestamp: '1234567890.123456'
  });
  
  if (!result.ok) {
    switch (result.error) {
      case 'already_reacted':
        console.log('You already reacted with this emoji');
        break;
      case 'channel_not_found':
        console.log('Channel not found or no access');
        break;
      case 'message_not_found':
        console.log('Message not found');
        break;
      default:
        console.log('Error:', result.error);
    }
  }
} catch (error) {
  console.error('Request failed:', error);
}
```

## Notes

- The `timestamp` parameter is the unique identifier for a Slack message
- You can find message timestamps in Slack's API responses or by hovering over messages in Slack
- The bot/user must have appropriate permissions (`reactions:write` scope)
- Emoji names are case-sensitive
- Custom emoji from your workspace can also be used by their name