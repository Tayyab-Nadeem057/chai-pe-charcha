# Chai Pe Charcha — Implementation Plan

A prioritized, phased plan to take the project from "great portfolio piece" to "sellable to a real restaurant." Ordered by risk and impact. Each item lists the files involved, what to do, and how you'll know it's done.

**Golden rule for sequencing:** do not build new features (payments, coupons, table booking) until Phase 1 is closed. Shipping features on top of an open admin panel just gives an attacker more to play with.

---

## Phase 0 — Stop the bleeding (½ day)

Things that are dangerous *right now* and take minutes to fix.

### 0.1 Remove open admin registration
- **File:** `app/routes/auth.py`
- **Problem:** `POST /api/auth/register` is public and hardcodes `role="admin"`. Anyone can become an admin.
- **Do:** Delete the `register` route entirely. You only need a few staff accounts — create them with a one-off CLI script or a protected endpoint (see 1.1). Remove the matching "register" link/form from `admin-login.html` if present.
- **Done when:** `POST /api/auth/register` returns 404 and no public path creates a user.

### 0.2 Pull secrets out of source
- **File:** `config.py`
- **Problem:** Real `SECRET_KEY` and `JWT_SECRET_KEY` defaults are committed.
- **Do:** Make them required env vars with no fallback:
  ```python
  SECRET_KEY = os.environ["SECRET_KEY"]
  JWT_SECRET_KEY = os.environ["JWT_SECRET_KEY"]
  ```
  The app should crash on startup if they're missing — that's correct. Set the real values in Render's environment dashboard.
- **Then rotate:** Generate brand-new keys (`python -c "import secrets; print(secrets.token_hex(32))"`). The old ones are in git history and must be considered burned.
- **Done when:** No secret strings exist anywhere in the repo, and the app reads them from the environment.

### 0.3 Kill the default admin seed
- **File:** `app/__init__.py` (`_seed_admin`)
- **Problem:** Auto-creates `phone 0000000000 / admin123` and prints it to logs.
- **Do:** Remove `_seed_admin()`. Create the first real admin via the script in 1.1.
- **Done when:** No hardcoded credentials are seeded or logged.

---

## Phase 1 — Security foundation (2–3 days)

The project cannot be sold until this phase is complete.

### 1.1 Admin account creation, done safely
- **New file:** `create_admin.py` (a Flask CLI command or standalone script)
- **Do:** A script that prompts for name/phone/password and inserts one admin with a hashed password. This replaces public registration. Optionally also add `POST /api/admin/staff` guarded by `@admin_required` so an existing admin can add colleagues.
- **Done when:** New staff accounts can only be created by an existing admin or by someone with server access.

### 1.2 Fix the password-reset hole
- **File:** `app/routes/auth.py` (`reset_password`)
- **Problem:** Anyone who knows an admin's name + phone can reset their password. Neither is secret.
- **Do (pick one):**
  - **Simplest:** Remove self-service reset. An admin resets another admin's password via a protected endpoint.
  - **Proper:** OTP to the registered phone (you already use WhatsApp — send a 6-digit code, store it hashed with a 10-min expiry, verify before allowing reset).
- **Done when:** Resetting a password requires proving control of the account, not just knowing public facts.

### 1.3 Stop trusting prices from the browser
- **File:** `app/routes/user.py` (`place_order`)
- **Problem:** Order total is computed from prices the client sends. A user can buy anything for Rs. 1.
- **Do:** For each line item, send only `item_id` + `quantity` (plus any chosen variant). Look up the canonical price from `MenuItem` server-side. Reject unknown/inactive items. Compute the total from DB prices only.
- **Note:** This interacts with your variant system (Half/Full, Small/Medium/Large in `menu-app.js` `CUSTOMIZATION_MAP`). Move the `priceOffset` values into the database (a `MenuVariant` table or a JSON column) so the server can validate them too. Right now they live only in the frontend, which means the server can't trust them.
- **Done when:** Editing the price in a request has no effect on what the customer is charged.

