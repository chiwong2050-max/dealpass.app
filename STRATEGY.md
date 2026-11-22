# DealPass Strategy & Developer Spec

## 1. Vision
**Global Platform, Local Execution.**
- **Goal:** Build a multi-country coupon and deals platform.
- **Structure:** Centralized tech platform with decentralized "City Managers" (Agents) who recruit local businesses.

## 2. Target Markets (Launch Phase)
1.  **Australia:** Primary focus on **Melbourne** and **Geelong**.
2.  **Hong Kong**
3.  **United Kingdom**
4.  **USA**
*System must support adding new countries/cities easily.*

## 3. Value Proposition

### For Businesses ("Pay for Walk-ins")
- **Concept:** List offers to fill off-peak times. Zero upfront cost.
- **Monetization:** Free trial -> Monthly Subscription ($29/mo) -> Featured Placements.
- **Key Benefit:** Risk-free marketing. Only discount when a customer actually arrives.

### For Users ("Unlock Local Secrets")
- **Concept:** Membership app for local savings.
- **Free Users:** Browse all, limited unlocks (e.g. 2/month), see Ads.
- **Paid Members:** Unlimited unlocks, access "Premium/Member-Only" deals, No Ads.
- **Key Benefit:** Real savings ($20-$50 per use) vs free "junk" coupons.

## 4. Core Features & Spec

### User Experience
- **Accounts:** Free & Paid levels.
- **Search:**
    - By Keyword.
    - By Location (Country -> City -> Suburb).
    - **"Near Me"** (GPS-based sorting).
    - By Category (Dining, Kids, Beauty, Travel, Services).
- **Redemption:**
    - "Unlock" button marks coupon used.
    - Generates QR Code for staff verification.
    - Tracks usage limits for Free users.

### Business Dashboard
- **Profile:** Manage listing details, logo, location.
- **Offers:** Create/Edit coupons with:
    - Validity dates.
    - Time restrictions (e.g. Mon-Thu only).
    - Usage limits (e.g. 1 per person).
- **Analytics:** View impressions vs. actual redemptions.

### Admin Panel
- **Moderation:** Approve/Reject new businesses and offers.
- **Management:** Manage categories, locations, and featured listings.
- **Global Stats:** Track revenue and user growth by region.

### Monetization
1.  **User Subscriptions:** Recurring (Monthly/Yearly) via Stripe.
2.  **Business Subscriptions:** Recurring listing fees + "Featured" upgrades.
3.  **Advertising:** AdSense for free users (hidden for paid).
4.  **Affiliate Links:** CPA revenue from travel/hotel booking partners.

## 5. Technical Stack
- **Frontend:** React, TypeScript, Tailwind CSS, Shadcn UI.
- **Backend:** Node.js, Express, Prisma.
- **Database:** PostgreSQL.
- **Auth:** JWT / Custom Auth.

## 6. Best Practices
1.  **Clear Value:** Users must see the math ("Save $400/yr").
2.  **High Value Offers:** 20-50% off or 2-for-1. No "5% off".
3.  **Simplicity:** Redemption must be fast (1-click unlock).
4.  **Geo-First:** Users care most about what is *near them right now*.