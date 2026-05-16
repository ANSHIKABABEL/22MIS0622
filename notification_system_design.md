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




# Stage 2

# Persistent Storage Choice

I would use PostgreSQL as the primary persistent database.

## Why PostgreSQL?

- Strong ACID compliance
- Reliable relational data storage
- Excellent indexing support
- Efficient querying for notifications
- Supports scaling and partitioning
- Suitable for structured notification systems

---

# Database Schema

## Students Table

```sql
CREATE TABLE students (
    student_id VARCHAR(20) PRIMARY KEY,
    student_name VARCHAR(100),
    email VARCHAR(100)
);
```

---

## Notifications Table

```sql
CREATE TYPE notification_type AS ENUM (
    'Event',
    'Result',
    'Placement'
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    student_id VARCHAR(20),
    notification_type notification_type,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id)
);
```

---

# Suggested Indexes

```sql
CREATE INDEX idx_student_read
ON notifications(student_id, is_read);

CREATE INDEX idx_created_at
ON notifications(created_at);

CREATE INDEX idx_notification_type
ON notifications(notification_type);
```

---

# Problems As Data Volume Increases

As the number of students and notifications increases, the following problems may occur:

- Slow query execution
- Increased database load
- High memory consumption
- Slower sorting and filtering
- API response delays
- Higher concurrent read traffic

---

# Solutions For Scaling

## 1. Indexing

Indexes improve query performance for frequently searched fields.

---

## 2. Pagination

Instead of loading all notifications together:

```http
GET /notifications?page=1&limit=10
```

This reduces memory and response time.

---

## 3. Database Partitioning

Partition notifications table based on:
- date
- student_id

This improves query performance on large datasets.

---

## 4. Caching

Use Redis caching for:
- unread notifications
- frequently accessed notifications

This reduces database load significantly.

---

## 5. Read Replicas

Use database read replicas for heavy read traffic.

Main DB:
- writes

Replica DBs:
- reads

---

# SQL Queries

## Fetch All Notifications

```sql
SELECT *
FROM notifications
WHERE student_id = '22MIS0622'
ORDER BY created_at DESC
LIMIT 10 OFFSET 0;
```

---

## Fetch Unread Notifications

```sql
SELECT *
FROM notifications
WHERE student_id = '22MIS0622'
AND is_read = FALSE
ORDER BY created_at DESC;
```

---

## Mark Notification As Read

```sql
UPDATE notifications
SET is_read = TRUE
WHERE id = 'notification-id';
```

---

## Create Notification

```sql
INSERT INTO notifications (
    id,
    student_id,
    notification_type,
    message
)
VALUES (
    gen_random_uuid(),
    '22MIS0622',
    'Placement',
    'Amazon hiring drive'
);
```

---

# Logging Middleware Integration

Database operations will use logging middleware extensively.

## Examples

```ts
Log("backend", "info", "db", "Fetching notifications from database");

Log("backend", "error", "db", "Database query failed");
```


# Stage 3

# Query Analysis

## Given Query

```sql
SELECT * FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt ASC;
```

---

# Is This Query Accurate?

The query is logically correct because it fetches unread notifications for a student and sorts them by creation time.

However, the query may perform slowly on large datasets.

Current Scale:
- 50,000 students
- 5,000,000 notifications

At this scale, full table scans become expensive.

---

# Why Is The Query Slow?

Possible reasons:

- Missing indexes
- Sorting overhead
- Large dataset scanning
- Fetching unnecessary columns using `SELECT *`

Without proper indexes, the database may scan millions of rows.

Sorting by `createdAt` also increases computation cost.

---

# Optimized Query

```sql
SELECT id, notification_type, message, created_at
FROM notifications
WHERE student_id = 1042
AND is_read = FALSE
ORDER BY created_at DESC
LIMIT 20;
```

---

# Improvements Made

## 1. Avoided SELECT *

Only required columns are fetched.

This reduces:
- memory usage
- network transfer
- query cost

---

## 2. Added LIMIT

Pagination prevents loading massive datasets.

---

## 3. Better Sorting Order

Recent notifications are usually more useful.

Descending order improves user experience.

---

# Recommended Index

