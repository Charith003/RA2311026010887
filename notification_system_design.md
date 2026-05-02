# Notification System Design

## Stage 1

### Goal
Compute and display the **top 10 most important unread notifications** based on:
1. **Type weight**: Placement > Result > Event
2. **Recency**: newer notifications should rank higher

### Priority Model
A score is assigned to each notification:

`priority_score = (type_weight * 10) + recency_normalized`

Where:
- Placement = 3, Result = 2, Event = 1
- `recency_normalized` is scaled between 0 and 1 using min/max timestamp from fetched notifications.

### Efficient Maintenance for Continuous Arrivals
To maintain top-10 efficiently as new notifications arrive continuously:

1. Keep a **min-heap of size 10** keyed by `priority_score`.
2. For each new notification:
   - compute score in O(1)
   - if heap size < 10, push
   - else compare with heap root (smallest top-10 score)
     - if greater, pop root and push new item
3. Resulting complexity:
   - **Per notification**: O(log 10) ≈ O(1)
   - **Memory**: O(10)

This avoids sorting all notifications repeatedly and supports streaming updates.

### Logging Integration
All important steps should call reusable middleware function:

`Log(stack, level, package, message)`

Examples:
- fetch start/success/failure
- ranking completion
- validation errors

### Stage 1 Execution Notes
- Fetch notifications from protected API using bearer token.
- Do not hard-code or manually create notifications.
- Do not persist in DB.
