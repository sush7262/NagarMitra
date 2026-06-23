# NagarMitra — Complete UI Redesign Prompt for Antigravity

## 🎯 Mission
Redesign the entire NagarMitra frontend with a premium, modern dark UI that feels like a fusion of a government civic app and a cutting-edge SaaS product. Think: "What if Swiggy's design team built India's civic reporting platform." Every screen should feel alive, trustworthy, and distinctly Indian yet globally polished.

---

## 🎨 Design System — Follow Exactly

### Color Palette
```css
--bg-primary: #0A0F1E        /* Deep navy black — main background */
--bg-secondary: #0F1629      /* Slightly lighter — card backgrounds */
--bg-tertiary: #141D35       /* Elevated surfaces, modals */
--bg-glass: rgba(255,255,255,0.04)  /* Glassmorphism surfaces */

--accent-blue: #2563EB       /* Primary action — report button, CTAs */
--accent-blue-glow: #3B82F6  /* Hover states, glows */
--accent-orange: #F97316     /* Secondary accent — warnings, badges */
--accent-green: #10B981      /* Success, verified, resolved */
--accent-red: #EF4444        /* Critical, disputed, danger */
--accent-amber: #F59E0B      /* Medium severity, pending */
--accent-purple: #8B5CF6     /* Gamification, badges, special */

--gradient-hero: linear-gradient(135deg, #1E3A8A 0%, #1E1B4B 50%, #0A0F1E 100%)
--gradient-card: linear-gradient(145deg, #0F1629, #141D35)
--gradient-blue: linear-gradient(135deg, #1D4ED8, #7C3AED)
--gradient-orange: linear-gradient(135deg, #EA580C, #DC2626)
--gradient-success: linear-gradient(135deg, #059669, #0891B2)

--text-primary: #F1F5F9      /* Main readable text */
--text-secondary: #94A3B8    /* Subtitles, metadata */
--text-muted: #475569        /* Placeholder, disabled */

--border-subtle: rgba(255,255,255,0.06)
--border-active: rgba(37,99,235,0.5)

--shadow-card: 0 4px 24px rgba(0,0,0,0.4)
--shadow-glow-blue: 0 0 20px rgba(37,99,235,0.3)
--shadow-glow-red: 0 0 20px rgba(239,68,68,0.3)
--shadow-glow-green: 0 0 20px rgba(16,185,129,0.3)
```

### Typography
```css
/* Import in index.html */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');

--font-display: 'Space Grotesk', sans-serif;   /* Headlines, app name, big numbers */
--font-body: 'Inter', sans-serif;              /* All body text, UI elements */

/* Scale */
--text-xs: 0.75rem      /* 12px — labels, badges */
--text-sm: 0.875rem     /* 14px — metadata, subtitles */
--text-base: 1rem       /* 16px — body */
--text-lg: 1.125rem     /* 18px — card titles */
--text-xl: 1.25rem      /* 20px — section headers */
--text-2xl: 1.5rem      /* 24px — page titles */
--text-3xl: 2rem        /* 32px — hero numbers */
--text-4xl: 2.5rem      /* 40px — hero display */
```

### Border Radius
```css
--radius-sm: 8px
--radius-md: 12px
--radius-lg: 16px
--radius-xl: 20px
--radius-2xl: 24px
--radius-full: 9999px
```

---

## ✨ Signature Design Elements (These make NagarMitra unique)

### 1. Glassmorphism Cards
Every issue card uses glassmorphism:
```css
background: rgba(255, 255, 255, 0.04);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.08);
border-radius: 16px;
box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
```

### 2. Severity Glow System
Each issue card has a LEFT BORDER + ambient glow matching severity:
- Critical: `border-left: 3px solid #EF4444` + `box-shadow: -4px 0 20px rgba(239,68,68,0.4)`
- High: `border-left: 3px solid #F97316` + orange glow
- Medium: `border-left: 3px solid #F59E0B` + amber glow
- Low: `border-left: 3px solid #10B981` + green glow

