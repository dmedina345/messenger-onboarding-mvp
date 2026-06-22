# Onboarding flow MVP v4.5.0 (GitHub Pages)

Lightweight tap-through prototype for **Path A (Fast Start)**, **Path B (Taste + Personalize)**, **Path C (Guided Journey)**, and **Path D (Coach conversation)**. No database, auth, or APIs.

**Live:** [dmedina345.github.io/messenger-onboarding-mvp](https://dmedina345.github.io/messenger-onboarding-mvp/)

Synced to grill decisions **RD-OB19–27** and Path C ideation in [`discovery.md`](../../discovery.md).

## Run locally

```bash
cd docs/messenger-4.0/prototypes/onboarding-mvp
python3 -m http.server 5173
```

Open [http://localhost:5173](http://localhost:5173)

**Viewport:** fixed **393×852px** phone frame (iPhone 14 Pro). Path C steps may scroll lightly on dense screens.

## Routes

| Route      | Flow                                                                                                                    | Hypothesis tested                   |
| ---------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `#/`       | Pick Path A, B, C, or D                                                                                                 | —                                   |
| `#/path-a` | Interests → DOB → loader (daily + **See my For You**) → For You                                                         | Speed-first; no progress bar        |
| `#/path-b` | Daily → interests → samples (≥1 rated, optional **Coach preview**) → **Build my For You** → DOB → auto loader → For You | Taste-first; Step X of 5            |
| `#/path-c` | Intention → **daily + Coach preview** (one session) → mirror → optional commit → DOB → plan → For You + **Collection**  | Guided journey; church-model giving |
| `#/path-d` | **Coach conversation** → anchor + content picks in chat → DOB → mirror → For You                                        | Emotional fit via scripted Coach    |

**Path C highlights:**

- **6 steps** with Step X of 6 progress bar
- **Merged session:** anchor → **Ask Coach about this** → Coach preview (sample; full Coach after DOB)
- **7-day plan** — week arc + 3 featured days + "+ 4 more ahead"
- **Optional** 7-day commitment; Continue always enabled
- **Give mention** as **Learn about giving** link; ♥ **Give** on feed nav
- Under-13: no Give mention or Give button (COPPA)

**Path D highlights:**

- Scripted Coach chat with typing indicator and quick-reply chips
- Matched daily anchor + **two content picks** in-thread (Like / Not for me)
- DOB gate and mirror-back before For You feed

**Back navigation (RD-OB20):** ← on all steps until For You; selections preserved.

**Under-13:** month/year DOB before 13th birthday → read-only For You, Coach bar disabled.

## v4.5.0 — Paths A–D only (Pages publish)

- Removed Path E (Return ritual) and experimental home section
- Path D promoted to primary picker alongside A/B/C
- Includes v4.4 Coach chat onboarding + in-chat content recommendations

## v4.4.1 — Path D content picks + chat scroll

- After the matched anchor, Coach recommends **two real content cards** in-thread
- Chat thread scrolls within the phone frame; chips/DOB/CTA pinned at bottom

## v4.4.0 — Path D conversational redesign

Coach-led chat: felt need → deeper need → inline anchor → DOB → mirror-back → For You.

## Not in scope

- Real Coach AI, feed ranking, payment processing, notifications OS prompt, account creation
- Native iOS/Android DOB picker (web uses dropdowns per RD-OB25)
