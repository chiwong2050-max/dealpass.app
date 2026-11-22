# 07. New Feature Recommendations

## 1. Social Login
- **Google / Apple Sign-In:** Reduces friction for new users.
- **Implementation:** Passport.js or Firebase Auth wrapper.

## 2. Analytics Dashboard for Businesses
- **Charts:**
    - "Views vs. Redemptions"
    - "Peak Redemption Times"
    - "Customer Demographics"
- **Tech:** Recharts (already in dependencies) + Aggregated backend endpoints.

## 3. "Deal Pass" Subscription
- **Monetization:**
    - Free users: 1 deal/day.
    - Premium ($5/mo): Unlimited deals + Early access.
- **Tech:** Stripe Subscriptions.

## 4. Location-Based Alerts
- **Geofencing:**
    - "You are near 'Sushi Place'. Use your 50% off coupon!"
- **Tech:** Geolocation API (frontend) + PostGIS (backend) for "radius" queries.

## 5. Referral System 2.0
- **Gamification:**
    - "Invite 3 friends, get 1 month Premium free."
    - Visual progress bar.
