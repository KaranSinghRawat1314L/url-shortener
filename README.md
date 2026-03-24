# URL Shortener Service

## Overview

This project implements a URL shortener system that generates short, unique URLs for long URLs and redirects users efficiently. The system is designed to handle **high read traffic**, provide low-latency redirection, and scale horizontally.

The project was initially deployed on **AWS EC2** using an **Application Load Balancer (ALB)** and **ElastiCache Redis**. Later, the deployment was migrated to a modern stack:

* **Frontend:** React app hosted on S3
* **Backend:** Node.js (Express) hosted on Render
* **Cache:** Upstash Redis (free tier)
* **Persistent storage:** DynamoDB

## Features

* Generate unique short URLs for long URLs
* Redirect short URLs to the original URL
* Optional URL expiration
* Track click counts
* High availability and scalability

## Architecture

### Components

1. **React Frontend** – Provides a user interface to create and access short URLs.
2. **Node.js Backend** – Handles business logic, validation, and URL mapping.
3. **Redis Cache** – Stores `shortCode → longURL` mappings for fast redirection.
4. **DynamoDB** – Persistent data store and source of truth.

### Request Flow

#### URL Creation (Write Path)

1. Client sends `longURL` and optional expiration.
2. Backend validates input.
3. Unique short code is generated.
4. Expiration is converted to an absolute timestamp.
5. URL mapping is stored in DynamoDB.
6. Short URL is returned.

#### URL Redirection (Read Path)

1. Client requests a short URL.
2. Backend checks Redis cache.

   * **Cache hit:** Redirect immediately.
   * **Cache miss:** Fetch from DynamoDB, validate expiration, cache result in Redis, redirect.
3. Click count is incremented asynchronously.

### Expiration Handling

* Expired URLs return **410 Gone**.
* Redis evicts expired entries automatically using TTL.
* DynamoDB TTL deletes records asynchronously.

### Failure Handling

* If Redis is unavailable, DynamoDB is used as a fallback.
* Backend is stateless for seamless failover.

## Scalability and Reliability

* Initially deployed on **EC2** with **ALB** for load balancing and **ElastiCache Redis** for caching.
* Current deployment uses **Render** with automatic horizontal scaling; no separate load balancer is required.
* Redis reduces read pressure on DynamoDB.
* DynamoDB auto-scales and is highly available.
* No single point of failure.

## Security Considerations

* Input URLs validated
* HTTPS enforced
* No sensitive user data stored

## Observability

* Application logs for errors and request flow
* Metrics for redirect latency, cache hit/miss ratio, and error rates

## Development Setup

### Prerequisites

* Node.js >= 18
* npm or yarn
* AWS account with DynamoDB access
* Upstash Redis account (or any Redis)

### Backend Setup

```bash
# Clone repository
git clone https://github.com/KaranSinghRawat1314L/url-shortener.git

# Install dependencies
npm install

# Create a .env file
# Example .env
# PORT=5000
# REDIS_URL=<upstash-redis-url>
# DYNAMODB_REGION=<aws-region>
# AWS_ACCESS_KEY_ID=<your-access-key>
# AWS_SECRET_ACCESS_KEY=<your-secret-key>

# Start backend server
npm start OR node index.js
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Update API endpoint in src/config.js
# Example: export const API_BASE_URL = 'https://your-render-backend-url.com';

# Start frontend locally
npm start
```

### Deployment

* **Frontend:** Build React app and host in **S3** (static hosting).
* **Backend:** Deploy Node.js server on **Render** with automatic horizontal scaling.
* **Redis:** Use **Upstash Redis** (free tier) for caching.
* **DynamoDB:** Used for persistent storage.

## Data Model

**DynamoDB Table: `URLMappings`**

| Attribute  | Type   | Description                        |
| ---------- | ------ | ---------------------------------- |
| shortCode  | String | Partition key, unique short code   |
| longURL    | String | Original URL                       |
| createdAt  | Number | Timestamp of creation              |
| expiresAt  | Number | Optional expiration timestamp      |
| ttl        | Number | DynamoDB TTL for automatic cleanup |
| clickCount | Number | Number of redirects                |

**Redis:**

* Key: `shortCode`
* Value: `longURL`
* TTL aligned to expiration

## Notes on Costs

* **Redis:** Upstash free tier used (ElastiCache was used initially on EC2)
* **DynamoDB:** Pay-as-you-go; minimal cost for low traffic
* **Frontend S3 hosting:** Free or minimal cost depending on AWS tier
* **Backend Render:** Free tier available (EC2 was used initially with ALB)

## Summary

This URL shortener system is **production-ready**, designed for **high performance, scalability, and reliability**. The development process emphasizes **stateless services**, caching with Redis, and persistent storage using DynamoDB. The system was **initially deployed on EC2 with ALB and ElastiCache** for caching, but is now running on **Render with automatic scaling**, removing the need for a separate load balancer.