### 1.4 Escape all user-controlled output (XSS)
- **Files:** `admin.js` (`renderOrders`, `renderMenuItems`), `menu-app.js` (`buildCard`, `renderDrawer`)
- **Problem:** Customer name/address and item names are injected into `innerHTML` raw. A customer can run script in the owner's admin session and steal the token.
- **Do:** Add one `escapeHtml()` helper and run every interpolated value through it, **or** stop building HTML from strings and use `textContent` / `createElement`. Replace the inline `onclick="...'${name}'..."` handlers with `addEventListener` + `data-` attributes (event delegation) — this removes the injection surface entirely.
- **Done when:** Placing an order with a name like `<img src=x onerror=alert(1)>` shows the literal text in the admin panel and runs nothing.

### 1.5 Move the admin token out of localStorage
- **Files:** `admin.js`, `api.js`, backend JWT config
- **Problem:** JWT in `localStorage` is readable by any script (compounds 1.4).
- **Do:** Switch to an httpOnly, Secure, SameSite=Strict cookie issued by the login endpoint. Flask-JWT-Extended supports cookie-based tokens with CSRF protection built in. Remove `localStorage.setItem("admin_token", ...)`.
- **Done when:** The token is not reachable from JavaScript.

### 1.6 Lock down CORS and add rate limiting
- **File:** `app/__init__.py`
- **Do:**
  - Replace `CORS(app)` with an explicit allowlist: `CORS(app, origins=["https://your-frontend-domain"], supports_credentials=True)`.
  - Add `Flask-Limiter`. Cap `login` (and any reset/OTP endpoints) at e.g. 5/minute per IP to stop brute force.
- **Done when:** Only your real frontend origin is allowed, and rapid repeated logins get `429`.

### 1.7 Input validation pass
- **Files:** `auth.py`, `user.py`
- **Do:** Validate phone format (Pakistani number regex), enforce a sensible password policy (length ≥ 8), cap field lengths, and bound `quantity` (e.g. 1–50). Remove the `console.log` of order PII in `menu-app.js` `placeOrder`.
- **Done when:** Malformed input is rejected with a clear 400, and no PII is logged.

---

## Phase 2 — Make the admin panel actually usable (2–3 days)

### 2.1 Real image upload (the headline broken feature)
- **Files:** `admin.js` (`processImage`, `saveItem`), new backend upload route, `models.py`
- **Problem:** The "upload" compresses the image in the browser then discards it and saves only the filename. New dishes get a broken image.
- **Do:**
  - Add `POST /api/admin/menu/upload` (admin-only) that accepts the file (multipart), validates type/size, and stores it. **Prefer object storage** (Cloudinary or S3/Backblaze) over local disk — Render's disk is ephemeral. Return the public URL.
  - Keep your client-side compression — it's good — but actually send the compressed blob, not just `file.name`.
  - Store the returned URL in `MenuItem.image_file` (or a new `image_url` column) and render from it.
- **Done when:** An owner can add a dish from a phone photo and it appears correctly on the live site after a redeploy.

### 2.2 New-order awareness
- **Files:** `admin.js`
- **Do:** Replace silent 30-second polling with a noticeable signal — a sound + visual flash when a new pending order arrives, and a browser title badge (`(3) Admin`). Later, upgrade to server-sent events or websockets so it's instant.
- **Done when:** An owner glancing at the panel can't miss a new order.

### 2.3 Kitchen / order detail view
- **Do:** A clean, printable single-order view (customer, items, total, address, time) reachable from the table. Restaurants print or read these aloud to the kitchen.
- **Done when:** An order can be opened and printed on one page.

### 2.4 Resolve the three-sources-of-truth menu
- **Files:** `menu-app.js` (`CATEGORIES`), `app/seed_menu.py`, database
- **Problem:** Menu data is hardcoded in the frontend, in the seed file, and in the DB. Admin edits don't reach the static fallback.
- **Do:** Make the database the single source. Keep `seed_menu.py` only as a first-run seed. Reduce the frontend `CATEGORIES` array to a tiny offline fallback (or drop it) — the live menu should always come from the API.
- **Done when:** Editing an item in the admin panel is the only thing needed to change what customers see.

