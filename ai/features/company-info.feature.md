# 🤖 AI_FEATURE_Company-Info

---

## Feature Identity

- **Feature Name:** Company Info — Rocket Elevators Branding
- **Related Area:** Frontend

---

## Feature Goal

Replace all generic tutorial branding with Rocket Elevators identity so the app looks and feels like an internal Rocket Elevators tool, not a MongoDB tutorial demo.

---

## Feature Scope

### In Scope (Included)

- Page title in the browser tab updated to "RE Admin"
- Default Vite favicon replaced with the Rocket Elevators icon
- MongoDB logo in the Navbar replaced with the Rocket Elevators logo
- Clicking the logo navigates the user to the home page (agent list)

### Out of Scope (Excluded)

- Any styling changes beyond swapping assets
- Changing the Navbar layout or button styles
- Any backend changes
- Changing fonts or color scheme

---

## Sub-Requirements (Feature Breakdown)

- Page Title — change `<title>client</title>` to `<title>RE Admin</title>` in `index.html`
- Favicon — replace the default Vite `.svg` favicon with the Rocket Elevators `favicon.png`
- Navbar Logo — replace the MongoDB logo URL in `Navbar.jsx` with the local Rocket Elevators logo
- Logo Navigation — clicking the logo must navigate to `/` (the agent list home page)

---

## User Flow / Logic (High Level)

1. User opens the app in the browser
2. The browser tab shows "RE Admin" with the Rocket Elevators favicon
3. The Navbar shows the Rocket Elevators logo on the left
4. Clicking the logo navigates the user back to the home page (agent list) at `/`

---

## Interfaces (Pages, Endpoints, Screens)

### Frontend

- `client/index.html` — update `<title>` and `<link rel="icon">`
- `client/public/favicon.png` — new asset file (Rocket Elevators icon)
- `client/public/rocketLogo.png` — new asset file (Rocket Elevators logo)
- `client/src/components/Navbar.jsx` — replace MongoDB logo `src` with `/rocketLogo.png`

### Backend / API

- No backend changes for this feature

---

## Data Used or Modified

This feature has no data layer. It is purely asset replacement and HTML markup changes.

---

## Tech Constraints (Feature-Level)

- Assets must go in `client/public/` — Vite serves this folder at the root URL, making `public/rocketLogo.png` accessible as `/rocketLogo.png`
- The favicon `<link>` in `index.html` must use `type="image/png"` and `href="/favicon.png"`
- The logo `<img src>` in `Navbar.jsx` must point to `/rocketLogo.png` (local asset, not an external URL)
- Do NOT change the `NavLink to="/"` wrapping the logo
- Do NOT introduce any new packages or CSS

---

## Acceptance Criteria

- [ ] Browser tab displays "RE Admin"
- [ ] Browser tab shows the Rocket Elevators favicon (not the Vite default)
- [ ] Navbar displays the Rocket Elevators logo
- [ ] Clicking the logo navigates to the home page at `/`
- [ ] No MongoDB logo appears anywhere in the app

---

## Notes for the AI

- The `NavLink to="/"` wrapper around the logo was already correct — do not change it
- Do not modify any other part of `Navbar.jsx` beyond the logo `src`
- Keep changes minimal — only the four files listed in Interfaces need to be touched
