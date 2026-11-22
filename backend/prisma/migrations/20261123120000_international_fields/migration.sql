-- International fields: store country/city/currency/timezone on businesses and offers.
-- Existing rows keep working: business currency/timezone get safe defaults and the
-- new offer columns are nullable (offers inherit from their business at create time).

ALTER TABLE "Business" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'USD';
ALTER TABLE "Business" ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'UTC';

ALTER TABLE "Offer" ADD COLUMN "country" TEXT;
ALTER TABLE "Offer" ADD COLUMN "city" TEXT;
ALTER TABLE "Offer" ADD COLUMN "currency" TEXT;
ALTER TABLE "Offer" ADD COLUMN "timezone" TEXT;
