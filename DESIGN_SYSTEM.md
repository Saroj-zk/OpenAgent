## SAW Design System (v1)

### Brand principles
- **Trust-first**: every UI surface should communicate verification, provenance, and dispute safety.
- **Builder-forward**: builders are not “vendors”; they are architects. Give them identity, reputation, and distribution.
- **Premium, minimal, technical**: dark base, crisp typography, restrained motion, and “terminal” accents used sparingly.

### Core story (copy foundation)
- **What**: a decentralized marketplace + social discovery hub for autonomous AI agents.
- **For Builders**: list and market for free, own your profile, keep revenue (2.5% protocol fee).
- **For Collectors**: reduce debunk risk via 72h escrow, trust tiers, and checksum verification.
- **Where**: Base-native (fast, low cost, mainstream EVM access).

### Voice & tone
- **Clear > clever**: avoid slang, “alpha”, and edgy phrasing on primary marketing pages.
- **Technical, but readable**: define trust terms in one line; show proof with short bullet pillars.
- **Confident, not absolute**: say “reduces debunk risk” and “verification window” rather than unverifiable guarantees.

### Tokens (source of truth)
Use the app’s tokens in `marketplace-app/src/index.css` as the canonical base.

- **Backgrounds**
  - `--bg-primary`: #050505
  - `--bg-secondary`: #0a0a0a
  - `--bg-card`: #0f0f0f
- **Brand**
  - `--brand-primary`: #00ff88 (primary actions, success accents)
  - `--brand-secondary`: #7b61ff (secondary accent, data/identity)
  - `--brand-warm`: #ffb800 (warnings, highlights)
- **Text**
  - `--text-primary`: #fff
  - `--text-secondary`: rgba(255,255,255,0.7)
  - `--text-muted`: rgba(255,255,255,0.4)
- **Borders**
  - `--border-color`: rgba(255,255,255,0.08)
  - `--border-hover`: rgba(255,255,255,0.15)

### Typography
- **Sans (body/UI)**: Inter
- **Heading**: Manrope (bold, tight tracking)
- **Mono**: JetBrains Mono (IDs, hashes, logs)

Suggested type scale:
- H1: 72–92px (desktop), 40–52px (mobile), weight 900–950
- H2: 44–64px, weight 900
- H3: 20–28px, weight 800
- Body: 16–20px, weight 400–500
- Labels: 10–12px, weight 800–900, tracking 0.15–0.25em, uppercase

### Layout & spacing
- **Container**: 1240px max, 32px horizontal padding desktop, 20px mobile.
- **Section padding**: 120–160px vertical on marketing pages.
- **Card radius**: 16–24px (marketing), 12–20px (app UI).

### Components (marketing)
- **Badge / label**: mono, uppercase, subtle border + glass background.
- **Primary CTA**: light button OR brand gradient; keep consistent per page.
- **Cards**: dark glass with subtle border; hover lifts \(translateY\) only.
- **“Proof” modules**: checksum + escrow + trust tiers presented as 3 pillars.

### Motion
- **Default**: transform-only animations (no opacity “ghosting” on content blocks).
- **Reduced motion**: respect `prefers-reduced-motion` by disabling scroll triggers.

