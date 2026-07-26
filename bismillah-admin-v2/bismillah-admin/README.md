# Bismillah — Separate Admin Dashboard

A standalone admin panel (HTML/CSS/JS only) that talks to your existing
Spring Boot backend at `http://localhost:8080/api`.

## What's inside

```
admin-dashboard/     → new standalone admin site (index.html + admin.css + admin.js)
backend-additions/   → drop-in Java files that add menu CRUD + categories endpoint
```

## Features

- 🔐 PIN login (uses existing `/api/admin/login`)
- 📊 Dashboard — today's orders, revenue, in-progress, room occupancy, recent activity
- 🍽️ Dine-In Orders — filtered list, accept / ready / complete
- 🚚 Delivery Orders — filtered list with customer + address, out-for-delivery flow
- 🍛 Menu Management — Add / Edit / Delete + toggle Available / Out of Stock
- 📈 Reports — top items, last 7 days revenue bars, payment breakdown
- 🔔 Live Notifications — polling every 4s, toast + chime on new orders, sidebar badges

## Setup (2 minutes)

### 1. Add the backend endpoints (menu CRUD)

Copy these two files into your existing project, **replacing** the existing
files with the same names:

- `backend-additions/controller/MenuController.java` → `backend/src/main/java/com/bismillah/controller/MenuController.java`
- `backend-additions/repository/MenuRepository.java` → `backend/src/main/java/com/bismillah/repository/MenuRepository.java`

Then rebuild:

```bash
cd backend
mvn spring-boot:run
```

### 2. Run the admin dashboard

The admin site is completely separate from the customer site. Serve it on
any static port (e.g. 5501):

```bash
cd admin-dashboard
python -m http.server 5501
```

Open: **http://localhost:5501**

Default PIN: **1234** (from your existing `admin_settings` seed row).

### 3. Enable the chime

Browsers block audio until you interact. Just click anywhere on the page
once after login — chimes will play on every new order after that.

## Notes

- Uses only the existing tables — no schema changes needed.
- CORS is already open in your `CorsConfig.java`, so both the customer
  site (5500) and the admin dashboard (5501) work simultaneously.
- Polls `/api/orders`, `/api/rooms`, `/api/bookings`, `/api/menu` every 4s.