---

## Phase 3 — Production infrastructure (1–2 days)

### 3.1 Move off SQLite to Postgres
- **Files:** `config.py`, `requirements.txt`, Render config
- **Problem:** Default SQLite on Render's free tier is wiped on every redeploy/restart — orders and menu edits vanish.
- **Do:** Provision a managed Postgres (Render, Supabase, or Neon free tier). Set `DATABASE_URL`. Add `psycopg2-binary` to requirements. Introduce **Alembic** (Flask-Migrate) for schema migrations instead of `db.create_all()`.
- **Done when:** Data survives a redeploy and schema changes are version-controlled.

### 3.2 Move the menu cache off in-process memory
- **File:** `app/routes/user.py` (`_menu_cache`)
- **Problem:** The dict cache is per-process; it breaks across multiple gunicorn workers and on restart.
- **Do:** Either rely on HTTP `Cache-Control` (you already send it) + a CDN, or use Redis if you keep a server-side cache. At minimum, document that it's single-worker only.
- **Done when:** Cache behavior is correct regardless of worker count.

### 3.3 Basic test + CI safety net
- **Do:** Add `pytest` with a handful of tests covering the things that must never break: auth rejects bad credentials, non-admins can't hit admin routes, order total is computed server-side, price tampering is rejected. Wire a GitHub Action to run them on push.
- **Done when:** The security guarantees from Phase 1 are protected by tests.

---

## Phase 4 — Features that make it a real product (ongoing)

Prioritized by what a Pakistani chai/dine-in spot actually needs.

1. **Payments / checkout clarity.** Either integrate JazzCash / Easypaisa / a card gateway, or explicitly present the flow as "Order now, pay cash on delivery." Don't leave it ambiguous.
2. **Customer + owner notifications.** You already have a WhatsApp number — send order confirmations to the customer and new-order alerts to the owner.
3. **Store state:** open/closed hours, "we're closed" banner, and a per-item **sold-out** toggle (real-time, beyond `is_active`).
4. **Order economics:** delivery fee, minimum order value, tax line, and **coupons/promos**.
5. **Table booking / reservations** — high value for a dine-in chai spot.
6. **Customer accounts + order history** (currently guest-only).
7. **Owner analytics:** daily sales, top items, peak hours.
8. **Operational:** multi-admin roles, an audit log of who changed what, and a customer-facing menu search.

---

## Suggested order of attack (first two weeks)

| Day | Focus |
|-----|-------|
| 1 | Phase 0 (all three) — close the open admin door and the leaked secrets |
| 2–3 | 1.1 admin creation, 1.2 password reset, 1.3 server-side pricing |
| 4 | 1.4 XSS escaping + 1.5 cookie tokens |
| 5 | 1.6 CORS + rate limiting, 1.7 validation |
| 6–7 | 2.1 real image upload |
| 8 | 3.1 Postgres + migrations |
| 9 | 2.2/2.3 order alerts + printable view |
| 10 | 2.4 single source of truth, 3.3 tests |

After Phase 1–3, you can honestly tell a client the system is secure and durable. Phase 4 is where you start charging more.

---

## Definition of "production-ready" for this project

- [ ] No public path creates an admin; secrets are in env vars and rotated
- [ ] Password reset requires proof of account control
- [ ] Order totals are computed from DB prices, not client input
- [ ] All user-controlled data is escaped before rendering
- [ ] Admin token is not readable by JavaScript
- [ ] CORS is restricted to the real frontend; login is rate-limited
- [ ] Adding a dish with a new photo works end-to-end on the live site
- [ ] Data survives a redeploy (Postgres + migrations)
- [ ] Core security guarantees are covered by automated tests
