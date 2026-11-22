# 02. Core Functionality Improvements

## 1. True AI Moderation
**Current:**
- `backend/src/utils/aiModerator.ts` uses simple keyword matching.
- **Issue:** Easily bypassed, high false positives/negatives.

**Improvement:**
- **Integrate OpenAI/Anthropic API:**
    - Send offer title/description to an LLM.
    - Ask for a JSON response with: `{ isSafe: boolean, reason: string, suggestions: string[] }`.
    - This allows detecting *intent* and *context*, not just bad words.
- **Cost Management:** Cache results to avoid re-checking the same text.

## 2. Payment Gateway Integration
**Current:**
- No payment SDKs found.
- **Issue:** Cannot process real payments for "Premium" offers or credits.

**Improvement:**
- **Stripe Integration:**
    - Install `stripe` (backend) and `@stripe/stripe-js` (frontend).
    - Implement "Checkout Sessions" for buying credits.
    - Use Webhooks to listen for successful payments and update user credit balance securely.

## 3. Real-Time Notifications
**Current:**
- Likely polling or simple push.
- **Issue:** Users might miss time-sensitive deal updates or redemption confirmations.

**Improvement:**
- **Socket.io / WebSocket:**
    - Implement a WebSocket server alongside Express.
    - Push updates for: "Offer Unlocked", "Redemption Success", "New Deal Nearby".
- **Fallback:** Keep Push Notifications (Service Workers) for offline/background updates.

## 4. QR Code Security
**Current:**
- Generates a static QR code string.
- **Issue:** If the string is predictable or static, users could potentially forge redemptions.

**Improvement:**
- **Dynamic QR Codes:** Include a timestamp and a signature (HMAC) in the QR data.
- **Rotating Codes:** For high-value items, regenerate the QR code every 30 seconds (like TOTP).
- **Validation:** Server must verify the signature and ensure the timestamp is recent.
