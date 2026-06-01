# Chai Pe Charcha — Admin Panel Setup

## How it works

| Part | What it does |
|------|----------------|
| **Website** (HTML/CSS/JS) | Customer menu, cart, orders — hosted on GitHub Pages or any static host |
| **Backend** (Flask API) | Orders + menu database — must run on a server or your PC |
| **Admin panel** | `admin-login.html` + `admin-panel.html` — talks to the backend |

The admin panel is **not a separate app**. It is part of your website folder and uses the **same backend API** as the menu.

---

## Option A — Run on your own computer (development / small shop)

Best for testing and running the restaurant from one PC on the same Wi‑Fi.

### 1. Start the backend

```powershell
cd c:\Users\nadee\.gemini\antigravity\scratch\chai-pe-charcha-backend
pip install -r requirements.txt
python run.py
```

Server: **http://localhost:5000**

### 2. Start the website

```powershell
cd c:\Users\nadee\.gemini\antigravity\scratch\chai-pe-charcha
python -m http.server 8080
```

### 3. Open admin

| Page | URL |
|------|-----|
| Login | http://localhost:8080/admin-login.html |
| Panel | http://localhost:8080/admin-panel.html |

**Default login (first run only):**

| Field | Value |
|-------|--------|
| Phone | `0000000000` |
| Password | `admin123` |

Change this password after first login (register a new admin via API or update in database).

### 4. Phone / other devices on same Wi‑Fi

- Website: `http://YOUR_PC_IP:8080`
- API is auto-detected on the same host (port 5000)

---

## Option B — Host online (production)

### Website (GitHub Pages)

1. Push the **entire** `chai-pe-charcha` folder including the **`images/`** folder.
2. Enable GitHub Pages on the repo.
3. Set API URL in the browser console once (or we host backend on a public URL):

```javascript
localStorage.setItem('cpc_api_base', 'https://YOUR-BACKEND-URL/api')
```

### Backend (Render, Railway, PythonAnywhere, VPS)

1. Upload `chai-pe-charcha-backend`.
2. Set environment variables:
   - `SECRET_KEY` — random string
   - `JWT_SECRET_KEY` — random string
   - `DATABASE_URL` — optional (defaults to SQLite file)
3. Run: `gunicorn run:app` or `python run.py`
4. Point `cpc_api_base` on the live site to your backend URL.

**Admin panel URL when live:**  
`https://your-site.github.io/admin-login.html`

---

## Menu & availability

- On first backend start, the menu is **seeded** from your existing items (~90+ dishes).
- Each item has checkboxes: **Dine In**, **Take Away**, **Delivery** (multiple allowed).
- Edits in admin → saved to database → **menu page loads from API immediately**.

### Customer flow

| Home button | API filter |
|-------------|------------|
| Delivery | `GET /api/menu?service=delivery` |
| Take Away | `GET /api/menu?service=takeaway` |
| Dine In | `GET /api/menu?service=dinein` |

---

## Admin features

- **Orders** — view, accept, reject (auto-refresh 30s)
- **Menu items** — search, filter by category/service, add, edit, delete
- **Availability** — toggle Dine In / Take Away / Delivery per item
- **Mobile** — hamburger menu, card layout for menu items

---

## API endpoints (reference)

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/menu?service=delivery` | No |
| POST | `/api/auth/login` | No |
| GET | `/api/admin/menu/items` | Admin JWT |
| POST | `/api/admin/menu/items` | Admin JWT |
| PUT | `/api/admin/menu/items/:id` | Admin JWT |
| DELETE | `/api/admin/menu/items/:id` | Admin JWT |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Admin login fails | Start backend (`python run.py`) |
| Menu empty | Backend running; delete `chai_pe_charcha.db` and restart to re-seed |
| Images broken on GitHub | Upload `images/` folder to the repo |
| Changes not on site | Hard refresh (Ctrl+F5); confirm backend is the one menu calls |

---

## Security (before going live)

1. Change default admin password.
2. Set strong `SECRET_KEY` and `JWT_SECRET_KEY` in production.
3. Use HTTPS on the backend.
4. Do not commit `.db` files with real customer data to public GitHub.
