# [System / Module Name] Architecture

## Purpose

Describe why this system exists.

---

# Business Goal

Explain business purpose.

Example:
This module handles inventory movement and stock tracking across warehouses.

---

# Technical Goal

Explain engineering responsibility.

Example:
Provide scalable stock movement tracking with accounting integration.

---

# Architecture Overview

High level architecture summary.

---

# Main Components

| Component  | Responsibility   |
| ---------- | ---------------- |
| Routes     | API endpoints    |
| Controller | Request handling |
| Service    | Business logic   |
| Model      | Database schema  |
| Worker     | Background jobs  |

---

# Request Lifecycle

Client
↓
Route
↓
Middleware
↓
Controller
↓
Service
↓
Database
↓
Response

---

# Folder Structure

```txt
src/modules/[module-name]/
```

| Folder      | Purpose          |
| ----------- | ---------------- |
| routes      | API definitions  |
| controllers | Request handlers |
| services    | Business logic   |
| models      | Database schemas |
| utils       | Shared helpers   |

---

# Main Workflows

## Workflow 1

Explain flow step-by-step.

---

## Workflow 2

Explain flow step-by-step.

---

# Database Design

## Collections / Tables

| Name     | Purpose            |
| -------- | ------------------ |
| users    | User records       |
| vouchers | Accounting entries |

---

# Relationships

Explain model relationships.

---

# External Dependencies

| Dependency | Purpose          |
| ---------- | ---------------- |
| Redis      | Queue management |
| S3         | File storage     |

---

# Validation Rules

List important validations.

---

# Security Considerations

List:

- auth rules
- permission checks
- scoped access

---

# Performance Considerations

List:

- indexing
- caching
- pagination
- heavy queries

---

# Current Limitations

List existing weaknesses.

---

# Future Improvements

List planned upgrades.

---

# Related Documents

| Document              | Purpose           |
| --------------------- | ----------------- |
| auth-audit.md         | Audit report      |
| auth-refactor-plan.md | Refactor planning |
