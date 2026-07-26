# Bismillah – House of Biryanis & Kebabs

Full-stack project split into two independent parts.

```
bismillah/
├── frontend/    → Plain HTML + CSS + JavaScript (no build step)
└── backend/     → Spring Boot 3 + JDBC + MySQL (Maven)
```

---

## 1. Backend – Spring Boot + JDBC

### Requirements
- Java 17+
- Maven 3.8+
- MySQL 8+ (or MariaDB)

### Setup

1. Create the database and load the schema:

```sql
CREATE DATABASE bismillah CHARACTER SET utf8mb4;
```

2. Edit `backend/src/main/resources/application.properties` with your MySQL username/password.

3. Run:

```bash
cd backend
mvn spring-boot:run
```

Server starts at **http://localhost:8080** and auto-loads `schema.sql` + `data.sql` (menu, rooms, admin PIN).

### REST API
| Method | Path                       | Purpose                        |
|--------|----------------------------|--------------------------------|
| GET    | /api/menu                  | List all menu items            |
| GET    | /api/rooms                 | List rooms + availability      |
| POST   | /api/orders                | Place an order (dine-in / delivery) |
| GET    | /api/orders                | Admin: list all orders         |
| PUT    | /api/orders/{id}/status    | Admin: update order status     |
| POST   | /api/bookings              | Create a table booking         |
| GET    | /api/bookings              | Admin: list bookings           |
| POST   | /api/admin/login           | Verify admin PIN (default 1234)|

CORS is open to `http://localhost:5500` and `http://127.0.0.1:5500` (VS Code Live Server defaults).

---

## 2. Frontend – HTML / CSS / JavaScript

No framework, no build. Just open with a static server.

### Run

Easiest: install the **Live Server** VS Code extension, right-click `frontend/index.html` → *Open with Live Server*.

Or from a terminal:

```bash
cd frontend
python3 -m http.server 5500
```

Then visit **http://localhost:5500**.

### Pages
- `index.html` – Home
- `menu.html` – Full menu
- `dine-in.html` – Pick a room → order
- `order-online.html` – Delivery order + payment mock
- `track.html` – Track order by ID
- `book-table.html` – Reserve a table
- `admin.html` – PIN-protected dashboard with live-order sound

The admin page polls `/api/orders` every 4 seconds and plays a chime whenever a new order arrives.

**Default admin PIN: `1234`**

---

## Notes
- The backend uses plain `JdbcTemplate` (no JPA/Hibernate) per your request.
- All frontend↔backend traffic is JSON over `fetch()`.
- Cart state is stored in the browser's `localStorage`.
