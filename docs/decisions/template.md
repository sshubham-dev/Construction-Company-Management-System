# ADR-001 - MongoDB Database Selection

## Status
Accepted

## Context
ERP backend requires flexible schema handling for evolving voucher structures.

---

# Decision
MongoDB selected as primary database.

---

# Reasoning
- flexible schema
- rapid iteration
- aggregation support

---

# Tradeoffs
- complex joins harder
- transaction handling more complex

---

# Alternatives Considered
- PostgreSQL
- MySQL

---

# Future Concerns
Large reporting systems may require optimization or hybrid architecture.