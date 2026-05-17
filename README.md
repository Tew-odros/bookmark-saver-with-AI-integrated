# BookmarkVault 🔖

A production-ready, full-stack bookmark manager built with **React (Vite)**, **Node.js (Express)**, **Prisma ORM**, and **PostgreSQL**.

---

## Features

| Feature | Detail |
|---|---|
| **User Auth** | Secure Registration and Login with JWT |
| **Add bookmarks** | Title + URL with dual-layer validation |
| **View bookmarks** | Responsive card grid, newest first |
| **Delete bookmarks** | Per-card delete with loading state |
| **Favicon display** | Google favicon service + letter-avatar fallback |
| **Skeleton loader** | Shimmer animation while fetching |
| **Dockerized** | One-command setup for DB, Backend, and Frontend |

---

## Docker Deployment (Quick Start)

The recommended way to run this project is using Docker. This handles the database, backend dependencies, and frontend build automatically.

### 1. Build and Start
Run the following command in the project root:

```bash
docker compose up --build
```

### 2. Accessing the App
- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5001](http://localhost:5001)
- **Database UI:** [http://localhost:5555](http://localhost:5555) (See below)

### 3. Database Management (Prisma Studio)
To view your users and bookmarks in a web browser:
1. Ensure the containers are running.
2. Run this command in a new terminal:
   ```bash
   docker exec -it bookmark-backend npx prisma studio
   ```
3. Open [http://localhost:5555](http://localhost:5555).

---

## Troubleshooting

### "Address already in use" (Port 5432)
If you have PostgreSQL installed locally on your laptop, Docker might fail to start because port 5432 is taken.
**Fix:** Stop your local postgres service:
```bash
sudo systemctl stop postgresql
```

### "Docker API connection failed"
If you are using Docker Desktop on Linux, ensure the service is running and the correct context is selected:
```bash
systemctl --user start docker-desktop
docker context use desktop-linux
```

---

## Tech Stack

- **Frontend:** React 18 · Vite · Tailwind CSS · Axios
- **Backend:** Node.js · Express · **Prisma ORM** · JWT · Bcrypt
- **Database:** PostgreSQL 15
- **Infrastructure:** Docker · Docker Compose

---

## REST API Reference

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | `{ email, password }` | Create account |
| `POST` | `/api/auth/login` | `{ email, password }` | Get JWT token |
| `GET` | `/api/bookmarks` | — | Fetch user's bookmarks |
| `POST` | `/api/bookmarks` | `{ title, url }` | Create a bookmark |
| `DELETE` | `/api/bookmarks/:id` | — | Delete a bookmark |
