# Slack List Channels - Usage Guide

## Overview

This module provides a function to list all Slack team channels with various filtering options including channel name, type, archived status, and pagination support.

## Installation/Import

```typescript
import { request as listSlackChannels } from '@/sdk/mcp-clients/688338e4ee9e1a9340d83b62/SLACK_LIST_ALL_SLACK_TEAM_CHANNELS_WITH_VARIOUS_FILTERS';
```

## Function Signature

```typescript
async function request(params: ListChannelsParams): Promise<ListChannelsData>
```

## Parameters

### `ListChannelsParams`

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `channel_name` | `string` | No | - | Filter channels by name (case-insensitive substring match) |
| `cursor` | `string` | No | - | Pagination cursor from previous response's `next_cursor` |
| `exclude_archived` | `boolean` | No | `false` | Excludes archived channels if true |
| `limit` | `number` | No | `1` | Maximum channels per page (1-1000) |
| `types` | `string` | No | `"public_channel"` | Comma-separated channel types: `public_channel`, `private_channel`, `mpim`, `im` |

### Channel Types

- `public_channel` - Public channels visible to all workspace members
- `private_channel` - Private channels with restricted membership
- `mpim` - Multi-person direct messages
- `im` - Direct messages between two users

## Return Value

### `ListChannelsData`

```typescript
{
  ok: boolean;                          // API call success indicator
  channels: ChannelItem[];              // Array of channel objects
  response_metadata?: {                 // Pagination metadata
    next_cursor?: string | null;        // Cursor for next page (null if no more pages)
  } | null;
}
```

### `ChannelItem` Properties

Key properties of each channel object:

- `id` - Channel identifier
- `name` - Channel name (without leading #)
- `is_channel`, `is_group`, `is_im`, `is_mpim` - Channel type flags
- `is_private` - Privacy status
- `is_archived` - Archive status
- `is_member` - Whether the authenticated user is a member
- `num_members` - Member count
- `created` - Creation timestamp
- `creator` - Creator user ID
- `topic` - Channel topic object
- `purpose` - Channel purpose object

## Usage Examples

### Example 1: Get First 100 Public Channels

```typescript
import { request as listSlackChannels } from '@/sdk/mcp-clients/688338e4ee9e1a9340d83b62/SLACK_LIST_ALL_SLACK_TEAM_CHANNELS_WITH_VARIOUS_FILTERS';

async function getPublicChannels() {
  try {
    const result = await listSlackChannels({
      limit: 100,
      types: 'public_channel',
      exclude_archived: true
    });
    
    console.log(`Found ${result.channels.length} channels`);
    result.channels.forEach(channel => {
      console.log(`- ${channel.name} (${channel.num_members} members)`);
    });
    
    // Check if there are more pages
    if (result.response_metadata?.next_cursor) {
      console.log('More channels available');
    }
  } catch (error) {
    console.error('Failed to list channels:', error);
  }
}
```

### Example 2: Paginate Through All Channels

```typescript
import { request as listSlackChannels } from '@/sdk/mcp-clients/688338e4ee9e1a9340d83b62/SLACK_LIST_ALL_SLACK_TEAM_CHANNELS_WITH_VARIOUS_FILTERS';

async function getAllChannels() {
  const allChannels = [];
  let cursor: string | undefined = undefined;
  
  try {
    do {
      const result = await listSlackChannels({
        limit: 200,
        types: 'public_channel,private_channel',
        exclude_archived: true,
        cursor
      });
      
      allChannels.push(...result.channels);
      cursor = result.response_metadata?.next_cursor || undefined;
      
    } while (cursor);
    
    console.log(`Total channels retrieved: ${allChannels.length}`);
    return allChannels;
    
  } catch (error) {
    console.error('Failed to retrieve all channels:', error);
    throw error;
  }
}
```

### Example 3: Filter Channels by Name

```typescript
import { request as listSlackChannels } from '@/sdk/mcp-clients/688338e4ee9e1a9340d83b62/SLACK_LIST_ALL_SLACK_TEAM_CHANNELS_WITH_VARIOUS_FILTERS';

async function findChannelsByName(searchTerm: string) {
  try {
    const result = await listSlackChannels({
      channel_name: searchTerm,
      limit: 50,
      types: 'public_channel,private_channel'
    });
    
    return result.channels.filter(channel => 
      channel.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    console.error('Failed to search channels:', error);
    throw error;
  }
}
```

### Example 4: Get All Channel Types

```typescript
import { request as listSlackChannels } from '@/sdk/mcp-clients/688338e4ee9e1a9340d83b62/SLACK_LIST_ALL_SLACK_TEAM_CHANNELS_WITH_VARIOUS_FILTERS';

async function getAllChannelTypes() {
  try {
    const result = await listSlackChannels({
      limit: 1000,
      types: 'public_channel,private_channel,mpim,im',
      exclude_archived: false
    });
    
    const categorized = {
      public: result.channels.filter(c => c.is_channel && !c.is_private),
      private: result.channels.filter(c => c.is_private && !c.is_mpim && !c.is_im),
      mpim: result.channels.filter(c => c.is_mpim),
      dm: result.channels.filter(c => c.is_im)
    };
    
    console.log('Channel breakdown:');
    console.log(`- Public: ${categorized.public.length}`);
    console.log(`- Private: ${categorized.private.length}`);
    console.log(`- Group DMs: ${categorized.mpim.length}`);
    console.log(`- Direct Messages: ${categorized.dm.length}`);
    
    return categorized;
  } catch (error) {
    console.error('Failed to categorize channels:', error);
    throw error;
  }
}
```

## Error Handling

The function may throw errors in the following scenarios:

1. **Invalid MCP Response**: When the MCP tool returns an unexpected response format
   ```typescript
   Error: 'Invalid MCP response format: missing content[0].text'
   ```

2. **JSON Parse Error**: When the response cannot be parsed as JSON
   ```typescript
   Error: 'Failed to parse MCP response JSON: [parse error details]'
   ```

3. **Tool Execution Failure**: When the Slack API returns an error
   ```typescript
   Error: [error message from Slack API]
   ```

4. **Missing Data**: When the tool succeeds but returns no data
   ```typescript
   Error: 'MCP tool returned successful response but no data'
   ```

### Recommended Error Handling Pattern

```typescript
try {
  const result = await listSlackChannels(params);
  // Process result
} catch (error) {
  if (error instanceof Error) {
    console.error('Channel listing failed:', error.message);
    
    // Handle specific error cases
    if (error.message.includes('Invalid MCP response')) {
      // Handle MCP communication error
    } else if (error.message.includes('parse')) {
      // Handle JSON parsing error
    } else {
      // Handle Slack API error
    }
  }
  throw error;
}
```

## Notes

- The `channel_name` filter is applied client-side after fetching from the API
- Default limit is 1 if not specified (recommended to set higher for better performance)
- Use pagination with `cursor` for retrieving large channel lists
- The `types` parameter defaults to `public_channel` if omitted
- Archived channels are included by default unless `exclude_archived` is set to `true`
- Some properties (like `unread_count`) are only included for specific channel types (e.g., DMs)

## Related Types

- `ChannelItem` - Individual channel object with all properties
- `ChannelPurpose` - Channel purpose metadata
- `ChannelTopic` - Channel topic metadata
- `ResponseMetadata` - Pagination metadata