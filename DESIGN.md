# Design System: The Editorial Athlete



## 1. Overview & Creative North Star

The Creative North Star for this system is **"The Digital Curator."**



We are moving away from the cluttered, data-heavy aesthetic of traditional sports apps. Instead, we are leaning into a high-end editorial experience that feels more like a luxury travel magazine than a spreadsheet. To achieve this, we prioritize **intentional asymmetry** and **tonal depth**. By utilizing generous white space (the "Airbnb" influence) and a strict adherence to layering over lining, we create a UI that feels "breathtakingly light" yet remains structurally rigorous.



The goal is to make a bachelor party scorekeeping event feel like a prestigious invitational. Every tap should feel deliberate, and every screen should feel like a custom-composed layout rather than a generic template.



---



## 2. Colors: Tonal Atmosphere

The palette is rooted in a soft, high-end neutral (`#F9F9F9`) to reduce eye strain and provide a sophisticated "gallery" backdrop for the bold action colors.



### The Palette

* **Primary (Deep Coral - #B52330 / #FF5A5F):** Used for critical energy—winning moments, primary actions, and "Live" status indicators.

* **Secondary (Deep Navy - #3E5E95):** Used for structural authority—navigation headers, score totals, and serious UI elements.

* **Surface Neutrals:** A range of whites and soft greys (`surface-container` tiers) used to build depth.



### The "No-Line" Rule

**Explicit Instruction:** Prohibit the use of 1px solid borders for sectioning content. Boundaries must be defined solely through:

1. **Background Color Shifts:** A `surface-container-low` section sitting on a `surface` background.

2. **Negative Space:** Using the spacing scale to create mental groupings.

3. **Tonal Transitions:** Subtle shifts between nested containers.



### Surface Hierarchy & Nesting

Treat the UI as a series of physical layers.

* **Base:** `surface` (#f9f9f9).

* **Cards:** `surface-container-lowest` (#ffffff) for maximum "pop" and perceived elevation.

* **Background Grouping:** `surface-container` (#eeeeee) to wrap multiple related items.



---



## 3. Typography: The Editorial Voice

We utilize a dual-typeface system to balance the "Invitational" prestige with modern utility.



* **Display & Headlines (Manrope):** This is our "Editorial" voice. Use `display-lg` and `headline-md` for player names, tournament titles, and big scores. The wide apertures of Manrope feel expensive and professional.

* **Body & Labels (Inter):** Our "Utility" voice. `body-md` and `label-sm` are used for statistics, timestamps, and metadata. Inter provides the high-legibility required for quick glances during a game.



**Hierarchy Note:** Use `on-surface-variant` (#5a403f) for labels to create a soft contrast against the `on-surface` (#1a1c1c) headlines. This ensures the eye hits the most important data first.



---



## 4. Elevation & Depth: Tonal Layering

We do not use structural lines to separate data; we use physics.



* **The Layering Principle:** Depth is achieved by stacking. Place a `surface-container-lowest` (pure white) card on top of a `surface-container-low` background. The contrast is enough to define the shape without a border.

* **Ambient Shadows:** For floating elements (like the centered action button), use a "Signature Shadow":

* **Blur:** 12px

* **Opacity:** 6%

* **Color:** Derived from the `primary` token (#B52330) to create a warm, organic glow rather than a muddy grey shadow.

* **Glassmorphism:** For the fixed bottom navigation bar, use a `surface` color at 80% opacity with a `backdrop-filter: blur(20px)`. This allows the vibrant grass/court colors of the app content to bleed through, making the UI feel integrated into the event.



---



## 5. Components: Bespoke Elements



### Buttons

* **Primary (Elevated Action):** Using `primary_container` (#FF5A5F), high-rounded (`full`), with a subtle shadow.

* **Secondary:** Navy (`secondary`), used for "View Stats" or "History."

* **Ghost:** No background, only `primary` text. Used for "Cancel" or "Back."



### Cards & Lists

* **The Card Rule:** Rounded at `xl` (1.5rem). No dividers.

* **Grouping:** Use `surface-container-lowest` for the card body. If a list exists inside the card, separate items with vertical padding (16px) rather than lines.

* **The "Highlight" Card:** To denote the current leader, use a subtle gradient transition from `surface-container-lowest` to `primary_fixed` (#ffdad8) at 10% opacity.



### Chips & Badges

* **Status Chips:** Use `tertiary_container` for "In Progress" and `secondary_container` for "Upcoming."

* **Shape:** Always `full` roundedness to maintain the "Soft Minimal" feel.



### Input Fields

* **Style:** Minimalist. No bottom line. Use a `surface-container-high` background with `md` (0.75rem) corners.

* **Focus:** Transition the background to `surface-container-lowest` and add a `ghost-border` using `outline-variant` at 20% opacity.



---



## 6. Do's and Don'ts



### Do

* **DO** use asymmetric padding. For example, a larger top-padding on a screen title to give it an editorial, "breathable" feel.

* **DO** use the `primary` (Deep Coral) color sparingly. It should signify a "Big Moment" or a "Call to Action," not a background.

* **DO** ensure all touch targets for scorekeeping are at least 48dp, even if the visual "chip" is smaller.



### Don't

* **DON'T** use 100% black (#000000). Always use `on-surface` (#1a1c1c) for text to keep the "premium soft" look.

* **DON'T** use standard Material Design 1px dividers. If you feel you need a line, use a 4px gap of `surface-container` instead.

* **DON'T** crowd the screen. If a bachelor party group has 20 players, use a horizontal scroll (Carousel) for the leaderboard to maintain white space, rather than a cramped vertical list.



### Accessibility Note

While we use soft neutrals, ensure that all text against `surface` backgrounds maintains at least a 4.5:1 contrast ratio. Use the `on-primary` and `on-secondary` tokens (Pure White) for text sitting on bold color backgrounds.
