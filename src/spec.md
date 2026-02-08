# Specification

## Summary
**Goal:** Ensure the Notifications dropdown panel surface uses correct background colors in light and dark themes without affecting other dropdowns.

**Planned changes:**
- Update the Notifications dropdown panel surface styling so its background is #1a1a1a in dark mode and #ffffff in light mode.
- Scope the styling change to the Notifications dropdown content/panel only (not the bell trigger and not other dropdown menus).
- Remove any inline/hardcoded backgroundColor styles within the Notifications dropdown that force #1a1a1a in light mode.

**User-visible outcome:** When opening the Notifications dropdown, its panel background is white in light mode and #1a1a1a in dark mode, with all other dropdowns unchanged.
