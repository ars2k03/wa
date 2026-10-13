# Design System Specification: Vintage Newsprint & Editorial Brutalism

## 1. Aesthetic Identity & Theme
This application does **NOT** use generic modern SaaS templates (plain dark mode or generic blue/purple gradients). Instead, it strictly implements a **bespoke Vintage Newsprint / Editorial Broadsheet & Retro Brutalist aesthetic**, directly matching the design language of `/home/ars2k03/CSE/PROJECT/personal/ars/`.

---

## 2. Color Palette & CSS Variables

```css
:root {
  /* Paper & Ink */
  --background: #fbf8f1;       /* Warm vintage broadsheet newsprint cream */
  --foreground: #1a1a1a;       /* Deep printer ink black */
  --paper-cream: #fbf8f1;
  --paper-tint: #f4efe2;       /* Subtle aged paper tint for nested cards */
  --ink-primary: #1a1a1a;
  --ink-muted: #524d43;        /* Muted vintage charcoal ink */
  
  /* Vintage Editorial Accents */
  --accent-burgundy: #7a2020;  /* Traditional editorial oxblood / burgundy */
  --accent-emerald: #2e6930;   /* Vintage official stamp green (WhatsApp active state) */
  --accent-amber: #b45309;     /* Pending / scanning alert */
}
```

---

## 3. Typography Rules

* **Headlines & Editorial Titles:**
  - Font: `Georgia`, `Baskerville`, `"Times New Roman"`, `Garamond`, serif
  - Style: Bold/Black weights, high contrast, elegant letter tracking.
* **Body Copy:**
  - Font: Serif for narrative copy (`Georgia`, `Times New Roman`).
* **API Keys, Codes, Timestamps & Technical Data:**
  - Font: Monospace (`ui-monospace`, `SFMono-Regular`, `Menlo`, `Monaco`, `Consolas`, monospace).
  - High clarity, tabular numbers.

---

## 4. Component Design Patterns

### 4.1. Retro Brutalist Buttons & Interactive Elements
Every primary/secondary action button follows physical print-press tactile feedback:
* **Border:** Solid 2px ink border (`border-2 border-[#1a1a1a]`).
* **Offset Drop Shadow:** Hard 3px solid shadow (`shadow-[3px_3px_0px_#1a1a1a]`).
* **Tactile Click State:** On press/active, button moves into the shadow:
  ```css
  active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#1a1a1a]
  ```
* **Hover:** Subtle tint shift with sharp contrast.

### 4.2. Editorial Cards & Column Dividers
* **Container:** Background `#fbf8f1` or `#f4efe2` with crisp 2px border `#1a1a1a`.
* **Rules (Lines):** Thin 1px or 2px ink divider rules between sections (resembling newspaper column guides).
* **Header Bar:** Styled like an editorial newspaper broadsheet header with date, edition number, and live status ticker.

### 4.3. Vintage Stamps & Badges
* **Stamps (e.g. "SCAN TO LINK", "VERIFIED"):**
  - Rotated 2–3 degrees (`-rotate-2` or `rotate-3`).
  - Solid or dashed 2px borders with all-caps monospace/serif typography.
* **Status Badges:** Pill or rectangular ink-bordered tags with solid background fills.

---

## 5. Screen-by-Screen Layout Directives

1. **Top Broadside Header:**
   - Classic newspaper masthead format: Logo/Name in bold blackletter/serif, current date, edition badge, live connection status ticker.
2. **Device Connection Card:**
   - Framed like a high-contrast newspaper photo block.
   - Live Base64 QR code centered with an editorial "SCAN TO PAIR" stamp.
   - Status badge: `CONNECTED: +88017...` (Forest Green `#2e6930`) or `SCAN QR CODE` (Amber).
3. **API Key Section:**
   - Monospace key container displaying `_ars_2k03_...`.
   - Distinctive "COPY KEY" retro brutalist button.
   - Clean tabular display of all active keys.
4. **Message Dispatch Playground:**
   - Form styled like classic classified advertisement submission forms.
   - Clean boxed inputs with ink borders.
   - Prominent "DISPATCH OTP" action button.
5. **Message Ledger:**
   - Clean ruled ledger table with thin horizontal ink lines and monospace timestamps.
