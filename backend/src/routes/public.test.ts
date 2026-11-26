// Ensure the isolated test database / config are set before the app module
// (and its Prisma client) is imported.
import '../test/setup';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app';
import prisma from '../prisma';

// Acceptance tests for the server-rendered public pages and the posting flow.
// They exercise the real Express app through supertest against an isolated
// SQLite database created by the vitest global setup (see src/test/globalSetup.ts).

const NOINDEX = 'name="robots" content="noindex"';
const DAY = 24 * 60 * 60 * 1000;

// Mirrors the formatter used by the renderer so the assertion is stable
// regardless of the timezone the tests happen to run in.
const formatDate = (date: Date): string =>
  new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);

const suffix = Math.random().toString(36).slice(2, 10);

let ownerId = '';
let businessId = '';
const approvedSlug = `two-for-one-coffee-${suffix}`;
const expiredSlug = `expired-coffee-${suffix}`;
const pendingSlug = `pending-coffee-${suffix}`;
const approvedTitle = 'Two for one coffee';
const expiredTitle = 'Old winter warmer';
const approvedValidTo = new Date(Date.now() + 30 * DAY);

const offerBase = {
  country: 'AU',
  city: 'Bendigo',
  currency: 'AUD',
  timezone: 'Australia/Melbourne',
  creditCost: 1,
  primaryPromotionTypeCode: 'DEAL',
};

beforeAll(async () => {
  const owner = await prisma.user.create({
    data: {
      email: `owner-${suffix}@dealpass.test`,
      passwordHash: 'not-a-real-hash',
      name: "Joe's Cafe",
      role: 'BUSINESS_OWNER',
      referralCode: `OWN${suffix.toUpperCase()}`,
    },
  });
  ownerId = owner.id;

  const business = await prisma.business.create({
    data: {
      ownerUserId: owner.id,
      legalName: "Joe's Cafe Pty Ltd",
      tradingName: "Joe's Cafe",
      description: 'A family cafe in the heart of Bendigo serving breakfast and lunch.',
      city: 'Bendigo',
      country: 'AU',
      currency: 'AUD',
      timezone: 'Australia/Melbourne',
      email: owner.email,
      categoryTags: '',
      status: 'ACTIVE',
    },
  });
  businessId = business.id;

  await prisma.offer.create({
    data: {
      ...offerBase,
      businessId: business.id,
      title: approvedTitle,
      shortDescription: 'Buy one coffee and get a second one free, every weekday.',
      status: 'ACTIVE',
      validFrom: new Date(Date.now() - DAY),
      validTo: approvedValidTo,
      publicUrlSlug: approvedSlug,
      discountDetails: JSON.stringify({ offerValue: '2 for 1' }),
      eligibilityDetails: JSON.stringify(['One per customer', 'Weekdays only']),
    },
  });

  // Expired but still ACTIVE (we keep expired deals, we just show them as expired).
  await prisma.offer.create({
    data: {
      ...offerBase,
      businessId: business.id,
      title: expiredTitle,
      shortDescription: 'A past deal that has now finished.',
      status: 'ACTIVE',
      validFrom: new Date(Date.now() - 60 * DAY),
      validTo: new Date(Date.now() - DAY),
      publicUrlSlug: expiredSlug,
    },
  });

  // Still in the moderation queue: must never be publicly visible.
  await prisma.offer.create({
    data: {
      ...offerBase,
      businessId: business.id,
      title: 'Pending coffee deal',
      shortDescription: 'Waiting for review and should not be public yet.',
      status: 'PENDING_MODERATION',
      validFrom: new Date(Date.now() - DAY),
      validTo: new Date(Date.now() + 30 * DAY),
      publicUrlSlug: pendingSlug,
    },
  });
});

afterAll(async () => {
  await prisma.offer.deleteMany({
    where: { publicUrlSlug: { in: [approvedSlug, expiredSlug, pendingSlug] } },
  });
  if (businessId) await prisma.business.deleteMany({ where: { id: businessId } });
  if (ownerId) await prisma.user.deleteMany({ where: { id: ownerId } });
  await prisma.$disconnect();
});

