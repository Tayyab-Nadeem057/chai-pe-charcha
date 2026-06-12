# Chai Pe Charcha — Go-Live Checklist

Do these in order, top to bottom. Each step says exactly what to type or click.
Your details are already filled in.

Reference values:
- GitHub user: `Tayyab-Nadeem057`
- Website: `https://tayyab-nadeem057.github.io/chai-pe-charcha/home.html`
- Admin login: `https://tayyab-nadeem057.github.io/chai-pe-charcha/admin-login.html`
- Backend: `https://chai-pe-charcha-backend.onrender.com`

---

## STEP 1 — Push the latest code (both repos)

The newest features (auto-admin + WhatsApp reset) aren't live yet. Push both.
Pushing the backend makes Render redeploy automatically.

```bash
# backend
cd ~/.gemini/antigravity-ide/scratch/chai-pe-charcha-backend
git add -A && git commit -m "Auto-admin + WhatsApp reset" && git push

# frontend
cd ~/.gemini/antigravity-ide/scratch/chai-pe-charcha
git add -A && git commit -m "Forgot Password UI" && git push
```

- [ ] Backend pushed
- [ ] Frontend pushed

---

## STEP 2 — Create a database (Render)

So your orders, menu edits, and admin account survive restarts.

1. Render → **+ New** → **Postgres**
2. Name it `chai-pe-charcha-db`, choose **Free**, create it
3. Open it, copy the **Internal Database URL** (starts with `postgresql://`)

- [ ] Postgres created and URL copied

---

## STEP 3 — Set ALL environment variables (Render)

Render → **chai-pe-charcha-backend** → **Environment** → **Edit**.
Make sure every one of these exists (add the missing ones). Pick your own
`BOOTSTRAP_ADMIN_PASSWORD` — **must be 8+ characters.**

```
SECRET_KEY               = ad023e03c14ee70d9ac8bdb084456dc9c2f204455fca8e91a2f2f8be07cb440c
JWT_SECRET_KEY           = 72d1f0024d2ea50bfb19f2848ef848f4fef8309668bb738b4d7ad85a6e7c8127
DATABASE_URL             = <paste the Postgres Internal URL from Step 2>
FRONTEND_ORIGINS         = https://tayyab-nadeem057.github.io
JWT_COOKIE_SAMESITE      = None
JWT_COOKIE_SECURE        = true
BOOTSTRAP_ADMIN_NAME     = Tayyab
BOOTSTRAP_ADMIN_PHONE    = 03021807669
BOOTSTRAP_ADMIN_PASSWORD = chai12345
```

Then click **Save, rebuild, and deploy**.

- [ ] All variables set
- [ ] Saved + redeploying

---

## STEP 4 — Confirm your admin was created

Render → **Logs**. Wait for the deploy to finish (green), then look for:

```
[OK] Bootstrap admin created (phone 03021807669)
```

- ✅ See that line → your login is `03021807669` + your password.
- ⚠️ See `must be at least 8 chars` → password too short, fix in Step 3, redeploy.

- [ ] Saw the `[OK] Bootstrap admin created` line

> After this works, delete `BOOTSTRAP_ADMIN_PASSWORD` from Environment (good hygiene — the account already exists and won't be recreated).

---

## STEP 5 — Publish the website (GitHub Pages)

Frontend repo on GitHub → **Settings → Pages → Deploy from a branch → `main` / root → Save.**
Wait ~1 minute.

- [ ] Pages turned on
- [ ] `https://tayyab-nadeem057.github.io/chai-pe-charcha/home.html` loads

---

## STEP 6 — Test the whole thing

- [ ] Open the website, browse the menu
- [ ] Add items to cart and place a **test order**
- [ ] Open the admin login, log in with `03021807669` + your password
- [ ] See the test order in the dashboard; click **Accept**
- [ ] Add or edit a menu item with a photo (uploads from the panel)
- [ ] Test **Forgot Password**: click it → enter your phone → **Send code** →
      read the code from Render **Logs** → set a new password → log in with it

If login fails but you see the page (not a connection error), it's a
password/account issue — re-check Step 3 and Step 4.

---

## STEP 7 — Make it fully production-grade (recommended)

**Real WhatsApp reset codes** (instead of reading them from logs):
1. Make a free Twilio account, enable the WhatsApp sandbox
2. Add to Render Environment:
   ```
   TWILIO_ACCOUNT_SID    = AC...
   TWILIO_AUTH_TOKEN     = ...
   TWILIO_WHATSAPP_FROM  = whatsapp:+14155238886
   ```

**Permanent menu images** (so admin uploads survive redeploys):
- Add Cloudinary (free) — uploads currently live on Render's disk, which resets
  on redeploy. Ask me to wire this in when ready.

- [ ] Twilio added (optional)
- [ ] Cloudinary added (optional)

---

## STEP 8 — Hand over to the restaurant

- [ ] Give them the admin URL: `…/admin-login.html` (tell them to bookmark it)
- [ ] Create/confirm their admin account (phone + temporary password)
- [ ] Tell them to log in and change the password (sidebar → 🔒 Change Password)
- [ ] Remember: one restaurant = one backend + database. Other clients need their own.