### 3. Animated Stats Counter
The stats bar numbers (3 Reported, 0 In Progress, 1 Resolved) should count up from 0 on page load using a JS counter animation. Duration: 1.5s with easeOut.

### 4. Floating Action Button (FAB)
The + report button (bottom right) should:
- Have a pulsing ring animation (ping effect) in blue
- On hover: expand slightly with glow + rotate the + icon 45 degrees
- Background: gradient-blue

### 5. Issue Card Hover Effect
On hover, cards should:
- translateY(-4px) — float up
- Border brightness increase
- Show a subtle shimmer effect on the image

### 6. Status Badge Pills
Animated badges with a pulsing dot:
- Open: blue dot pulsing
- In Progress: amber dot pulsing  
- Resolved: green dot static
- Disputed: red dot pulsing fast
- Critical: red badge with shake animation on load

---

## 📱 Screen-by-Screen Redesign Instructions

---

### SCREEN 1: Home Feed

#### Header/Navbar
```
┌─────────────────────────────────────────────────┐
│  [📍 icon]  NagarMitra          [≡]  [⊞ map]   │
│  3 issues nearby • Shirpur, Maharashtra          │
└─────────────────────────────────────────────────┘
```
- Background: `bg-secondary` with bottom border `border-subtle`
- NagarMitra text: `font-display`, `text-2xl`, `font-bold`, `text-primary`
- Location subtitle: `text-secondary`, `text-sm`
- Location pin icon: animated bounce on load (once)
- List/Map toggle: pill-shaped toggle button with active state glow

#### Stats Bar
```
┌──────────────┬──────────────┬──────────────┐
│      3       │      0       │      1       │
│   Reported   │  In Progress │   Resolved   │
└──────────────┴──────────────┴──────────────┘
```
- Background: `gradient-hero`
- Numbers: `font-display`, `text-3xl`, `font-bold`, animated count-up
- Labels: `text-secondary`, `text-xs`, uppercase, letter-spacing
- Dividers: `border-subtle` vertical lines
- Subtle particle/dot pattern overlay on this section (CSS background pattern)

#### Filter Bar
- Pill-shaped filter buttons
- Active state: `accent-blue` background with glow
- Inactive: `bg-glass` with `border-subtle`
- Smooth transition on active change
- "All Types" dropdown: dark styled, matches theme

#### Issue Cards
```
┌─────────────────────────────────────────────────┐
│  [Photo — 200px height, rounded top corners]    │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│  [Critical 🔴] [Disputed ❌]                    │
│                                                   │
│  Severe waterlogged potholes on damaged road     │
│                                                   │
│  📍 Lakhandur Pauni main road...    · 73m away   │
│                                                   │
│  [👍 1 Support]              [Pothole 🕳️]       │
└─────────────────────────────────────────────────┘
```
- Card: glassmorphism + severity left-border glow
- Photo: `object-cover`, smooth loading with skeleton shimmer
- Title: `font-display`, `text-lg`, `font-semibold`, `text-primary`
- Location: `text-secondary`, `text-sm`, with location pin icon
- Distance badge: `text-accent-blue`, `text-sm`
- Support button: pill shape, `bg-glass`, hover fills with blue
- Issue type: right-aligned, `text-muted`, `text-sm`, with emoji icon
- Hover: float up + border glow effect

---

### SCREEN 2: Report Issue

#### Page Header
- Back arrow + "Report Issue" centered title
- Subtitle: "Help improve your community"

#### Photo Upload Section
```
┌─────────────────────────────────────────────────┐
│                                                   │
│         [📷 Camera Icon — animated pulse]        │
│                                                   │
│      Tap to capture or upload photo              │
│      Supports JPG, PNG — Max 10MB                │
│                                                   │
└─────────────────────────────────────────────────┘
```
- Dashed border with `accent-blue` color (animated dash-offset on hover)
- On photo upload: smooth fade-in preview with remove button (X)
- Camera icon: subtle pulse animation

