/**
 * Messenger onboarding MVP v4.2 — static prototype.
 * Path A: interests → DOB → loader → For You (no progress bar)
 * Path B: daily → interests → mirror + samples → DOB → auto loader → For You (Step 5)
 * Path C: guided journey → plan Collection + gentle Give mention (Step 6)
 */

const INTENTION_CHIPS = [
  "Peace in anxious moments",
  "Growing my faith",
  "Building a prayer habit",
  "Learning Scripture",
  "Personal growth",
  "Comfort in hard times",
  "Exploring faith",
];

const INTERESTS = [
  "Faith & Spirituality",
  "Prayer",
  "Mental Wellness",
  "Personal Growth",
  "Learning & Courses",
  "Music",
  "Other",
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAILY_ANCHOR = {
  label: "Today's anchor",
  title: "Strength for the journey",
  body: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.",
  ref: "Joshua 1:9",
};

const SAMPLE_CONTENT = {
  Prayer: [
    { type: "Prayer", title: "A morning prayer for beginners", meta: "2 min read" },
    { type: "Devotional", title: "When words won't come", meta: "Guided prayer" },
  ],
  "Faith & Spirituality": [
    { type: "Scripture", title: "Be still and know", meta: "Psalm 46:10" },
    { type: "Reflection", title: "Finding rhythm in Scripture", meta: "5 min" },
  ],
  "Mental Wellness": [
    { type: "Reflection", title: "Peace for an anxious mind", meta: "4 min" },
    { type: "Prayer", title: "Rest when you're weary", meta: "Matthew 11:28" },
  ],
  "Personal Growth": [
    { type: "Article", title: "One small step in faith", meta: "3 min" },
    { type: "Course", title: "Habits that stick", meta: "Series · 6 parts" },
  ],
  "Learning & Courses": [
    { type: "Course", title: "Foundations of faith", meta: "12 lessons" },
    { type: "Video", title: "How to study the Bible", meta: "8 min" },
  ],
  Music: [
    { type: "Worship", title: "Songs for stillness", meta: "Playlist" },
    { type: "Podcast", title: "Faith through music", meta: "24 min" },
  ],
  Other: [
    { type: "Featured", title: "Staff picks this week", meta: "Curated" },
    { type: "Scripture", title: "Verse of the day", meta: "Daily" },
  ],
};

const state = {
  path: null,
  step: 0,
  interests: new Set(),
  dobMonth: "",
  dobYear: "",
  dobVerified: false,
  under13: false,
  skippedGuided: false,
  tasteComplete: false,
  moreLikeThis: false,
  sampleLiked: new Set(),
  sampleDisliked: new Set(),
  loaderReady: false,
  loaderStarted: false,
  anchorOpened: false,
  coachUsed: false,
  skipFromStep: null,
  intentions: new Set(),
  anchorReflected: false,
  coachEngaged: false,
  coachStarter: "",
  committed7days: false,
  planRevealed: false,
};

const PATH_C_STEPS = 6;

const JOURNEY_DAYS = [
  { day: 1, title: "Strength for the journey", type: "Daily anchor", status: "complete" },
  { day: 2, title: "A moment of stillness", type: "Guided prayer", status: "upcoming" },
  { day: 3, title: "Peace for an anxious mind", type: "Reflection", status: "upcoming" },
  { day: 4, title: "Be still and know", type: "Scripture", status: "upcoming" },
  { day: 5, title: "One small step in faith", type: "Article", status: "upcoming" },
  { day: 6, title: "When words won't come", type: "Devotional", status: "upcoming" },
  { day: 7, title: "Habits that stick", type: "Course intro", status: "upcoming" },
];

const COACH_STARTERS = [
  { id: "pray", label: "Help me pray about this" },
  { id: "meaning", label: "What does this mean for me?" },
  { id: "apply", label: "How can I apply this today?" },
];

const COACH_REPLIES = {
  pray: "Let's start simple: take a breath, and name what's on your heart. I'll walk with you in prayer whenever you're ready.",
  meaning: "Joshua 1:9 was spoken to someone stepping into the unknown. Your journey isn't about having all the answers — it's about showing up with courage.",
  apply: "One small step today: read the anchor slowly once more, then write one sentence about what you need strength for.",
};

let loaderTimeoutId = null;

function resetState(path) {
  state.path = path;
  state.step = 0;
  state.interests = new Set();
  state.dobMonth = "";
  state.dobYear = "";
  state.dobVerified = false;
  state.under13 = false;
  state.skippedGuided = false;
  state.tasteComplete = false;
  state.moreLikeThis = false;
  state.sampleLiked = new Set();
  state.sampleDisliked = new Set();
  state.loaderReady = false;
  state.loaderStarted = false;
  state.anchorOpened = false;
  state.coachUsed = false;
  state.skipFromStep = null;
  state.intentions = new Set();
  state.anchorReflected = false;
  state.coachEngaged = false;
  state.coachStarter = "";
  state.committed7days = false;
  state.planRevealed = false;
  state.bCoachStarter = "";
  cancelLoader();
}

function getRoute() {
  const hash = location.hash.replace(/^#\/?/, "") || "/";
  return hash.startsWith("/") ? hash : `/${hash}`;
}

function navigate(route) {
  location.hash = route === "/" ? "#/" : `#${route}`;
}

function years() {
  const y = new Date().getFullYear();
  return Array.from({ length: 100 }, (_, i) => y - i);
}

function isUnder13(month, year) {
  if (!month || !year) return false;
  return new Date(Number(year) + 13, Number(month) - 1, 1) > new Date();
}

function sampleKey(s) {
  return `${s.type}:${s.title}`;
}

function progressBar(current, total) {
  return `<div class="progress-track" aria-hidden="true">${Array.from({ length: total }, (_, i) => {
    const cls = i < current ? "is-done" : i === current ? "is-active" : "";
    return `<div class="progress-seg ${cls}"></div>`;
  }).join("")}</div>`;
}

function hasRatedSample() {
  return state.sampleLiked.size + state.sampleDisliked.size >= 1;
}

function topBarA({ showBack = true } = {}) {
  const back = showBack
    ? `<button type="button" class="back-btn" data-action="back" aria-label="Back">←</button>`
    : `<span class="back-btn back-btn--placeholder" aria-hidden="true"></span>`;
  return `<div class="top-bar top-bar--a">${back}<span class="top-bar-spacer"></span></div>`;
}

function topBarB(stepIndex, { showSkip = false } = {}) {
  return topBarProgress(stepIndex, 5, { showSkip, skipAction: "b-skip" });
}

function topBarC(stepIndex) {
  return topBarProgress(stepIndex, PATH_C_STEPS);
}

function topBarProgress(stepIndex, total, { showSkip = false, skipAction = "" } = {}) {
  const stepNum = stepIndex + 1;
  const skip = showSkip && skipAction
    ? `<button type="button" class="text-link" data-action="${skipAction}">Skip</button>`
    : "";
  return `<div class="top-bar top-bar--b">
    <button type="button" class="back-btn" data-action="back" aria-label="Back">←</button>
    <div class="progress-block">
      <span class="step-label">Step ${stepNum} of ${total}</span>
      ${progressBar(stepIndex, total)}
    </div>
    ${skip || '<span class="top-bar-spacer top-bar-spacer--narrow"></span>'}
  </div>`;
}

function cancelLoader() {
  if (loaderTimeoutId) {
    clearTimeout(loaderTimeoutId);
    loaderTimeoutId = null;
  }
}

function handleBack(pathKey) {
  if (pathKey === "a") {
    if (state.step <= 0) {
      navigate("/");
      return;
    }
    if (state.step === 2) cancelLoader();
    state.loaderReady = false;
    state.loaderStarted = false;
    state.step -= 1;
    render();
    return;
  }

  if (pathKey === "c") {
    if (state.step <= 0) {
      navigate("/");
      return;
    }
    state.planRevealed = false;
    if (state.step === 1 && state.coachEngaged) {
      state.coachEngaged = false;
      state.coachStarter = "";
      render();
      return;
    }
    if (state.step === 1 && state.anchorReflected) {
      state.anchorReflected = false;
      render();
      return;
    }
    state.step -= 1;
    render();
    return;
  }

  if (state.step <= 0) {
    navigate("/");
    return;
  }
  if (state.step === 2 && state.bCoachStarter) {
    state.bCoachStarter = "";
    render();
    return;
  }
  if (state.skippedGuided && state.step === 3) {
    state.skippedGuided = false;
    state.step = state.skipFromStep ?? 1;
    state.skipFromStep = null;
    render();
    return;
  }
  if (state.step === 4) cancelLoader();
  state.loaderReady = false;
  state.loaderStarted = false;
  state.step -= 1;
  render();
}

function chipGrid(group = "interests") {
  const labels = group === "intentions" ? INTENTION_CHIPS : INTERESTS;
  const selected = group === "intentions" ? state.intentions : state.interests;
  const aria = group === "intentions" ? "What brought you here" : "Interests";
  return `<div class="chip-grid" role="group" aria-label="${aria}">${labels.map(
    (label) =>
      `<button type="button" class="chip ${selected.has(label) ? "is-selected" : ""}" data-chip="${label}" data-chip-group="${group}">${label}</button>`,
  ).join("")}</div>`;
}

function journeyPlanTitle() {
  const primary = [...state.intentions][0];
  if (!primary) return "Your 7-day journey";
  if (primary.includes("anxious") || primary.includes("Peace")) return "Finding peace in anxious moments";
  if (primary.includes("prayer")) return "Building a prayer rhythm";
  if (primary.includes("Scripture") || primary.includes("Learning")) return "Growing in Scripture";
  if (primary.includes("growth")) return "One step at a time";
  if (primary.includes("Comfort")) return "Strength for hard seasons";
  return `Your journey: ${primary}`;
}

function journeyPlanMarkup({ compact = false } = {}) {
  const title = journeyPlanTitle();
  const featuredDays = JOURNEY_DAYS.slice(0, 3);
  const laterDays = JOURNEY_DAYS.slice(3);

  const featuredCards = featuredDays
    .map((d) => {
      const statusCls = d.status === "complete" ? "is-complete" : "";
      const statusLabel = d.status === "complete" ? "Day 1 done" : `Day ${d.day}`;
      return `<div class="plan-day ${statusCls}">
      <div class="plan-day__badge">${statusLabel}</div>
      <div class="plan-day__meta">
        <div class="plan-day__type">${d.type}</div>
        <div class="plan-day__title">${d.title}</div>
      </div>
    </div>`;
    })
    .join("");

  const weekArc = `<div class="plan-week-arc" aria-label="7-day journey">${JOURNEY_DAYS.map((d, i) => {
    const cls = [
      "plan-week-dot",
      d.status === "complete" ? "is-done" : "",
      i === 0 ? "is-current" : "",
    ].filter(Boolean).join(" ");
    return `<span class="${cls}">${d.day}</span>`;
  }).join("")}</div>`;

  const moreAhead = `<p class="plan-more">+ ${laterDays.length} more days ahead: ${laterDays.map((d) => d.type).join(" · ")}</p>`;

  if (compact) {
    return `<article class="collection-card" data-action="open-collection" tabindex="0">
      <div class="collection-card__label">Your Collection</div>
      <div class="collection-card__title">${title}</div>
      ${weekArc}
      <div class="collection-card__progress">Day 1 of 7 complete · Coach recommends more over time</div>
    </article>`;
  }

  return `<div class="plan-reveal ${state.planRevealed ? "is-revealed" : ""}">
    <p class="eyebrow">Your Collection</p>
    <h2 class="title title--sm">${title}</h2>
    <p class="subtitle subtitle--tight">A 7-day path built from what you shared. Day 1 is already underway.</p>
    ${weekArc}
    <div class="plan-stack plan-stack--featured">${featuredCards}</div>
    ${moreAhead}
    <p class="plan-note">This adapts as you go — courses and content recommended over time.</p>
  </div>`;
}

function dobFields(idPrefix = "dob") {
  return `<div class="field-row">
    <div class="field-group">
      <label class="field-label" for="${idPrefix}-month">Month</label>
      <select class="select-input" id="${idPrefix}-month" data-dob-month>
        <option value="">Month</option>
        ${MONTHS.map((m, i) => `<option value="${i + 1}" ${state.dobMonth === String(i + 1) ? "selected" : ""}>${m}</option>`).join("")}
      </select>
    </div>
    <div class="field-group">
      <label class="field-label" for="${idPrefix}-year">Year</label>
      <select class="select-input" id="${idPrefix}-year" data-dob-year>
        <option value="">Year</option>
        ${years().map((y) => `<option value="${y}" ${state.dobYear === String(y) ? "selected" : ""}>${y}</option>`).join("")}
      </select>
    </div>
  </div>`;
}

function dailyAnchorPreview(compact = false) {
  const d = DAILY_ANCHOR;
  if (compact) {
    return `<article class="anchor-preview anchor-preview--compact">
      <div class="anchor-preview__label">${d.label}</div>
      <h2 class="anchor-preview__title">${d.title}</h2>
      <p class="anchor-preview__body">"${d.body}"</p>
      <cite class="anchor-preview__ref">${d.ref}</cite>
    </article>`;
  }
  return `<article class="anchor-preview">
    <div class="anchor-preview__label">${d.label}</div>
    <h2 class="anchor-preview__title">${d.title}</h2>
    <p class="anchor-preview__body">"${d.body}"</p>
    <cite class="anchor-preview__ref">${d.ref}</cite>
  </article>`;
}

function sampleSuggestions() {
  const picks = [...state.interests];
  const seen = new Set();
  const items = [];
  for (const interest of picks) {
    const samples = SAMPLE_CONTENT[interest] || [];
    for (const s of samples) {
      const key = sampleKey(s);
      if (!seen.has(key)) {
        seen.add(key);
        items.push({ ...s, interest, key });
      }
    }
  }
  if (!items.length) {
    items.push(
      { type: "Scripture", title: "Be strong and courageous", meta: "Joshua 1:9", interest: "Daily", key: "Scripture:Be strong and courageous" },
      { type: "Prayer", title: "A moment of stillness", meta: "2 min", interest: "Prayer", key: "Prayer:A moment of stillness" },
    );
  }
  return items.slice(0, 2).map((s) => ({ ...s, key: s.key || sampleKey(s) }));
}

function personalizedSamples() {
  const all = sampleSuggestions();
  const liked = all.filter((s) => state.sampleLiked.has(s.key));
  const filtered = all.filter((s) => !state.sampleDisliked.has(s.key));
  if (liked.length) return liked;
  if (filtered.length) return filtered;
  return all;
}

function sampleCardsMarkup() {
  return sampleSuggestions()
    .map((s) => {
      const liked = state.sampleLiked.has(s.key);
      const disliked = state.sampleDisliked.has(s.key);
      const cls = liked ? "is-liked" : disliked ? "is-passed" : "";
      return `<div class="sample-card ${cls}" data-sample-key="${s.key}">
        <div class="sample-card__row">
          <div class="sample-card__thumb" aria-hidden="true"></div>
          <div class="sample-card__meta">
            <div class="sample-card__type">${s.type}</div>
            <div class="sample-card__title">${s.title}</div>
            <div class="sample-card__sub">${s.meta} · ${s.interest}</div>
          </div>
        </div>
        <div class="sample-card__actions">
          <button type="button" class="sample-action sample-action--like ${liked ? "is-active" : ""}" data-sample-like="${s.key}">I like this</button>
          <button type="button" class="sample-action sample-action--pass ${disliked ? "is-active" : ""}" data-sample-pass="${s.key}">Not for me</button>
        </div>
      </div>`;
    })
    .join("");
}

function coachPreviewB() {
  if (state.bCoachStarter) {
    const reply = COACH_REPLIES[state.bCoachStarter] || "";
    const label = COACH_STARTERS.find((s) => s.id === state.bCoachStarter)?.label || "";
    return `<div class="coach-preview-inline coach-preview-inline--feature">
      <span class="coach-preview-badge">Meet Coach</span>
      <div class="coach-exchange">
        <div class="coach-bubble coach-bubble--user">${label}</div>
        <div class="coach-bubble coach-bubble--coach">${reply}</div>
      </div>
      <p class="coach-hint">Full Coach chat unlocks after the age check.</p>
    </div>`;
  }
  return `<div class="coach-preview-inline coach-preview-inline--feature">
    <span class="coach-preview-badge">Meet Coach</span>
    <p class="coach-preview-lede">Your AI guide for going deeper on any of this.</p>
    <p class="coach-hint">Tap one to see a sample reply — optional, you can continue without it.</p>
    <div class="starter-stack">${COACH_STARTERS.map(
    (s) => `<button type="button" class="starter-btn" data-b-coach-starter="${s.id}">${s.label}</button>`,
  ).join("")}</div>
  </div>`;
}

function loaderStage({ showDaily = false, manualContinue = false } = {}) {
  const ready = manualContinue && state.loaderReady;
  return `<div class="loader-stage ${ready ? "is-ready" : ""}">
    <div class="loader-ring ${ready ? "is-hidden" : ""}" data-loader-spinner aria-hidden="true"></div>
    <h2 class="title title--sm">${ready ? "Your feed is ready" : "We're building your personalized feed"}</h2>
    <p class="loader-themes" data-loader-themes>${ready ? themeUnlockMarkup() : "Personalizing…"}</p>
    ${showDaily ? `<div class="loader-daily">${dailyAnchorPreview(true)}</div>` : ""}
    ${manualContinue ? `<button type="button" class="btn-primary loader-continue ${ready ? "" : "is-hidden"}" data-action="loader-continue">See my For You</button>` : ""}
  </div>`;
}

function loaderScreen({ showDaily = false, manualContinue = false, topBar = "" } = {}) {
  const inner = loaderStage({ showDaily, manualContinue });
  if (topBar) {
    return `<div class="screen-onboarding" data-flow="loader">
      <div class="onboarding-inner onboarding-inner--loader">${topBar}${inner}</div>
    </div>`;
  }
  return `<div class="screen-onboarding" data-flow="loader">${inner}</div>`;
}

function renderHome() {
  return `<div class="screen-home">
    <div class="home-cluster">
      <div class="logo-mark" aria-hidden="true"></div>
      <p class="eyebrow">Onboarding MVP v4.2.3</p>
      <h1 class="title">Messenger 4.0</h1>
      <p class="subtitle subtitle--tight">Speed · taste · or a guided journey with a plan.</p>
      <a class="path-card" href="#/path-a" data-go="/path-a">
        <strong>Path A — Fast Start</strong>
        <span>Interests → DOB → See my For You → feed</span>
      </a>
      <a class="path-card" href="#/path-b" data-go="/path-b">
        <strong>Path B — Taste + Personalize</strong>
        <span>Daily → interests → samples → Build For You</span>
      </a>
      <a class="path-card path-card--highlight" href="#/path-c" data-go="/path-c">
        <strong>Path C — Guided Journey</strong>
        <span>Intention → daily + Coach preview → plan Collection</span>
      </a>
    </div>
    <p class="meta-note home-meta">P-01 v4.2 · discovery.md</p>
  </div>`;
}

/* ─── Path A: interests → DOB → loader (daily, manual) → feed ─── */
function renderPathA() {
  const steps = ["interests", "dob", "loader", "feed"];
  const step = steps[state.step];

  if (step === "interests") {
    return `<div class="screen-onboarding screen-interests">
      <div class="onboarding-inner">
        ${topBarA()}
        <p class="eyebrow">Quick setup</p>
        <h1 class="title title--sm">What are you interested in?</h1>
        <p class="subtitle">Select all that apply — we'll shape your For You feed.</p>
        ${chipGrid()}
        <div class="footer-actions">
          <button type="button" class="btn-primary" data-action="a-interests-continue" ${state.interests.size ? "" : "disabled"}>Continue</button>
        </div>
      </div>
    </div>`;
  }

  if (step === "dob") {
    return `<div class="screen-onboarding">
      <div class="onboarding-inner">
        ${topBarA()}
        <p class="eyebrow">Before Coach</p>
        <h1 class="title title--sm">When were you born?</h1>
        <p class="subtitle">Required for Coach chat. Users under 13 can still browse For You.</p>
        ${dobFields("a")}
        <div class="footer-actions footer-actions--tight">
          <button type="button" class="btn-primary" data-action="a-dob-continue" disabled>Continue</button>
        </div>
      </div>
    </div>`;
  }

  if (step === "loader") {
    return loaderScreen({ showDaily: true, manualContinue: true, topBar: topBarA() });
  }
  return renderForYou("a");
}

/* ─── Path B: daily → interests → mirror+samples → DOB → loader → feed ─── */
function renderPathB() {
  const steps = ["taste", "quiz", "mirror", "dob", "loader", "feed"];
  let step = steps[state.step] ?? "feed";

  if (state.skippedGuided && step !== "feed" && step !== "loader") {
    step = !state.dobVerified ? "dob" : "loader";
  }

  if (step === "taste") {
    return `<div class="screen-onboarding screen-taste">
      <div class="onboarding-inner">
        ${topBarB(0)}
        <p class="eyebrow">MessengerX Daily</p>
        <h1 class="title title--sm">Start here</h1>
        <p class="subtitle subtitle--tight">Here's today's staff-picked message:</p>
        ${dailyAnchorPreview(true)}
        <div class="footer-actions footer-actions--tight">
          <button type="button" class="btn-primary" data-action="b-taste-continue">Read & continue</button>
        </div>
      </div>
    </div>`;
  }

  if (step === "quiz") {
    return `<div class="screen-onboarding screen-interests">
      <div class="onboarding-inner">
        ${topBarB(1, { showSkip: true })}
        <p class="eyebrow">Personalize</p>
        <h1 class="title title--sm">What do you want more of?</h1>
        <p class="subtitle">Choose everything that resonates — we'll suggest content like this.</p>
        ${chipGrid()}
        <div class="footer-actions footer-actions--tight">
          <button type="button" class="btn-primary" data-action="b-quiz-continue" ${state.interests.size ? "" : "disabled"}>Continue</button>
        </div>
      </div>
    </div>`;
  }

  if (step === "mirror") {
    const items = [...state.interests];
    const rated = hasRatedSample();
    const hasLikes = state.sampleLiked.size > 0;
    return `<div class="screen-onboarding screen-mirror">
      <div class="onboarding-inner onboarding-inner--mirror">
        <div class="mirror-body">
          ${topBarB(2, { showSkip: true })}
          <p class="eyebrow">Here's what we heard</p>
          <h1 class="title title--sm">Content picked for you</h1>
          <ul class="mirror-list mirror-list--inline">${items.map((i) => `<li>${i}</li>`).join("")}</ul>
          <p class="body-copy">Based on your choices, you might like:</p>
          <div class="sample-stack">${sampleCardsMarkup()}</div>
          ${!rated ? '<p class="mirror-feedback">Tap like or not for me on at least one card to continue.</p>' : ""}
          ${hasLikes ? '<p class="mirror-feedback">We\'ll prioritize what you liked.</p>' : rated && !hasLikes ? '<p class="mirror-feedback">Got it — we\'ll tune your feed.</p>' : ""}
          ${coachPreviewB()}
        </div>
        <div class="mirror-footer">
          <button type="button" class="btn-primary" data-action="b-more-like" ${rated ? "" : "disabled"}>Build my For You</button>
          <button type="button" class="btn-ghost" data-action="b-skip">Not now</button>
        </div>
      </div>
    </div>`;
  }

  if (step === "dob") {
    return `<div class="screen-onboarding">
      <div class="onboarding-inner">
        ${topBarB(3, { showSkip: !state.skippedGuided })}
        <p class="eyebrow">Almost there</p>
        <h1 class="title title--sm">When were you born?</h1>
        <p class="subtitle">Required for Coach chat. Browse For You without it until you're ready.</p>
        ${dobFields("b")}
        <div class="footer-actions footer-actions--tight">
          <button type="button" class="btn-primary" data-action="b-dob-continue" disabled>Continue</button>
        </div>
      </div>
    </div>`;
  }

  if (step === "loader") {
    return loaderScreen({ showDaily: false, manualContinue: false, topBar: topBarB(4) });
  }
  return renderForYou("b");
}

/* ─── Path C: intention → session (daily+coach) → mirror → commit → DOB → payoff → feed ─── */
function renderPathCSession() {
  const inRead = !state.anchorReflected;
  const inCoachPick = state.anchorReflected && !state.coachEngaged;
  const reply = COACH_REPLIES[state.coachStarter] || "";

  let body = "";
  if (inRead) {
    body = `<p class="subtitle subtitle--tight">Read today's staff-picked message slowly:</p>
      ${dailyAnchorPreview()}
      <p class="body-copy">Let it land. There's no rush.</p>
      <div class="footer-actions footer-actions--tight">
        <button type="button" class="btn-primary" data-action="c-ask-coach">Ask Coach about this</button>
      </div>`;
  } else if (inCoachPick) {
    body = `<div class="session-anchor-reminder">${dailyAnchorPreview(true)}</div>
      <span class="coach-preview-badge">Coach preview</span>
      <p class="subtitle subtitle--tight">Pick a way to explore today's anchor. Sample only — full Coach unlocks after age check.</p>
      <div class="starter-stack">${COACH_STARTERS.map(
      (s) => `<button type="button" class="starter-btn" data-coach-starter="${s.id}">${s.label}</button>`,
    ).join("")}</div>`;
  } else {
    body = `<div class="session-anchor-reminder">${dailyAnchorPreview(true)}</div>
      <span class="coach-preview-badge">Coach preview</span>
      <p class="subtitle subtitle--tight">Sample response — full Coach chat unlocks after age check.</p>
      <div class="coach-exchange">
        <div class="coach-bubble coach-bubble--user">${COACH_STARTERS.find((s) => s.id === state.coachStarter)?.label || ""}</div>
        <div class="coach-bubble coach-bubble--coach">${reply}</div>
      </div>
      <div class="footer-actions footer-actions--tight">
        <button type="button" class="btn-primary" data-action="c-coach-continue">Continue</button>
      </div>`;
  }

  const heading = inRead ? "Take a moment" : inCoachPick ? "Go deeper with Coach" : "Coach preview";

  return `<div class="screen-onboarding screen-session">
    <div class="onboarding-inner onboarding-inner--scroll">
      ${topBarC(1)}
      <p class="eyebrow">${inRead ? "Today's anchor" : "Today's anchor · Coach preview"}</p>
      <h1 class="title title--sm">${heading}</h1>
      ${body}
    </div>
  </div>`;
}

function renderPathC() {
  const steps = ["intention", "session", "mirror", "commit", "dob", "payoff", "feed"];
  const step = steps[state.step] ?? "feed";

  if (step === "intention") {
    return `<div class="screen-onboarding screen-interests">
      <div class="onboarding-inner">
        ${topBarC(0)}
        <p class="eyebrow">Start with intention</p>
        <h1 class="title title--sm">What brought you here today?</h1>
        <p class="subtitle">Choose everything that resonates — we'll shape your journey around it.</p>
        ${chipGrid("intentions")}
        <div class="footer-actions footer-actions--tight">
          <button type="button" class="btn-primary" data-action="c-intention-continue" ${state.intentions.size ? "" : "disabled"}>Continue</button>
        </div>
      </div>
    </div>`;
  }

  if (step === "session") return renderPathCSession();

  if (step === "mirror") {
    const items = [...state.intentions];
    return `<div class="screen-onboarding">
      <div class="onboarding-inner onboarding-inner--scroll">
        ${topBarC(2)}
        <p class="eyebrow">Here's what we heard</p>
        <h1 class="title title--sm">Your path is taking shape</h1>
        <ul class="mirror-list mirror-list--inline">${items.map((i) => `<li>${i}</li>`).join("")}</ul>
        <p class="body-copy">You read today's anchor and tried the Coach preview. Next we'll build a 7-day Collection around this.</p>
        <div class="mirror-summary">
          <div class="mirror-summary__row"><span>Anchor</span><strong>Read ✓</strong></div>
          <div class="mirror-summary__row"><span>Coach</span><strong>Preview ✓</strong></div>
        </div>
        <div class="footer-actions footer-actions--tight">
          <button type="button" class="btn-primary" data-action="c-mirror-continue">Build my journey</button>
        </div>
      </div>
    </div>`;
  }

  if (step === "commit") {
    return `<div class="screen-onboarding">
      <div class="onboarding-inner">
        ${topBarC(3)}
        <p class="eyebrow">Your commitment</p>
        <h1 class="title title--sm">Show up for 7 days</h1>
        <p class="subtitle">Small, steady steps beat a perfect start. Your Collection will guide you one day at a time.</p>
        <button type="button" class="commit-card ${state.committed7days ? "is-selected" : ""}" data-action="c-toggle-commit">
          <span class="commit-card__check">${state.committed7days ? "✓" : ""}</span>
          <span class="commit-card__text">Yes, guide me for 7 days</span>
        </button>
        <p class="commit-optional">Optional — tap if you want a guided week. You can continue either way.</p>
        <div class="footer-actions footer-actions--tight">
          <button type="button" class="btn-primary" data-action="c-commit-continue">Continue</button>
        </div>
      </div>
    </div>`;
  }

  if (step === "dob") {
    return `<div class="screen-onboarding">
      <div class="onboarding-inner">
        ${topBarC(4)}
        <p class="eyebrow">Before full Coach</p>
        <h1 class="title title--sm">When were you born?</h1>
        <p class="subtitle">Required for full Coach chat. Users under 13 can still browse and follow their Collection.</p>
        ${dobFields("c")}
        <div class="footer-actions footer-actions--tight">
          <button type="button" class="btn-primary" data-action="c-dob-continue" disabled>Continue</button>
        </div>
      </div>
    </div>`;
  }

  if (step === "payoff") {
    const giveBlock = state.under13
      ? ""
      : `<div class="give-mention">
          <p class="give-mention__text">Messenger is free — and always will be. Like a church, we're kept free by people who choose to give. You'll find <strong>Give</strong> anytime in the menu.</p>
          <button type="button" class="text-link text-link--ghost give-mention__link" data-action="c-give-hint">Learn about giving</button>
        </div>`;
    return `<div class="screen-onboarding screen-payoff">
      <div class="onboarding-inner onboarding-inner--scroll">
        ${topBarC(5)}
        ${journeyPlanMarkup()}
        ${giveBlock}
        <div class="footer-actions footer-actions--tight">
          <button type="button" class="btn-primary" data-action="c-payoff-continue">Continue to For You</button>
        </div>
      </div>
    </div>`;
  }

  return renderForYou("c");
}

function themeUnlockMarkup() {
  const items = state.interests.size ? [...state.interests] : ["Daily anchor", "Faith content"];
  if (state.moreLikeThis && state.sampleLiked.size) items.unshift("Your picks");
  else if (state.moreLikeThis) items.unshift("Personalized");
  return items.map((t) => `<span class="theme-pill">${t}</span>`).join("");
}

function renderForYou(pathLabel) {
  const under13 = state.under13;
  const sawDaily = state.tasteComplete || state.anchorReflected || (pathLabel === "a" && state.loaderReady);
  const welcome =
    pathLabel === "c"
      ? "Your Collection is ready — Day 1 is underway"
      : pathLabel === "b" && state.moreLikeThis
        ? "Your feed — tuned to what you liked"
        : sawDaily
          ? "Good morning — today's daily is ready"
          : "Good morning — here's For You";

  const giveBtn = under13
    ? ""
    : `<button type="button" class="icon-btn icon-btn--give" data-action="open-give" aria-label="Give">♥</button>`;

  return `<div class="screen-feed" data-flow="feed">
    <div class="feed-nav">
      <div class="avatar" aria-hidden="true"></div>
      <div class="nav-pill" role="tablist">
        <button type="button" class="nav-tab is-active" role="tab" aria-selected="true">For You</button>
        <button type="button" class="nav-tab" data-hint-library>Library</button>
      </div>
      ${giveBtn || '<button type="button" class="icon-btn" aria-label="Menu">⋮</button>'}
    </div>
    ${under13 ? '<div class="badge-under13">Coach is unavailable for users under 13. You can still read today\'s anchor and staff content.</div>' : ""}
    <div class="feed-scroll">
      <p class="welcome-line">${welcome}</p>
      ${pathLabel === "c" ? journeyPlanMarkup({ compact: true }) : ""}
      <article class="daily-anchor ${state.anchorOpened || sawDaily ? "" : "is-highlight"}" data-action="open-anchor" tabindex="0">
        <div class="daily-anchor__hero">
          <div>
            <div class="daily-anchor__label">MessengerX Daily</div>
            <div class="daily-anchor__title">${DAILY_ANCHOR.title}</div>
          </div>
        </div>
      </article>
      ${state.moreLikeThis ? `<p class="feed-section-label">More like what you picked</p>` : ""}
      ${pathLabel === "c" ? `<p class="feed-section-label">Recommended for your journey</p>` : ""}
      ${feedCards(pathLabel)}
    </div>
    <div class="feed-footer">
      <div class="coach-bar ${under13 ? "is-disabled" : state.coachUsed ? "" : "is-pulse"}" data-action="coach-tap" role="button" tabindex="0">
        <span class="coach-bar__placeholder">What's on your mind?</span>
      </div>
      <p class="feed-meta">Path ${pathLabel.toUpperCase()} · <a class="feed-meta__link" href="#/">Restart</a></p>
    </div>
  </div>`;
}

function feedCards(pathLabel = "a") {
  if (state.moreLikeThis) {
    return personalizedSamples()
      .slice(0, 2)
      .map(
        (s) => `<div class="feed-card">
          <div class="feed-card__thumb" aria-hidden="true"></div>
          <div class="feed-card__meta">
            <div class="feed-card__type">${s.type}</div>
            <div class="feed-card__title">${s.title}</div>
          </div>
        </div>`,
      )
      .join("");
  }

  const themes = pathLabel === "c" ? [...state.intentions] : [...state.interests].slice(0, 2);
  const cards = [
    { type: "Scripture", title: DAILY_ANCHOR.title },
    { type: "Prayer", title: "A moment of stillness" },
  ];
  if (themes.some((t) => t.includes("anxious") || t.includes("Peace") || t.includes("Mental"))) {
    cards[1] = { type: "Reflection", title: "Peace for an anxious mind" };
  }
  if (themes.some((t) => t.includes("Learning") || t.includes("Scripture"))) {
    cards.push({ type: "Course", title: "Foundations of faith" });
  }
  if (pathLabel === "c") {
    cards[1] = { type: "Guided prayer", title: JOURNEY_DAYS[1].title };
  }
  return cards.slice(0, 2)
    .map(
      (c) => `<div class="feed-card">
        <div class="feed-card__thumb" aria-hidden="true"></div>
        <div class="feed-card__meta">
          <div class="feed-card__type">${c.type}</div>
          <div class="feed-card__title">${c.title}</div>
        </div>
      </div>`,
    )
    .join("");
}

function render() {
  const route = getRoute();
  const app = document.getElementById("app");
  if (!app) return;

  if (route === "/path-c") {
    const cfg = { key: "c", render: renderPathC, bind: bindPathC, feedStep: 6 };
    if (state.path !== cfg.key) resetState(cfg.key);
    app.innerHTML = cfg.render();
    if (state.step === 5 && !state.planRevealed) {
      requestAnimationFrame(() => {
        state.planRevealed = true;
        document.querySelector(".plan-reveal")?.classList.add("is-revealed");
      });
    }
    cfg.bind();
    return;
  }

  if (route === "/" || route === "") {
    app.innerHTML = renderHome();
    return;
  }

  const paths = {
    "/path-a": { key: "a", render: renderPathA, loaderStep: 2, feedStep: 3, manualLoader: true, bind: bindPathA },
    "/path-b": { key: "b", render: renderPathB, loaderStep: 4, feedStep: 5, manualLoader: false, bind: bindPathB },
  };

  const cfg = paths[route];
  if (!cfg) {
    app.innerHTML = renderHome();
    return;
  }

  if (state.path !== cfg.key) resetState(cfg.key);
  app.innerHTML = cfg.render();

  if (cfg.loaderStep >= 0 && state.step === cfg.loaderStep && !state.loaderStarted) {
    state.loaderStarted = true;
    runLoader({
      manual: cfg.manualLoader,
      onDone: () => {
        state.loaderStarted = false;
        state.step = cfg.feedStep;
        if (cfg.key === "a") state.tasteComplete = true;
        render();
      },
    });
  }

  cfg.bind();
}

function runLoader({ onDone, manual = false }) {
  const el = document.querySelector("[data-loader-themes]");
  const spinner = document.querySelector("[data-loader-spinner]");
  const btn = document.querySelector('[data-action="loader-continue"]');
  const stage = document.querySelector(".loader-stage");

  if (!el) {
    if (!manual) setTimeout(onDone, 1800);
    return;
  }

  if (manual && state.loaderReady) {
    spinner?.classList.add("is-hidden");
    btn?.classList.remove("is-hidden");
    stage?.classList.add("is-ready");
    el.innerHTML = themeUnlockMarkup();
    const title = document.querySelector(".loader-stage .title");
    if (title) title.textContent = "Your feed is ready";
    return;
  }

  el.innerHTML = "Unlocking themes…";
  setTimeout(() => {
    el.innerHTML = themeUnlockMarkup();
  }, 700);

  if (manual) {
    setTimeout(() => {
      state.loaderReady = true;
      spinner?.classList.add("is-hidden");
      btn?.classList.remove("is-hidden");
      stage?.classList.add("is-ready");
      const title = document.querySelector(".loader-stage .title");
      if (title) title.textContent = "Your feed is ready";
    }, 1200);
  } else {
    loaderTimeoutId = setTimeout(() => {
      loaderTimeoutId = null;
      state.loaderStarted = false;
      onDone();
    }, 2000);
  }
}

function bindChips() {
  document.querySelectorAll("[data-chip]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const label = btn.getAttribute("data-chip");
      const group = btn.getAttribute("data-chip-group") || "interests";
      const set = group === "intentions" ? state.intentions : state.interests;
      if (set.has(label)) set.delete(label);
      else set.add(label);
      render();
    });
  });
}

