# Data models

This app stores its appointments in a model of its own. The model must exist in ConsulPoint
before the app can write to it: create it in the app's **Models** tab, with the name and the
schema below.

> A model's name cannot be changed once it is created. Use it exactly as written here.

## `appointment` — Appointment

An appointment booked for a contact: when it is, how long it lasts and what state it is in.

| Field             | Type    | Required | Notes                                                       |
| ----------------- | ------- | -------- | ----------------------------------------------------------- |
| `contactName`     | string  | Yes      | The person's name, as shown in the agenda                   |
| `contactId`       | string  | No       | The contact's id, when it was picked from the contacts list |
| `date`            | string  | Yes      | Day, as `YYYY-MM-DD`                                        |
| `time`            | string  | Yes      | Local time, as 24-hour `HH:mm`                              |
| `durationMinutes` | integer | Yes      | Length in minutes                                           |
| `status`          | string  | Yes      | `pending`, `confirmed` or `cancelled`                       |
| `reason`          | string  | No       | What the appointment is for                                 |
| `notes`           | string  | No       | Internal notes                                              |
| `createdById`     | string  | No       | The user who booked it                                      |
| `createdByName`   | string  | No       | That user's name at the time of booking                     |
| `chatId`          | string  | No       | The conversation it was booked from, if any                 |

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["contactName", "date", "time", "durationMinutes", "status"],
  "additionalProperties": false,
  "properties": {
    "contactName": { "type": "string", "minLength": 1, "maxLength": 200 },
    "contactId": { "type": "string" },
    "date": { "type": "string", "pattern": "^\\d{4}-\\d{2}-\\d{2}$" },
    "time": { "type": "string", "pattern": "^\\d{2}:\\d{2}$" },
    "durationMinutes": { "type": "integer", "minimum": 5, "maximum": 480 },
    "status": { "type": "string", "enum": ["pending", "confirmed", "cancelled"] },
    "reason": { "type": "string", "maxLength": 120 },
    "notes": { "type": "string", "maxLength": 500 },
    "createdById": { "type": "string" },
    "createdByName": { "type": "string" },
    "chatId": { "type": "string" }
  }
}
```

## When you change the model

The `Appointment` type in `src/features/appointments/types.ts` mirrors this schema. When you
add, remove or rename a field, update all three places: the schema in ConsulPoint, this file
and the type.
