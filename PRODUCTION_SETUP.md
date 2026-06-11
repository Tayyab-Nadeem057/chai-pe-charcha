# Chai Pe Charcha — Production Setup & Change Log

This documents everything changed during the security/production hardening pass,
how to run it locally, and how to deploy it. Read the **"Run this once"** section
before starting the backend — the database schema changed.

---

## ⚠️ Run this once (schema changed)

New columns were added (`menu_items.variants`, `menu_items.image_url`,
`menu_items.sold_out`, `orders.service`, `order_items.item_id`). Your old local
SQLite file does **not** have them, so you must rebuild it in dev:

```bash
cd chai-pe-charcha-backend
rm -f instance/chai_pe_charcha.db        # dev only — wipes local test data
```

On next start the tables are recreated and the menu is re-seeded automatically.
For **production Postgres**, use migrations instead (see Deployment below) so you
never lose data.

---

## What changed, by phase

### Phase 0 — Emergency security fixes
- **Removed the public `/api/auth/register` route entirely.** It used to create
  `role="admin"` for anyone. Admins are now created only via `create_admin.py` or
  the protected `POST /api/admin/staff` route.
- **Secrets are now required env vars** (`SECRET_KEY`, `JWT_SECRET_KEY`). The app
  raises `ConfigError` and refuses to start if they're missing. No secret values
  remain in source. **You must rotate the old keys** (they're in git history).
- **Removed the seeded default admin** (`0000000000` / `admin123`) and its log line.

### Phase 1 — Security foundation
- **Admin creation:** `create_admin.py` (interactive, no-echo password) + admin-only
  `POST /api/admin/staff`, `POST /api/admin/staff/<id>/reset-password`, `DELETE /api/admin/staff/<id>`.
- **Password reset fixed:** the insecure name+phone self-reset is gone. Reset is now
  admin-controlled. The "Forgot Password" tab was removed from the admin UI.
- **Server-side pricing:** orders now send `{item_id, variant, quantity}` only. The
  backend looks up the real price from the DB (`MenuItem.price_for_variant`) and
  ignores any client price. Variant prices moved from the frontend into the DB
  (`menu_items.variants`). Quantities are bounded 1–50. **Price tampering is now impossible.**
- **XSS removed:** added `escapeHtml()` and applied it to all DB/customer strings in
  the menu, cart, and admin tables. Replaced inline `onclick="...${name}..."` handlers
  with `addEventListener` + `data-` attributes.
- **JWT moved to httpOnly cookies** with CSRF double-submit protection. The token is
  no longer in `localStorage` (only non-sensitive display info is). `SameSite`/`Secure`
  are configurable via env.
- **CORS locked to an allowlist** (`FRONTEND_ORIGINS`), credentials enabled.
- **Rate limiting** (Flask-Limiter): login 5/min, orders 20/min, uploads 60/hr.
- **Input validation:** phone format, field length caps, malformed-request rejection,
  and removal of the order-PII `console.log`.

### Phase 2 — Admin panel
- **Real image upload:** `POST /api/admin/menu/upload` accepts multipart, validates &
  re-encodes via Pillow (strips embedded payloads), compresses to WebP (≤1000px, q82),
  stores under `/uploads`, and returns a URL saved on the item. Drag-drop + instant
  preview + replace all work. **Images now actually upload** (previously discarded).
- **New-order alerts:** sound (WebAudio beep), toast, flashing browser-tab title, and a
  pending count in the title — every 20s poll.
- **Printable order detail:** "🧾 Detail" opens a clean, kitchen/receipt-style printable
  view (customer, items, total, status, timestamp).
- **Sold-out toggle** per item (visible but not orderable).

### Phase 3 — Infrastructure
- **Postgres-ready:** `DATABASE_URL` (with `postgres://`→`postgresql://` normalization),
  `psycopg2-binary`, `pool_pre_ping`. **Flask-Migrate** wired for real migrations.
- **Cache fixed:** removed the per-process in-memory menu cache (broke across workers);
  now uses short HTTP `Cache-Control` (30s) — multi-worker safe and edits appear fast.
- **Tests + CI:** `tests/test_security.py` covers auth, authorization, price-tampering,
  variant pricing, and validation. GitHub Actions runs `pytest` on every push/PR.

---

## Local development

**Backend**
```bash
cd chai-pe-charcha-backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# .env (copy from .env.example) — minimum for local dev:
#   SECRET_KEY=<run: python -c "import secrets;print(secrets.token_hex(32))">
#   JWT_SECRET_KEY=<another random hex>
#   DATABASE_URL=sqlite:///chai_pe_charcha.db
#   FRONTEND_ORIGINS=http://localhost:5500,http://127.0.0.1:5500
#   JWT_COOKIE_SAMESITE=Lax        # Lax + insecure cookie is fine for http localhost
#   JWT_COOKIE_SECURE=false

python create_admin.py            # create your first admin
python run.py
```

**Frontend** — serve the static files (cookies need a real origin, not file://):
```bash
cd chai-pe-charcha
python -m http.server 5500
# open http://localhost:5500/home.html
```

**Run the tests**
```bash
cd chai-pe-charcha-backend
pytest -q
```

---

## Production deployment (Render + GitHub Pages)

**Backend env vars (Render dashboard):**
```
SECRET_KEY=<32-byte random hex>          # NEW value, not the old leaked one
JWT_SECRET_KEY=<32-byte random hex>      # NEW value
DATABASE_URL=<your Render Postgres URL>  # add a Postgres instance
FRONTEND_ORIGINS=https://<you>.github.io # exact origin, no trailing slash
JWT_COOKIE_SAMESITE=None
JWT_COOKIE_SECURE=true
```

**Database migrations (first deploy):**
```bash
export FLASK_APP=run.py
flask db init
flask db migrate -m "initial production schema"
flask db upgrade
```
The Procfile runs `flask db upgrade` on each release. `create_all()` also runs at
startup as a safety net for fresh databases.

**Uploads note:** images are stored on local disk under `/uploads`. Render's free
disk is **ephemeral** — uploaded images vanish on redeploy. For permanent storage,
add a Render **persistent disk** mounted at the `UPLOAD_FOLDER`, or switch to
Cloudinary/S3 (the upload route is isolated, so swapping the storage backend is a
small change). See "Remaining work" below.

**After deploy:** create the production admin once via `python create_admin.py` (Render
shell) — there is no default admin anymore.

---

## Remaining work (honest status)

These were **not** completed in this pass because they need your accounts, product
decisions, or live measurement — not because they were skipped.

**Needs your credentials / accounts**
- **Cloudinary/S3 image storage** — code is structured for it; needs API keys. Until
  then, use a Render persistent disk so uploads survive redeploys.
- **Payment integration** (JazzCash/Easypaisa/card) — needs a merchant account + keys.
- **WhatsApp order notifications** — needs a WhatsApp Business API / Twilio account.

**Phase 4 business features (need product decisions)**
- Delivery fees, minimum order, coupons, customer accounts/history, analytics
  dashboard, table booking, audit logs. The data model now has clean hooks for these
  (e.g. `orders.service`, server-side pricing) so they're straightforward to add.

**Mobile / performance**
- The customer site already does lazy images, CLS-safe sizing, skeletons, and
  progressive rendering. The one remaining admin item: the orders **table** is wide on
  phones — the mobile order-card containers exist in the HTML but aren't populated yet.
  Wiring `renderOrders` to also fill `#order-cards` on mobile is the next quick win.
- Lighthouse 90+ should be verified with the live deploy (needs a running URL to measure).

**Optional hardening**
- Move rate-limit storage to Redis (`RATELIMIT_STORAGE_URI=redis://...`) so limits are
  shared across workers.
- Scrub the old secrets from git history (`git filter-repo`) after rotating keys.