#### AI Analysis Result Card (after photo upload)
This is the WOW moment — when AI analyzes the photo:
```
┌─────────────────────────────────────────────────┐
│  🤖 AI Analysis Complete                        │
│  ─────────────────────────────────────────────  │
│  Issue Type:    [Pothole 🕳️]                   │
│  Severity:      [████████░░] 8/10 — Critical   │
│  Department:    PWD (Public Works Dept)          │
│  Confidence:    94%                              │
└─────────────────────────────────────────────────┘
```
- Slide-in animation from bottom when analysis completes
- Severity bar: animated fill from left (CSS animation)
- Confidence: circular progress indicator
- Border: `accent-blue` glow
- Background: dark card with `gradient-blue` left accent stripe

#### Form Fields
- Dark themed inputs: `bg-tertiary`, `border-subtle`, focus border `accent-blue`
- Input glow on focus: `shadow-glow-blue`
- Description textarea: same dark style, character count bottom right
- All labels: `text-secondary`, `text-sm`, uppercase + letter-spacing

#### Location Section
- Auto-detect GPS button with location pin icon
- Address display in dark pill badge
- Mini map preview (if Maps API available)

#### Submit Button
- Full width, `gradient-blue` background
- Hover: glow effect + slight scale-up
- Loading state: spinner + "Analyzing with AI..."
- Text: "Submit Report" — `font-display`, `font-semibold`

---

### SCREEN 3: Issue Detail

#### Hero Image Section
- Full-width image (300px height)
- Gradient overlay at bottom (dark fade)
- Severity badge overlaid on image (bottom left)
- Status badge overlaid (bottom right)

#### Issue Info Card
- Glassmorphism card
- Title: `font-display`, `text-2xl`, `font-bold`
- AI confidence chip: "🤖 94% confidence" — subtle blue pill
- Department badge: colored by department type

#### Status Timeline
```
● Reported          Jun 22, 2026 10:30 AM
│
● AI Analyzed       Severity: Critical | Dept: PWD
│
● Escalated         No action for 48 hours — auto-escalated
│
○ Resolution        Pending...
```
- Vertical line connecting dots
- Completed steps: filled colored circle
- Pending steps: empty circle with dashed line
- Each step slides in with stagger animation on page load

#### Community Section
- Upvote button: large, prominent, animated on click (heart-like bounce)
- Supporter count with avatar stack (show first 3 supporters as initials)

#### Dispute / Verify Section (when resolved)
- Two big buttons side by side:
  - "✅ Yes, it's fixed" — green gradient
  - "❌ No, still broken" — red gradient
- Both with glow effects matching color

---

### SCREEN 4: Dashboard

#### Hero Stats Row
4 animated counter cards:
```
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│    47    │ │    23    │ │   2.3d   │ │   89%    │
│  Total   │ │ Resolved │ │ Avg Time │ │ Accuracy │
│ Issues   │ │          │ │          │ │    AI    │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
```
- Each card: glassmorphism with matching accent color
- Numbers: count-up animation
- Small trend indicator (↑ +12% this week)

#### Charts Section
- Issue Types donut chart: dark themed, colored segments with glow
- Resolution trend line chart: gradient fill below line
- Charts use Recharts — override with dark theme colors

#### Department Leaderboard
Ranked list with:
- Rank number (large, `font-display`, `text-muted`)
- Department name
- Issues resolved count
- Avg response time
- Color bar showing relative performance

#### AI Insights Card
```
┌─────────────────────────────────────────────────┐
│  🧠 AI Insights                    Refreshed 2h │
│  ─────────────────────────────────────────────  │
│  💡 Potholes spike after rainfall in Zone 3...  │
│  💡 Ward 7 has highest unresolved rate (34%)... │
│  💡 PWD response time improved 23% this month  │
└─────────────────────────────────────────────────┘
```
- Gradient border (animated gradient border-image)
- Each insight: slide-in with stagger delay

---

### SCREEN 5: Profile

#### Profile Hero
- Large circular avatar with gradient ring border
- Name: `font-display`, `text-2xl`
- Citizen Score: big number with `accent-purple` color + star icon
- "Community Contributor" level badge

#### Badges Section
Horizontal scroll of badge cards:
- Each badge: small card with icon, name, unlock condition
- Unlocked: full color + slight glow
- Locked: greyscale + lock icon

