# Ledger Logic: Personal Envelope Budgeting

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-v14%2B-green)](https://nodejs.org/)
[![Database: SQLite](https://img.shields.io/badge/Database-SQLite-blue)](https://sqlite.org/)

**LedgerLogic** is a full-stack budgeting tool based on the "Envelope Method." It allows users to divide their income into specific categories, track real-time spending, and perform fund rollovers (Sweeps) to ensure maximum financial efficiency.

---

## Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | Vanilla JavaScript (ES6+), HTML5, CSS3 (Neo-brutalist Design) |
| **Backend** | Node.js, Express.js |
| **Database** | SQLite3 |
| **API** | RESTful Architecture |

---

## Getting Started

### Prerequisites
- Node.js installed on your machine.
- A modern web browser.

### Installation
1. **Clone/Download** the repository to your local machine.
2. Open your terminal and **install dependencies**: npm install
3.Initialize the Database (this creates your budget.sqlite file and adds initial categories): node seed.js
4.Start the server: node server.js
5.View the app at http://localhost:3000.

### API Endpoints
### Envelopes
- GET /api/envelopes - Retrieve all budget categories.

- POST /api/envelopes - Create a new budget category.

- PUT /api/envelopes/:id - Update an existing envelope.

- DELETE /api/envelopes/:id - Remove an envelope.

Transactions
- POST /api/envelopes/:id/spend - Subtract an amount from a specific envelope.

- POST /api/envelopes/sweep - Transfer all remaining balances from every envelope into a single destination.

### Database Schema
The SQLite database consists of a single table envelopes:

- id: Primary Key (Autoincrement)

- title: String (Unique category name)

- budget: Numeric (Current balance)

### Key Design Decisions
- Single-Service Architecture: The backend serves the static frontend files via express.static, allowing for a single-click deployment on platforms like Render.

- Relational Integrity: Used db.serialize() in the Sweep logic to ensure transaction safety, preventing funds from being "lost" during transfers.

- UI/UX: Implemented a Neo-brutalist CSS design for a bold, high-contrast look that highlights financial data without unnecessary bloat.
