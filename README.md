# Onboarding flow MVP v4.2.3 (local web prototype)

Lightweight tap-through prototype for **Path A (Fast Start)**, **Path B (Taste + Personalize)**, and **Path C (Guided Journey)**. No database, auth, or APIs.

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
| `#/`       | Pick Path A, B, or C                                                                                                    | —                                   |
| `#/path-a` | Interests → DOB → loader (daily + **See my For You**) → For You                                                         | Speed-first; no progress bar        |
| `#/path-b` | Daily → interests → samples (≥1 rated, optional **Coach preview**) → **Build my For You** → DOB → auto loader → For You | Taste-first; Step X of 5            |
| `#/path-c` | Intention → **daily + Coach preview** (one session) → mirror → optional commit → DOB → plan → For You + **Collection**  | Guided journey; church-model giving |

**Path C highlights:**

- **6 steps** with Step X of 6 progress bar
- **Merged session:** anchor → **Ask Coach about this** → Coach preview (sample; full Coach after DOB)
- **7-day plan** — week arc + 3 featured days + "+ 4 more ahead"
- **Optional** 7-day commitment; Continue always enabled
- **Give mention** as **Learn about giving** link; ♥ **Give** on feed nav
- Under-13: no Give mention or Give button (COPPA)

**Back navigation (RD-OB20):** ← on all steps until For You; selections preserved.

**Under-13:** month/year DOB before 13th birthday → read-only For You, Coach bar disabled.

## v4.2.3 — Coach preview expanded by default (Path B)

The Coach preview now renders **expanded by default** on the mirror step so it reads as a key feature, not a hidden link:

- **Meet Coach** card with starter buttons visible on load (highlighted treatment).
- Still **optional** — users can rate a sample and **Build my For You** without touching it.
- Picking a starter shows the sample reply; Back returns to the starter list.

## v4.2.2 — Coach preview in Path B

Lightweight version of Path C's Coach moment, added to Path B's existing **mirror** step (no new step, non-gating):

1. Inline **Coach preview** — pick a starter, see one canned reply; full Coach unlocks after the age check.
2. Optional: does **not** gate **Build my For You** (still only needs ≥1 sample rated).
3. Back collapses the preview before leaving the mirror step.

Keeps B shorter than C and preserves C's full guided-session differentiation.

## v4.2.1 — Path C review polish

1. **Merged daily + Coach** into one guided session; CTA **Ask Coach about this**; **Coach preview** badge + sample disclaimer.
2. **Plan reveal** — 7-day week arc, 3 featured days, compact "+ 4 more days ahead" row.
3. **Commitment softened** — optional **Yes, guide me for 7 days**; Continue always enabled.
4. **Giving** — **Learn about giving** text link replaces Support button.
5. Flow is now **6 steps** (was 7).

## Not in scope

- Real Coach AI, feed ranking, payment processing, notifications OS prompt, account creation
- Native iOS/Android DOB picker (web uses dropdowns per RD-OB25)