#### Stats Grid
2x2 grid:
- Issues Reported
- Issues Resolved (contributed to)
- Disputes Won
- Upvotes Given

#### My Reports List
- Mini issue cards (compact version)
- Same glassmorphism style

---

### BOTTOM NAVIGATION BAR
```
┌──────────────────────────────────────────────┐
│   🏠 Home    📊 Dashboard    👤 Profile      │
│   ──────                                      │
└──────────────────────────────────────────────┘
```
- Background: `bg-secondary` with top border `border-subtle`
- Active tab: `accent-blue` icon + label color + subtle top indicator line
- Inactive: `text-muted`
- Tab switch: smooth color transition

---

## 🎬 Animation Guidelines

### Page Load Sequence (every page)
1. Navbar fades in (0ms)
2. Stats bar slides down (100ms delay)
3. Filter bar fades in (200ms delay)
4. Cards stagger in from bottom (300ms, 50ms between each)

### Micro-interactions
- All buttons: `transform: scale(0.97)` on press (active state)
- All cards: `transform: translateY(-4px)` on hover
- All interactive elements: `transition: all 0.2s ease`
- Badge unlock: scale + glow burst animation

### Loading States
- Skeleton screens: dark pulsing skeleton (not white)
  ```css
  background: linear-gradient(90deg, #0F1629 25%, #141D35 50%, #0F1629 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  ```
- API loading: subtle spinner in `accent-blue`

### CSS Animations to implement
```css
@keyframes pulse-ring {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.4); opacity: 0; }
}

@keyframes float-up {
  0% { transform: translateY(20px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

@keyframes count-up {
  /* handled via JS requestAnimationFrame */
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes severity-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes gradient-border {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

---

## 🛠️ Implementation Instructions for Antigravity

1. **Create a global CSS file** `frontend/src/styles/design-system.css` with all CSS variables above. Import it in `main.jsx`.

2. **Update `index.html`** to add Google Fonts import link.

3. **Update `tailwind.config.js`** to extend theme with custom colors matching the design system:
```js
extend: {
  colors: {
    'bg-primary': '#0A0F1E',
    'bg-secondary': '#0F1629',
    'bg-tertiary': '#141D35',
    'accent-blue': '#2563EB',
    'accent-orange': '#F97316',
    'accent-green': '#10B981',
    'accent-red': '#EF4444',
    'accent-purple': '#8B5CF6',
    'accent-amber': '#F59E0B',
  },
  fontFamily: {
    display: ['Space Grotesk', 'sans-serif'],
    body: ['Inter', 'sans-serif'],
  },
  animation: {
    'pulse-ring': 'pulse-ring 1.5s ease-out infinite',
    'float-up': 'float-up 0.5s ease-out forwards',
    'shimmer': 'shimmer 1.5s infinite',
  }
}
```

4. **Redesign screens in this order:**
   - First: Design system setup (CSS vars + Tailwind config + fonts)
   - Second: Home Feed (most visible, sets the tone)
   - Third: Report Issue screen
   - Fourth: Issue Detail
   - Fifth: Dashboard
   - Sixth: Profile

5. **Do NOT change any backend logic, API calls, or state management.** Only change visual/styling code. Keep all existing functionality intact.

6. **Use Framer Motion** for page transitions and stagger animations:
```bash
npm install framer-motion
```

7. **For charts** (Dashboard), use Recharts with custom dark theme — do not use default colors.

---

## ✅ Quality Checklist Before Completing Each Screen

- [ ] All text is readable (contrast ratio > 4.5:1 on dark background)
- [ ] All interactive elements have hover + active states
- [ ] Loading states implemented (skeleton or spinner)
- [ ] Mobile responsive (test at 375px width)
- [ ] Animations don't block interactions
- [ ] No hardcoded white or light backgrounds
- [ ] Glassmorphism cards visible (not blending into background)
- [ ] Severity glow system working on issue cards

---

*UI Redesign Prompt v1.0 — NagarMitra | Vibe2Ship Hackathon 2026*