describe('GET /deal/:slugId', () => {
  it('renders an approved deal as plain HTML with title, expiry and og:title, without JS', async () => {
    const res = await request(app).get(`/deal/${approvedSlug}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/html/);
    expect(res.text).toContain(approvedTitle);
    expect(res.text).toContain(formatDate(approvedValidTo));
    expect(res.text).toContain('property="og:title"');
    expect(res.text).toContain('Save to my pass');
    // No SPA bundle until the visitor taps "Save".
    expect(res.text).not.toContain('<script');
    expect(Buffer.byteLength(res.text, 'utf8')).toBeLessThan(50 * 1024);
  });

  it('marks an expired deal as expired and noindex, and keeps it online', async () => {
    const res = await request(app).get(`/deal/${expiredSlug}`);

    expect(res.status).toBe(200);
    expect(res.text).toMatch(/expired/i);
    expect(res.text).toContain(NOINDEX);
  });

  it('does not expose deals that are still pending moderation', async () => {
    const res = await request(app).get(`/deal/${pendingSlug}`);
    expect(res.status).toBe(404);
  });
});

describe('GET /deals/:country/:city', () => {
  it('shows an honest empty state and a post link when there are no deals', async () => {
    const res = await request(app).get('/deals/US/Nowhereville');

    expect(res.status).toBe(200);
    expect(res.text).toContain('No deals here yet.');
    expect(res.text).toContain('Are you a local business? Post a free deal');
    // Zero fake items are listed.
    expect(res.text).not.toContain('class="row"');
  });

  it('lists live approved deals for the area', async () => {
    const res = await request(app).get('/deals/AU/Bendigo');

    expect(res.status).toBe(200);
    expect(res.text).toContain(approvedTitle);
    expect(res.text).toContain('class="row"');
    // Expired and pending deals never show up in the list.
    expect(res.text).not.toContain(expiredTitle);
  });
});

describe('GET /post (prefill)', () => {
  it('prefills safely, escaping the submitted values', async () => {
    const res = await request(app)
      .get('/post')
      .query({ name: "Joe's Cafe", city: 'Bendigo' });

    expect(res.status).toBe(200);
    expect(res.text).toContain('value="Joe&#39;s Cafe"');
    expect(res.text).toContain('value="Bendigo"');
  });

  it('escapes prefilled values so they cannot inject markup', async () => {
    const res = await request(app)
      .get('/post')
      .query({ name: '<script>alert(1)</script>' });

    expect(res.status).toBe(200);
    expect(res.text).toContain('&lt;script&gt;');
    expect(res.text).not.toContain('<script>alert(1)');
  });
});

describe('POST /post', () => {
  it('queues a submitted deal for moderation and emails a sign-in link', async () => {
    const res = await request(app)
      .post('/post')
      .type('form')
      .send({
        email: `poster-${suffix}@dealpass.test`,
        businessName: 'Bendigo Bakery',
        city: 'Bendigo',
        country: 'AU',
        title: 'Free pastry with any coffee',
        whatYouGet: 'Buy any coffee and choose a free pastry from the counter.',
        offerValue: 'Free pastry',
        expiry: '2030-01-31',
      });

    expect(res.status).toBe(200);
    expect(res.text).toMatch(/in review/i);

    const created = await prisma.offer.findFirst({
      where: { title: 'Free Pastry With Any Coffee' },
      orderBy: { createdAt: 'desc' },
    });
    expect(created?.status).toBe('PENDING_MODERATION');

    if (created) await prisma.offer.delete({ where: { id: created.id } });
    if (created) await prisma.business.deleteMany({ where: { id: created.businessId } });
    await prisma.user.deleteMany({ where: { email: `poster-${suffix}@dealpass.test` } });
  });
});

describe('GET /qr/:slug.png', () => {
  it('returns a PNG for an approved deal', async () => {
    const res = await request(app).get(`/qr/${approvedSlug}.png`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/image\/png/);
  });

  it('returns 404 for a deal that is still pending', async () => {
    const res = await request(app).get(`/qr/${pendingSlug}.png`);
    expect(res.status).toBe(404);
  });
});

describe('indexing is off while PUBLIC_PAGES_INDEXING=false', () => {
  it('emits noindex on every public page', async () => {
    const [deal, biz, city, post] = await Promise.all([
      request(app).get(`/deal/${approvedSlug}`),
      request(app).get(`/biz/${businessId}`),
      request(app).get('/deals/AU/Bendigo'),
      request(app).get('/post'),
    ]);

    for (const res of [deal, biz, city, post]) {
      expect(res.status).toBe(200);
      expect(res.text).toContain(NOINDEX);
    }
  });
});

describe('GET /biz/:slug', () => {
  it('renders the business page with its live deals', async () => {
    const res = await request(app).get(`/biz/${businessId}`);

    expect(res.status).toBe(200);
    // The business name is HTML-escaped in the rendered output.
    expect(res.text).toContain('Joe&#39;s Cafe');
    expect(res.text).toContain(approvedTitle);
  });
});
