# Stage 1

## Notification System REST API Design

### Base URL

```txt
http://localhost:3000/api
```

---

# 1. Get All Notifications

## Endpoint

```http
GET /notifications
```

## Query Parameters

| Parameter | Type | Description |
|---|---|---|
| page | number | Page number |
| limit | number | Notifications per page |
| notification_type | string | Event / Result / Placement |

## Request Headers

```json
{
  "Content-Type": "application/json"
}
```

## Response

```json
{
  "notifications": [
    {
      "id": "uuid",
      "studentId": "22MIS0622",
      "type": "Placement",
      "message": "Amazon hiring for SDE",
      "isRead": false,
      "createdAt": "2026-05-16T12:00:00Z"
    }
  ],
  "page": 1,
  "limit": 10,
  "total": 100
}
```

---

# 2. Get Notification By ID

## Endpoint

```http
GET /notifications/:id
```

## Response

```json
{
  "id": "uuid",
  "studentId": "22MIS0622",
  "type": "Event",
  "message": "Hackathon starts tomorrow",
  "isRead": true,
  "createdAt": "2026-05-16T12:00:00Z"
}
```

---

# 3. Mark Notification As Read

## Endpoint

```http
PATCH /notifications/:id/read
```

## Response

```json
{
  "message": "Notification marked as read"
}
```

---

# 4. Create Notification

## Endpoint

```http
POST /notifications
```

## Request Body

```json
{
  "studentIds": ["22MIS0622"],
  "type": "Placement",
  "message": "Microsoft hiring drive"
}
```

## Response

```json
{
  "message": "Notification created successfully"
}
```

---

# 5. Notify All Students

## Endpoint

```http
POST /notifications/notify-all
```

## Request Body

```json
{
  "message": "Placement drive starts tomorrow",
  "type": "Placement"
}
```

## Response

```json
{
  "message": "Notifications queued successfully"
}
```

---

# Real-Time Notification Mechanism

The application will use WebSockets for real-time notifications.

## Why WebSockets?

- Supports bidirectional communication
- Low latency notification delivery
- Efficient for large scale real-time systems
- Suitable for instant placement and result alerts

## Workflow

1. Student connects to WebSocket server
2. Backend stores active connections
3. When HR sends notification:
   - Notification saved in database
   - Real-time event pushed instantly
4. Frontend updates UI without refresh

---

# Logging Middleware Usage

All APIs will extensively use the reusable logging middleware.

## Examples

```ts
Log("backend", "info", "route", "Fetched notifications");

Log("backend", "error", "service", "Notification creation failed");
```