function bindSampleActions() {
  document.querySelectorAll("[data-sample-like]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const key = btn.getAttribute("data-sample-like");
      state.sampleDisliked.delete(key);
      if (state.sampleLiked.has(key)) state.sampleLiked.delete(key);
      else state.sampleLiked.add(key);
      render();
    });
  });
  document.querySelectorAll("[data-sample-pass]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const key = btn.getAttribute("data-sample-pass");
      state.sampleLiked.delete(key);
      if (state.sampleDisliked.has(key)) state.sampleDisliked.delete(key);
      else state.sampleDisliked.add(key);
      render();
    });
  });
}

function bindDob(action) {
  const month = document.querySelector("[data-dob-month]");
  const year = document.querySelector("[data-dob-year]");
  const submit = document.querySelector(`[data-action="${action}"]`);
  const sync = () => {
    state.dobMonth = month?.value || "";
    state.dobYear = year?.value || "";
    if (submit) submit.disabled = !(state.dobMonth && state.dobYear);
  };
  month?.addEventListener("change", sync);
  year?.addEventListener("change", sync);
  sync();
}

function applyDob() {
  state.dobVerified = true;
  state.under13 = isUnder13(state.dobMonth, state.dobYear);
}

function bindFeed() {
  document.querySelector("[data-action='open-anchor']")?.addEventListener("click", () => {
    state.anchorOpened = true;
    document.querySelector(".daily-anchor")?.classList.remove("is-highlight");
    if (!state.under13) {
      showToast("Daily anchor opened", "Turn on notifications for tomorrow's anchor?", dismissToast);
    } else {
      showToast("Daily anchor opened", null, dismissToast);
    }
  });

  document.querySelector("[data-action='coach-tap']")?.addEventListener("click", () => {
    if (state.under13) return;
    state.coachUsed = true;
    document.querySelector(".coach-bar")?.classList.remove("is-pulse");
    showToast("Coach opens here", "Global bottom bar — available from any screen.", dismissToast);
  });

  document.querySelector("[data-hint-library]")?.addEventListener("click", () => {
    showToast("Library", "Swipe or tap Library in the top pill.", dismissToast);
  });

  document.querySelector("[data-action='open-collection']")?.addEventListener("click", () => {
    showToast("Your Collection", `${journeyPlanTitle()} — Day 2 unlocks tomorrow. Coach will recommend courses over time.`, dismissToast);
  });

  document.querySelector("[data-action='open-give']")?.addEventListener("click", () => {
    showToast(
      "Give",
      "One-time or monthly Partner giving. Like a church offering — always optional, always appreciated.",
      dismissToast,
    );
  });
}

