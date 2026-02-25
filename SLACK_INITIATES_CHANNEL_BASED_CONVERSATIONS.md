# Slack Create Channel - MCP Tool Requestor

Creates a new Slack channel (public or private) using the Slack MCP integration.

## Installation/Import

```typescript
import { request as createSlackChannel } from '@/sdk/mcp-clients/688338e4ee9e1a9340d83b62/SLACK_INITIATES_CHANNEL_BASED_CONVERSATIONS';
```

## Function Signature

```typescript
async function request(params: CreateChannelParams): Promise<CreateChannelData>
```

## Parameters

### `CreateChannelParams`

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `name` | `string` | Yes | Name of the public or private channel to create | `"mychannel"` |
| `is_private` | `boolean \| null` | No | Create a private channel instead of a public one | `true` |
| `team_id` | `string \| null` | No | Encoded team id to create the channel in, required if org token is used | `"T1234567890"` |

## Return Value

Returns a `Promise<CreateChannelData>` containing:

- `ok` (boolean): Indicates whether the request was successful
- `channel` (Conversation | null): The created Slack channel object with properties like:
  - `id`: Channel ID
  - `name`: Channel name
  - `is_private`: Whether the channel is private
  - `created`: Unix timestamp of creation
  - `creator`: User ID of the creator
  - And many other channel properties
- `error` (string | null): Machine-readable error code if the request failed (e.g., `name_taken`, `cannot_create_channel`, `invalid_name`)
- `warning` (string | null): Optional human-readable warning string
- `response_metadata` (object | null): Metadata containing warnings or additional response details

## Usage Examples

### Create a Public Channel

```typescript
import { request as createSlackChannel } from '@/sdk/mcp-clients/688338e4ee9e1a9340d83b62/SLACK_INITIATES_CHANNEL_BASED_CONVERSATIONS';

async function createPublicChannel() {
  try {
    const result = await createSlackChannel({
      name: 'project-updates'
    });
    
    if (result.ok && result.channel) {
      console.log('Channel created:', result.channel.id);
      console.log('Channel name:', result.channel.name);
    }
  } catch (error) {
    console.error('Failed to create channel:', error);
  }
}
```

### Create a Private Channel

```typescript
import { request as createSlackChannel } from '@/sdk/mcp-clients/688338e4ee9e1a9340d83b62/SLACK_INITIATES_CHANNEL_BASED_CONVERSATIONS';

async function createPrivateChannel() {
  try {
    const result = await createSlackChannel({
      name: 'confidential-discussions',
      is_private: true
    });
    
    if (result.ok && result.channel) {
      console.log('Private channel created:', result.channel.id);
      console.log('Is private:', result.channel.is_private);
    }
  } catch (error) {
    console.error('Failed to create private channel:', error);
  }
}
```

### Create a Channel in a Specific Team

```typescript
import { request as createSlackChannel } from '@/sdk/mcp-clients/688338e4ee9e1a9340d83b62/SLACK_INITIATES_CHANNEL_BASED_CONVERSATIONS';

async function createChannelInTeam() {
  try {
    const result = await createSlackChannel({
      name: 'team-announcements',
      team_id: 'T1234567890',
      is_private: false
    });
    
    if (result.ok && result.channel) {
      console.log('Channel created in team:', result.channel.id);
    }
  } catch (error) {
    console.error('Failed to create channel in team:', error);
  }
}
```

## Error Handling

The function may throw errors in the following cases:

1. **Missing Required Parameters**: If the `name` parameter is not provided
   ```typescript
   Error: Missing required parameter: name
   ```

2. **Invalid MCP Response**: If the MCP tool returns an invalid response format
   ```typescript
   Error: Invalid MCP response format: missing content[0].text
   ```

3. **JSON Parse Error**: If the response cannot be parsed as JSON
   ```typescript
   Error: Failed to parse MCP response JSON: [error details]
   ```

4. **Tool Execution Failed**: If the MCP tool execution fails
   ```typescript
   Error: MCP tool execution failed
   ```

5. **Slack API Errors**: If Slack returns an error (accessible via `result.error`):
   - `name_taken`: Channel name already exists
   - `cannot_create_channel`: User lacks permission to create channels
   - `invalid_name`: Channel name is invalid (e.g., contains invalid characters)

### Error Handling Example

```typescript
import { request as createSlackChannel } from '@/sdk/mcp-clients/688338e4ee9e1a9340d83b62/SLACK_INITIATES_CHANNEL_BASED_CONVERSATIONS';

async function safeCreateChannel(channelName: string) {
  try {
    const result = await createSlackChannel({ name: channelName });
    
    if (!result.ok) {
      // Handle Slack API errors
      switch (result.error) {
        case 'name_taken':
          console.error('Channel name already exists');
          break;
        case 'cannot_create_channel':
          console.error('Insufficient permissions to create channel');
          break;
        case 'invalid_name':
          console.error('Invalid channel name format');
          break;
        default:
          console.error('Unknown error:', result.error);
      }
      return null;
    }
    
    return result.channel;
  } catch (error) {
    console.error('Failed to create channel:', error);
    return null;
  }
}
```

## Notes

- Channel names must be lowercase and cannot contain spaces or special characters (except hyphens and underscores)
- Private channels are only visible to invited members
- The `team_id` parameter is required when using an org-level token
- The returned channel object contains extensive metadata about the created channel