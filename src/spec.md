# Specification

## Summary
**Goal:** Make the mobile bottom tab bar strip (container behind the icons) use a clearly visible, non-transparent #1a1a1a background, and ensure the change reliably applies.

**Planned changes:**
- Update the md:hidden BottomNav container/strip styling to render with background color #1a1a1a while keeping existing per-button background styling unchanged.
- Preserve existing active tab highlight behavior (active text-primary and icon fill-primary).
- Fix the styling/token usage so the BottomNav background color is not ignored (e.g., due to incompatible CSS variable formatting) and remains consistent across routes.

**User-visible outcome:** On mobile, the bottom navigation strip behind the icons is visibly darker (#1a1a1a) and consistently applied on all pages, while button and active-state styling stays the same.
