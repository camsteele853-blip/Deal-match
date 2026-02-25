# Slack List All Team Users with Pagination

## Overview

This module provides a function to list all users in a Slack workspace with pagination support. It retrieves comprehensive user information including profiles, roles, permissions, and status.

## Installation/Import

```typescript
import { request as listSlackUsers } from '@/sdk/mcp-clients/688338e4ee9e1a9340d83b62/SLACK_LIST_ALL_SLACK_TEAM_USERS_WITH_PAGINATION';
```

## Function Signature

```typescript
async function request(params: ListAllUsersParams): Promise<ListAllUsersData>
```

## Parameters

### `ListAllUsersParams`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `cursor` | `string` | No | Pagination cursor from previous response's `response_metadata.next_cursor`. Omit for first page. |
| `include_locale` | `boolean` | No | Include locale field for each user. Defaults to `false`. |
| `limit` | `number` | No | Maximum users per page. Recommended: 100-200 for large workspaces. Default: 1. |

## Return Value

### `ListAllUsersData`

Returns an object containing:

- **`ok`** (`boolean`): Whether the API call was successful
- **`members`** (`SlackUser[]`): Array of user objects with detailed information
- **`response_metadata`** (`ResponseMetadata | null`): Pagination info including `next_cursor`
- **`cache_ts`** (`number | null`): Timestamp when user list was cached
- **`error`** (`string | null`): Error code if request failed
- **`warning`** (`string | null`): Warning message if applicable
- **`warnings`** (`string[] | null`): Array of warning codes

### `SlackUser` Object

Each user object includes:

- **`id`** (`string`): Unique user identifier
- **`team_id`** (`string`): Workspace identifier
- **`name`** (`string | null`): Legacy username (deprecated)
- **`real_name`** (`string | null`): User's full name
- **`profile`** (`UserProfile | null`): Detailed profile information
- **`is_admin`** (`boolean | null`): Admin status
- **`is_owner`** (`boolean | null`): Owner status
- **`is_bot`** (`boolean | null`): Bot indicator
- **`deleted`** (`boolean | null`): Account deactivation status
- **`tz`** (`string | null`): Timezone identifier
- And many more fields...

## Usage Examples

### Example 1: Fetch First Page of Users

```typescript
import { request as listSlackUsers } from '@/sdk/mcp-clients/688338e4ee9e1a9340d83b62/SLACK_LIST_ALL_SLACK_TEAM_USERS_WITH_PAGINATION';

async function getUsers() {
  try {
    const result = await listSlackUsers({ 
      limit: 100,
      include_locale: true 
    });
    
    console.log(`Found ${result.members.length} users`);
    
    result.members.forEach(user => {
      console.log(`${user.real_name} (${user.profile?.email})`);
    });
    
    // Check if there are more pages
    if (result.response_metadata?.next_cursor) {
      console.log('More users available on next page');
    }
  } catch (error) {
    console.error('Failed to fetch users:', error);
  }
}
```

### Example 2: Paginate Through All Users

```typescript
import { request as listSlackUsers } from '@/sdk/mcp-clients/688338e4ee9e1a9340d83b62/SLACK_LIST_ALL_SLACK_TEAM_USERS_WITH_PAGINATION';

async function getAllUsers() {
  const allUsers = [];
  let cursor: string | undefined = undefined;
  
  try {
    do {
      const result = await listSlackUsers({ 
        cursor,
        limit: 200 
      });
      
      allUsers.push(...result.members);
      
      // Get cursor for next page
      cursor = result.response_metadata?.next_cursor || undefined;
      
      // Empty string means no more pages
      if (cursor === '') {
        cursor = undefined;
      }
      
    } while (cursor);
    
    console.log(`Total users fetched: ${allUsers.length}`);
    return allUsers;
    
  } catch (error) {
    console.error('Failed to fetch all users:', error);
    throw error;
  }
}
```

### Example 3: Filter Active Admin Users

```typescript
import { request as listSlackUsers } from '@/sdk/mcp-clients/688338e4ee9e1a9340d83b62/SLACK_LIST_ALL_SLACK_TEAM_USERS_WITH_PAGINATION';

async function getActiveAdmins() {
  try {
    const result = await listSlackUsers({ limit: 100 });
    
    const activeAdmins = result.members.filter(user => 
      user.is_admin && 
      !user.deleted && 
      !user.is_bot
    );
    
    console.log('Active admin users:');
    activeAdmins.forEach(admin => {
      console.log(`- ${admin.real_name} (${admin.profile?.email})`);
    });
    
    return activeAdmins;
    
  } catch (error) {
    console.error('Failed to fetch admin users:', error);
    throw error;
  }
}
```

## Error Handling

The function may throw errors in the following scenarios:

1. **Invalid MCP Response**: When the MCP tool returns malformed data
   ```typescript
   Error: 'Invalid MCP response format: missing content[0].text'
   ```

2. **JSON Parse Error**: When the response cannot be parsed as JSON
   ```typescript
   Error: 'Failed to parse MCP response JSON: [error details]'
   ```

3. **Tool Execution Failure**: When the Slack API returns an error
   ```typescript
   Error: 'MCP tool execution failed' or specific error from toolData.error
   ```

4. **Missing Data**: When successful response contains no data
   ```typescript
   Error: 'MCP tool returned successful response but no data'
   ```

### Handling Errors

```typescript
try {
  const users = await listSlackUsers({ limit: 100 });
  // Process users...
} catch (error) {
  if (error instanceof Error) {
    console.error('Error message:', error.message);
    
    // Handle specific error cases
    if (error.message.includes('parse')) {
      console.error('Response parsing failed');
    } else if (error.message.includes('execution failed')) {
      console.error('Slack API error');
    }
  }
}
```

## Common Use Cases

1. **User Directory**: Build a searchable directory of workspace members
2. **Admin Dashboard**: Display workspace admins and owners
3. **User Analytics**: Analyze user distribution, timezones, and activity
4. **Onboarding**: Identify new users or pending invitations
5. **Compliance**: Export user data for auditing purposes
6. **Bot Detection**: Filter out bot users from human users

## Notes

- **Pagination**: Always use `limit` parameter (100-200) for large workspaces to avoid timeouts
- **Scopes Required**: Requires `users:read` OAuth scope; `users:read.email` for email addresses
- **Rate Limits**: Slack API has rate limits; implement appropriate delays between requests
- **Cursor Pagination**: Empty string in `next_cursor` indicates no more pages
- **Deleted Users**: Deleted users are included in results; filter by `deleted` field if needed
- **Bot Users**: Bot users are included; filter by `is_bot` field if needed