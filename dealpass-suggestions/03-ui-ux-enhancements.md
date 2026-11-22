# 03. UI/UX Enhancements

## 1. Accessibility (a11y)
- **Audit:** Run Lighthouse or axe-core.
- **Fixes:**
    - Ensure all images have `alt` text.
    - Ensure form inputs have associated labels.
    - Check color contrast ratios (Shadcn usually good, but check custom themes).
    - meaningful `aria-labels` for icon-only buttons.

## 2. Loading States & Skeletons
- **Current:** May show spinners or blank screens.
- **Improvement:**
    - Use `Skeleton` components (already in `components/ui/skeleton.tsx`) consistently.
    - Show a "skeleton" layout of the offer card while fetching data.
    - Prevents layout shift (CLS) and improves perceived performance.

## 3. Error Handling (Error Boundaries)
- **Current:** If a component crashes, the whole app might go white.
- **Improvement:**
    - Wrap main routes or complex components in an `ErrorBoundary`.
    - Show a friendly "Something went wrong" UI with a "Retry" button.
    - Log the error to a service (Sentry) automatically.

## 4. PWA Polish
- **Current:** Service worker exists.
- **Improvement:**
    - **Install Prompt:** Custom "Install App" UI instead of the browser default.
    - **Offline Mode:** specific UI for "You are offline". Cache the "My Coupons" page aggressively so it works without net.
    - **Splash Screen:** Ensure correct icons and splash screens for iOS/Android in `manifest.json`.

## 5. Animations
- **Improvement:**
    - Use `framer-motion` for smooth transitions between pages.
    - Micro-interactions: Heart icon "pop" when liking a deal.
    - List items "stagger" in when loading.
