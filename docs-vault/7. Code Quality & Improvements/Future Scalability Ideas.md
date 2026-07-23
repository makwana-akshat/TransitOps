---
title: "Future Scalability Ideas"
aliases: ["Scalability", "Scaling", "Future Enhancements"]
tags: ["#code-quality", "#scaling"]
created: "2026-07-17"
updated: "2026-07-17"
---

# Future Scalability Ideas

As TransitOps grows from managing tens of vehicles to thousands, the current architecture will experience bottlenecks. Here are industry best practices we should adopt to scale.

## 1. Caching Layer (Redis)
- **Problem**: The [[Feature - Dashboard & Analytics|Dashboard]] recalculates Fleet Utilization and Revenue ROI on every page load. Running `SUM()` and `GROUP BY` on a trips table with millions of rows will destroy database performance.
- **Solution**: Implement Redis. The `/api/reports/*` endpoints should check Redis first. If a cache miss occurs, calculate it, store it in Redis with a TTL of 1 hour, and return it.
- **Real-time Compromise**: Dashboard data might be up to an hour stale, which is standard for high-level business analytics.

## 2. Event-Driven Architecture (Background Workers)
- **Problem**: When a trip is marked `COMPLETED`, the API request waits for the database to update the Trip, update the Vehicle status, update the Driver status, and update the odometer. 
- **Solution**: Use **Celery** or **ARQ** (Async Redis Queues). The API simply emits an event `TripCompletedEvent` and returns `200 OK` instantly. A background worker picks up the event and performs the heavy database writes.

## 3. Websockets for Real-Time Fleet Tracking
- **Feature Addition**: To live-track vehicles on a map, polling the backend every 5 seconds via Axios is highly inefficient.
- **Solution**: Implement FastAPI WebSockets. Vehicles push their GPS coordinates to a pub/sub channel (Redis), and the FastAPI WebSocket broadcasts this to any connected React clients looking at the map.

## 4. Read Replicas
- **Database Scaling**: Supabase allows configuring read replicas. We can configure SQLAlchemy to send all HTTP `GET` requests (especially analytical dashboard queries) to a read-replica database, ensuring that heavy reports do not lock tables or slow down HTTP `POST` requests handling incoming trip data on the primary database.
