# Slack Invite Users to Channel

Invite users to a public or private Slack channel.

## Installation/Import

```typescript
import { request as inviteUsersToSlackChannel } from '@/sdk/mcp-clients/688338e4ee9e1a9340d83b62/SLACK_INVITE_USERS_TO_A_SLACK_CHANNEL';
```

## Function Signature

```typescript
async function request(params: InviteUsersToChannelParams): Promise<InviteUsersToChannelData>
```

## Parameters

### `InviteUsersToChannelParams`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `channel` | `string` | Yes | ID of the public or private Slack channel. Typically starts with 'C' (public) or 'G' (private/group). |
| `users` | `string` | Yes | Comma-separated string of valid Slack User IDs to invite. Up to 1000 user IDs can be included. |

**Example:**
```typescript
{
  channel: 'C1234567890',
  users: 'U1234567890,U2345678901,U3456789012'
}
```

## Return Value

### `InviteUsersToChannelData`

Returns an object containing:
- `ok`: Boolean indicating if the API call was successful
- `channel`: The conversation object with details about the channel where users were invited
- `error`: Error code if something went wrong (only present when `ok` is false)
- `errors`: Array of per-user failure details for multi-user requests (only in error responses)
- `response_metadata`: Additional response information from Slack
- `warning`: Warning message for deprecations or non-critical issues
- `warnings`: Array of warning strings

## Usage Examples

### Basic Usage - Invite Single User

```typescript
import { request as inviteUsersToSlackChannel } from '@/sdk/mcp-clients/688338e4ee9e1a9340d83b62/SLACK_INVITE_USERS_TO_A_SLACK_CHANNEL';

async function inviteSingleUser() {
  try {
    const result = await inviteUsersToSlackChannel({
      channel: 'C1234567890',
      users: 'U1234567890'
    });
    
    console.log('User invited successfully:', result.ok);
    console.log('Channel name:', result.channel?.name);
  } catch (error) {
    console.error('Failed to invite user:', error);
  }
}
```

### Invite Multiple Users

```typescript
import { request as inviteUsersToSlackChannel } from '@/sdk/mcp-clients/688338e4ee9e1a9340d83b62/SLACK_INVITE_USERS_TO_A_SLACK_CHANNEL';

async function inviteMultipleUsers() {
  try {
    const result = await inviteUsersToSlackChannel({
      channel: 'C1234567890',
      users: 'U1234567890,U2345678901,U3456789012'
    });
    
    if (result.ok) {
      console.log('Users invited successfully');
      console.log('Channel members count:', result.channel?.num_members);
    } else {
      console.error('Invitation failed:', result.error);
      
      // Check for per-user errors
      if (result.errors) {
        result.errors.forEach(err => {
          console.error(`User ${err.user} failed: ${err.error}`);
        });
      }
    }
  } catch (error) {
    console.error('Failed to invite users:', error);
  }
}
```

### Invite to Private Channel

```typescript
import { request as inviteUsersToSlackChannel } from '@/sdk/mcp-clients/688338e4ee9e1a9340d83b62/SLACK_INVITE_USERS_TO_A_SLACK_CHANNEL';

async function inviteToPrivateChannel() {
  try {
    const result = await inviteUsersToSlackChannel({
      channel: 'G0987654321', // Private channel ID starts with 'G'
      users: 'U1234567890,U2345678901'
    });
    
    console.log('Invited to private channel:', result.channel?.name);
    console.log('Is private:', result.channel?.is_private);
  } catch (error) {
    console.error('Failed to invite to private channel:', error);
  }
}
```

## Error Handling

The function may throw errors in the following cases:

1. **Missing Required Parameters**: If `channel` or `users` is not provided
   ```typescript
   Error: Missing required parameter: channel
   Error: Missing required parameter: users
   ```

2. **Invalid MCP Response**: If the MCP response format is invalid
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
   ```

5. **Missing Data**: If the response is successful but contains no data
   ```typescript
   Error: MCP tool returned successful response but no data
   ```

### Common Slack API Errors

- `channel_not_found`: The specified channel does not exist
- `user_not_found`: One or more user IDs are invalid
- `cant_invite_self`: Cannot invite yourself to a channel
- `already_in_channel`: User is already a member of the channel
- `is_archived`: Cannot invite users to an archived channel
- `not_in_channel`: The bot/user must be a member of the channel to invite others
- `missing_scope`: The OAuth token lacks required permissions

### Error Handling Example

```typescript
import { request as inviteUsersToSlackChannel } from '@/sdk/mcp-clients/688338e4ee9e1a9340d83b62/SLACK_INVITE_USERS_TO_A_SLACK_CHANNEL';

async function inviteWithErrorHandling() {
  try {
    const result = await inviteUsersToSlackChannel({
      channel: 'C1234567890',
      users: 'U1234567890,U2345678901'
    });
    
    if (!result.ok) {
      // Handle Slack API errors
      switch (result.error) {
        case 'channel_not_found':
          console.error('Channel does not exist');
          break;
        case 'user_not_found':
          console.error('One or more users not found');
          break;
        case 'already_in_channel':
          console.warn('User is already in the channel');
          break;
        default:
          console.error('Unexpected error:', result.error);
      }
      
      // Check for individual user errors
      if (result.errors) {
        result.errors.forEach(err => {
          console.error(`Failed to invite ${err.user}: ${err.error}`);
        });
      }
    } else {
      console.log('Successfully invited users');
    }
  } catch (error) {
    console.error('Request failed:', error);
  }
}
```

## Notes

- Maximum of 1000 user IDs can be invited in a single request
- The bot or user making the request must be a member of the channel
- Required OAuth scopes: `channels:write` (for public channels) or `groups:write` (for private channels)
- User IDs must be comma-separated without spaces
- Channel IDs starting with 'C' are public channels, 'G' are private/group channels
- The response includes detailed channel information including members, topic, purpose, and settings