function showToast(title, body, onClick) {
  dismissToast();
  const host = document.getElementById("app") || document.body;
  const t = document.createElement("div");
  t.className = "toast";
  t.innerHTML = `<strong>${title}</strong>${body ? `<p class="toast__body">${body}</p>` : ""}<button type="button">${body ? "Not now" : "OK"}</button>`;
  t.querySelector("button")?.addEventListener("click", onClick || dismissToast);
  host.appendChild(t);
}

function dismissToast() {
  document.querySelectorAll(".toast").forEach((el) => el.remove());
}

function bindBack(pathKey) {
  document.querySelector('[data-action="back"]')?.addEventListener("click", () => handleBack(pathKey));
}

function bindPathA() {
  bindChips();
  bindDob("a-dob-continue");
  bindBack("a");
  document.querySelector('[data-action="a-interests-continue"]')?.addEventListener("click", () => {
    state.step = 1;
    render();
  });
  document.querySelector('[data-action="a-dob-continue"]')?.addEventListener("click", () => {
    applyDob();
    state.loaderReady = false;
    state.loaderStarted = false;
    state.step = 2;
    render();
  });
  document.querySelector('[data-action="loader-continue"]')?.addEventListener("click", () => {
    state.tasteComplete = true;
    state.loaderStarted = false;
    state.step = 3;
    render();
  });
  if (state.step === 3) bindFeed();
}

