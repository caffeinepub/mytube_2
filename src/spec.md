# Specification

## Summary
**Goal:** Add YouTube-style notifications and profile/account controls to the global header (mobile + desktop), including a usable notifications dropdown.

**Planned changes:**
- Update `frontend/src/components/Header.tsx` to render right-side header actions next to search: a notifications (bell) control and a profile/account (avatar/user) control, in a compact YouTube-like layout for both desktop and mobile.
- Ensure mobile header layout keeps actions right-aligned and does not overlap the logo, while preserving existing mobile search expand/collapse behavior.
- Implement a notifications dropdown/panel anchored to the bell icon that lists notification items for comments, likes, and followers, with message text and timestamps, plus an English empty state.
- Add a minimal, non-breaking frontend-only notifications data source (in-memory and/or localStorage) so the panel renders without backend changes and only shows user-specific notifications when signed in; signed-out state must not error and should show an English prompt or empty state.
- Keep existing header behaviors working (logo navigation, desktop search submission, mobile search behavior) and ensure any new user-facing text is in English.

**User-visible outcome:** On both desktop and mobile, users see YouTube-style bell and profile controls next to the search UI; tapping the bell opens a notifications panel showing comment/like/follower notifications (or an English empty/sign-in state), and signed-out users get a clear Sign In entry point via the existing Internet Identity flow.
