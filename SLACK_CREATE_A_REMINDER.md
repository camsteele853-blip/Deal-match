# Slack Create Reminder - Usage Guide

## Overview

This module provides a TypeScript interface for creating reminders in Slack using the MCP (Model Context Protocol) tool. You can create one-time or recurring reminders for yourself or other users (bot tokens only).

## Installation & Import

```typescript
import { request as createSlackReminder } from '@/sdk/mcp-clients/688338e4ee9e1a9340d83b62/SLACK_CREATE_A_REMINDER';
```

## Function Signature

```typescript
async function request(params: CreateReminderParams): Promise<CreateReminderData>
```

## Parameters

### `CreateReminderParams`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `text` | `string` | ✅ Yes | The textual content of the reminder message |
| `time` | `string` | ✅ Yes | When the reminder should occur (Unix timestamp, relative time, or natural language) |
| `user` | `string` | ❌ No | The ID of the user who will receive the reminder (defaults to creator) |
| `team_id` | `string` | ❌ No | Encoded team id for org-level tokens |
| `recurrence` | `ReminderRecurrence` | ❌ No | Recurrence settings for the reminder |

### `ReminderRecurrence`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `frequency` | `string` | ✅ Yes | The frequency: "daily", "weekly", "monthly", or "yearly" |
| `weekdays` | `string[]` | ❌ No | Days of the week (if frequency is "weekly") |

### Time Parameter Examples

- **Unix timestamp**: `"1735689600"` (up to 5 years from now)
- **Relative seconds**: `"900"` (15 minutes, if within 24 hours)
- **Natural language**: `"in 20 minutes"`, `"every Monday at 10am"`, `"daily"`

## Return Value

### `CreateReminderData`

```typescript
{
  ok: boolean;              // Whether the API call was successful
  error?: string;           // Error code if ok is false
  reminder?: {              // The created reminder object
    id: string;             // Unique identifier (e.g., 'Rm12345678')
    creator: string;        // User ID of the creator
    user: string;           // User ID of the recipient
    text: string;           // Reminder content
    recurring: boolean;     // Whether the reminder recurs
    time?: number;          // Unix timestamp (non-recurring only)
    complete_ts?: number;   // Completion timestamp (non-recurring only)
  }
}
```

## Usage Examples

### Example 1: Simple One-Time Reminder

```typescript
import { request as createSlackReminder } from '@/sdk/mcp-clients/688338e4ee9e1a9340d83b62/SLACK_CREATE_A_REMINDER';

async function createSimpleReminder() {
  try {
    const result = await createSlackReminder({
      text: 'Submit weekly report',
      time: 'in 20 minutes'
    });
    
    console.log('Reminder created:', result.reminder?.id);
  } catch (error) {
    console.error('Failed to create reminder:', error);
  }
}
```

### Example 2: Recurring Weekly Reminder

```typescript
import { request as createSlackReminder } from '@/sdk/mcp-clients/688338e4ee9e1a9340d83b62/SLACK_CREATE_A_REMINDER';

async function createRecurringReminder() {
  try {
    const result = await createSlackReminder({
      text: 'Team standup meeting',
      time: 'every Monday at 10am',
      recurrence: {
        frequency: 'weekly',
        weekdays: ['monday', 'wednesday', 'friday']
      }
    });
    
    if (result.ok) {
      console.log('Recurring reminder created successfully');
      console.log('Reminder ID:', result.reminder?.id);
    }
  } catch (error) {
    console.error('Failed to create recurring reminder:', error);
  }
}
```

### Example 3: Reminder for Another User (Bot Token Required)

```typescript
import { request as createSlackReminder } from '@/sdk/mcp-clients/688338e4ee9e1a9340d83b62/SLACK_CREATE_A_REMINDER';

async function createReminderForUser() {
  try {
    const result = await createSlackReminder({
      text: 'Follow up with client',
      time: '1735689600', // Unix timestamp
      user: 'U012AB3CD4E' // Target user ID
    });
    
    console.log('Reminder created for user:', result.reminder?.user);
  } catch (error) {
    console.error('Failed to create reminder:', error);
  }
}
```

### Example 4: Daily Reminder

```typescript
import { request as createSlackReminder } from '@/sdk/mcp-clients/688338e4ee9e1a9340d83b62/SLACK_CREATE_A_REMINDER';

async function createDailyReminder() {
  try {
    const result = await createSlackReminder({
      text: 'Review daily metrics',
      time: 'daily',
      recurrence: {
        frequency: 'daily'
      }
    });
    
    if (result.ok && result.reminder) {
      console.log('Daily reminder created');
      console.log('Recurring:', result.reminder.recurring);
    }
  } catch (error) {
    console.error('Failed to create daily reminder:', error);
  }
}
```

## Error Handling

The function throws errors in the following cases:

1. **Missing Required Parameters**: If `text` or `time` is not provided
2. **Invalid Recurrence**: If `recurrence` is provided but missing `frequency`
3. **MCP Response Errors**: If the MCP tool returns an error response
4. **API Errors**: Various Slack API errors including:
   - `cannot_add_bot`: Reminders cannot target bots
   - `cannot_add_others`: Guests cannot set reminders for team members
   - `cannot_parse`: Timing phrasing is unclear
   - `missing_scope`: Token lacks required permissions
   - `not_authed`: No authentication token provided
   - `user_not_found`: Specified user cannot be located
   - `invalid_auth`: Invalid authentication

### Error Handling Example

```typescript
try {
  const result = await createSlackReminder({
    text: 'Important task',
    time: 'tomorrow at 9am'
  });
  
  if (!result.ok) {
    console.error('Slack API error:', result.error);
  } else {
    console.log('Success:', result.reminder);
  }
} catch (error) {
  if (error instanceof Error) {
    console.error('Error:', error.message);
  }
}
```

## Important Notes

- **User Tokens**: Setting reminders for other users is no longer supported with user tokens. Only bot tokens can create reminders for other users.
- **Time Format Flexibility**: The `time` parameter accepts multiple formats for maximum flexibility.
- **Recurring Reminders**: When creating recurring reminders, the `time` and `complete_ts` fields will not be present in the response.
- **Workspace Context**: Use `team_id` when working with org-level tokens to specify the target workspace.

## TypeScript Types

All TypeScript interfaces are exported and can be imported:

```typescript
import type { 
  CreateReminderParams, 
  CreateReminderData, 
  SlackReminder,
  ReminderRecurrence 
} from '@/sdk/mcp-clients/688338e4ee9e1a9340d83b62/SLACK_CREATE_A_REMINDER';
```