function bindPathB() {
  bindChips();
  bindDob("b-dob-continue");
  bindSampleActions();
  bindBack("b");

  document.querySelector('[data-action="b-taste-continue"]')?.addEventListener("click", () => {
    state.tasteComplete = true;
    state.step = 1;
    render();
  });
  document.querySelector('[data-action="b-quiz-continue"]')?.addEventListener("click", () => {
    state.step = 2;
    render();
  });
  document.querySelectorAll("[data-b-coach-starter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.bCoachStarter = btn.getAttribute("data-b-coach-starter");
      render();
    });
  });
  document.querySelector('[data-action="b-more-like"]')?.addEventListener("click", () => {
    state.moreLikeThis = true;
    state.step = 3;
    render();
  });
  document.querySelector('[data-action="b-dob-continue"]')?.addEventListener("click", () => {
    applyDob();
    state.step = 4;
    render();
  });

  const skip = () => {
    state.skipFromStep = state.step;
    state.skippedGuided = true;
    state.step = state.dobVerified ? 4 : 3;
    render();
  };
  document.querySelectorAll('[data-action="b-skip"]').forEach((el) => {
    el.addEventListener("click", skip);
  });

  if (state.step === 5) bindFeed();
}

function bindPathC() {
  bindChips();
  bindDob("c-dob-continue");
  bindBack("c");

  document.querySelector('[data-action="c-intention-continue"]')?.addEventListener("click", () => {
    state.step = 1;
    render();
  });
  document.querySelector('[data-action="c-ask-coach"]')?.addEventListener("click", () => {
    state.anchorReflected = true;
    state.tasteComplete = true;
    render();
  });
  document.querySelectorAll("[data-coach-starter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.coachStarter = btn.getAttribute("data-coach-starter");
      state.coachEngaged = true;
      render();
    });
  });
  document.querySelector('[data-action="c-coach-continue"]')?.addEventListener("click", () => {
    state.coachUsed = true;
    state.step = 2;
    render();
  });
  document.querySelector('[data-action="c-mirror-continue"]')?.addEventListener("click", () => {
    state.step = 3;
    render();
  });
  document.querySelector('[data-action="c-toggle-commit"]')?.addEventListener("click", () => {
    state.committed7days = !state.committed7days;
    render();
  });
  document.querySelector('[data-action="c-commit-continue"]')?.addEventListener("click", () => {
    state.step = 4;
    render();
  });
  document.querySelector('[data-action="c-dob-continue"]')?.addEventListener("click", () => {
    applyDob();
    state.step = 5;
    render();
  });
  document.querySelector('[data-action="c-give-hint"]')?.addEventListener("click", () => {
    showToast(
      "About giving",
      "Give anytime from the menu. One-time or monthly — helps keep Messenger free for everyone.",
      dismissToast,
    );
  });
  document.querySelector('[data-action="c-payoff-continue"]')?.addEventListener("click", () => {
    state.step = 6;
    render();
  });

  if (state.step === 6) bindFeed();
}

document.getElementById("app")?.addEventListener("click", (e) => {
  const go = e.target.closest("[data-go]");
  if (go) {
    e.preventDefault();
    const path = go.getAttribute("data-go");
    if (path === "/path-a") resetState("a");
    if (path === "/path-b") resetState("b");
    if (path === "/path-c") resetState("c");
    navigate(path);
  }
});

window.addEventListener("hashchange", render);
render();
