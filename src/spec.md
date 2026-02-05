# Specification

## Summary
**Goal:** Fix the failed “full PWA” build for mytube so it completes successfully and delivers an installable, offline-capable PWA experience.

**Planned changes:**
- Retry and repair the build process to eliminate the “Application creation unsuccessful” failure.
- Ensure PWA “full PWA” behavior by caching the app shell/pages, thumbnails, and video metadata for offline use (excluding full video files).
- Validate the web app manifest and service worker registration, and confirm installability on mobile (Add to Home Screen).
- Verify the manifest references the existing generated icons under `frontend/public/assets/generated/` (including maskable icons) and that they display correctly when installed.

**User-visible outcome:** The mytube web app builds successfully, runs without mobile runtime errors, can be installed to a phone home screen, and continues to load previously visited pages plus cached thumbnails/metadata while offline (with video playback gracefully indicating unavailable content when video bytes weren’t cached).
