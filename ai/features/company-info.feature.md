# Feature Spec — Company Info

> Read `ai/ai-spec.md` first. This document adds feature-specific detail.
> This feature is purely visual and requires no backend changes.

---

## Feature Goal

Replace all generic tutorial branding with Rocket Elevators identity so the app looks and feels like an internal Rocket Elevators tool, not a MongoDB tutorial demo.

---

## Scope

### In Scope
- Page title in the browser tab updated to "RE Admin"
- Default Vite favicon replaced with the Rocket Elevators icon
- MongoDB logo in the Navbar replaced with the Rocket Elevators logo
- Clicking the logo navigates the user to the home page (agent list)

### Out of Scope
- Any styling changes beyond swapping assets
- Changing the Navbar layout or button styles
- Any backend changes

---

## Interfaces Involved

| File | Change |
|------|--------|
| `client/index.html` | Update `<title>` and `<link rel="icon">` |
| `client/public/favicon.png` | New file — Rocket Elevators icon |
| `client/public/rocketLogo.png` | New file — Rocket Elevators logo |
| `client/src/components/Navbar.jsx` | Replace MongoDB logo `src` with `/rocketLogo.png` |

---

## Data + Validations + Expected Behavior

This feature has no data layer. It is purely asset and markup changes.

- The browser tab must show the text "RE Admin"
- The favicon must show the Rocket Elevators icon (not the default Vite logo)
- The Navbar logo must be the Rocket Elevators logo (not the MongoDB logo)
- Clicking the logo must navigate to `/` — this is already implemented via `NavLink to="/"`

---

## User Flow

1. User opens the app in the browser
2. The browser tab shows "RE Admin" with the Rocket Elevators favicon
3. The Navbar shows the Rocket Elevators logo on the left
4. Clicking the logo takes the user back to the home page (agent list)

---

## Notes for the AI

- Assets go in `client/public/` — Vite serves this folder at the root URL, so `public/rocketLogo.png` is accessible as `/rocketLogo.png` in the browser
- The favicon `<link>` in `index.html` must point to `/favicon.png`
- The logo `<img src>` in `Navbar.jsx` must point to `/rocketLogo.png`
- Do NOT change the `NavLink` wrapping the logo — the navigation to `/` is already correct
- Do NOT introduce any new packages or CSS

---

## Acceptance Criteria

- [ ] Browser tab displays "RE Admin"
- [ ] Browser tab shows the Rocket Elevators favicon (not the Vite default)
- [ ] Navbar displays the Rocket Elevators logo
- [ ] Clicking the logo navigates to the home page
- [ ] No MongoDB logo appears anywhere in the app