```sql
CREATE INDEX idx_student_read_created
ON notifications(student_id, is_read, created_at DESC);
```

---

# Why Composite Index?

This index helps with:
- filtering by `student_id`
- filtering by `is_read`
- sorting by `created_at`

The database can directly use the index without scanning the entire table.

---

# Likely Computation Cost

## Without Index

Time Complexity:

```txt
O(n)
```

Full table scan over millions of rows.

---

## With Composite Index

Approximate Complexity:

```txt
O(log n)
```

Much faster lookup and sorting.

---

# Should We Add Indexes On Every Column?

No.

Adding indexes on every column is not effective.

---

# Problems With Excessive Indexing

## 1. Increased Storage Usage

Indexes consume additional disk space.

---

## 2. Slower Writes

Every insert/update/delete operation must also update indexes.

This increases write latency.

---

## 3. Unused Indexes Waste Resources

Indexes should only be created on:
- frequently filtered columns
- frequently sorted columns
- join columns

---

# Query To Find Students Who Got Placement Notifications In Last 7 Days

```sql
SELECT DISTINCT student_id
FROM notifications
WHERE notification_type = 'Placement'
AND created_at >= NOW() - INTERVAL '7 days';
```

---

# Logging Middleware Usage

Query execution and optimization monitoring will use logging middleware.

## Examples

```ts
Log("backend", "info", "db", "Fetching unread notifications");

Log("backend", "warn", "db", "Slow query detected");

Log("backend", "error", "db", "Database timeout");
```


# Stage 4

# Problem Statement

Notifications are currently fetched from the database on every page load for every student.

This causes:
- excessive database reads
- high response time
- increased server load
- poor user experience

---

# Suggested Solutions

## 1. Redis Caching

Use Redis to cache:
- unread notifications
- recently fetched notifications
- priority notifications

---

# How It Works

1. User requests notifications
2. Backend checks Redis cache
3. If cache exists:
   - return cached data
4. Otherwise:
   - fetch from database
   - store result in Redis
   - return response

---

# Advantages

- Faster response times
- Reduced database load
- Better scalability
- Improved user experience

---

# Tradeoffs

- Additional infrastructure complexity
- Cache invalidation challenges
- Extra memory usage

---

# 2. Pagination

Instead of loading all notifications:

```http
GET /notifications?page=1&limit=10
```

---

# Advantages

- Lower memory consumption
- Faster API responses
- Reduced payload size

---

# Tradeoffs

- Requires additional frontend logic
- Users must navigate between pages

---

# 3. Lazy Loading / Infinite Scrolling

Load notifications gradually as user scrolls.

---

# Advantages

- Better frontend performance
- Improved user experience
- Smaller initial API response

---

# Tradeoffs

- Slightly more frontend complexity
- More API calls

---

# 4. WebSockets For Real-Time Updates

Instead of polling repeatedly, push notifications instantly.

---

# Advantages

- Real-time updates
- Lower repeated API calls
- Better scalability

---

# Tradeoffs

- Persistent socket connection management
- More backend complexity

---

# 5. Read Replicas

Use separate read databases.

Main DB:
- writes

Replica DBs:
- reads

---

# Advantages

- Distributes read load
- Improves scalability

---

# Tradeoffs

- Replication lag
- Additional infrastructure cost

---

# 6. Database Indexing

Indexes on:
- student_id
- is_read
- created_at

Improve query performance significantly.

---

# Tradeoffs

- Increased storage usage
- Slightly slower inserts/updates

---

# 7. CDN And Edge Caching

Static frontend assets can be cached using CDN.

---

# Advantages

- Faster frontend loading
- Reduced backend traffic

---

# Tradeoffs

- Cache invalidation management

---

# Recommended Architecture

For this notification system, the best approach would combine:

- PostgreSQL
- Redis caching
- WebSockets
- Pagination
- Indexed queries
- Read replicas

This provides:
- high scalability
- low latency
- efficient database usage
- better real-time performance

---

# Logging Middleware Usage

Performance optimization events should be logged.

## Examples

```ts
Log("backend", "info", "cache", "Notifications fetched from Redis cache");

Log("backend", "warn", "db", "High database load detected");

Log("backend", "info", "service", "WebSocket notification pushed");
```