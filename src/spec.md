# Specification

## Summary
**Goal:** Add a Light Mode / Dark Mode theme toggle that controls the existing `next-themes` ThemeProvider and applies across the entire UI.

**Planned changes:**
- Add a user-accessible theme toggle in the UI with English labels (e.g., “Theme”, “Light”, “Dark”).
- Wire the toggle to `next-themes` so it updates the document class (`.dark`) and applies Tailwind dark-mode styles immediately across pages/components.
- Ensure the selected theme persists across reloads via `next-themes` persistence and that both themes remain readable for core surfaces (background, card, borders, text) using existing CSS variables.

**User-visible outcome:** Users can switch between Light and Dark themes from within the app, and their selection stays applied after refreshing or revisiting the app.
