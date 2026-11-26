import { Router, Request, Response } from 'express';
import { randomBytes } from 'crypto';
import QRCode from 'qrcode';
import prisma from '../prisma';
import { config } from '../config';
import { hashPassword } from '../utils/password';
import { buildMagicLink } from '../utils/magicLink';
import { sendEmail } from '../utils/mailer';
import { moderateOfferContent, moderateBusinessProfile } from '../utils/aiModerator';
import {
  renderDealPage,
  renderBusinessPage,
  renderCityPage,
  renderPostPage,
  renderMessagePage,
  renderNotFoundPage,
} from '../public/render';

const router = Router();

const siteUrl = config.siteUrl.replace(/\/+$/, '');

// Countries offered in the posting form. Kept in sync with the frontend region list.
const POST_COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'IE', name: 'Ireland' },
  { code: 'SG', name: 'Singapore' },
  { code: 'IN', name: 'India' },
  { code: 'PH', name: 'Philippines' },
  { code: 'OTHER', name: 'Other' },
];

const UUID_RE = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;

const extractUuid = (value: string): string | null => {
  const match = value.match(UUID_RE);
  return match ? match[0] : null;
};

/** Whether the passed page may be indexed. Off until PUBLIC_PAGES_INDEXING=true. */
const pageNoindex = (forceNoindex = false): boolean => forceNoindex || !config.publicPagesIndexing;

const sendNotFound = (res: Response) => res.status(404).type('html').send(renderNotFoundPage());

const parseJson = (value: unknown): any => {
  if (typeof value !== 'string') return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const formatDate = (date: Date): string =>
  new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);

/** Strip control characters and bound the length of a submitted form value. */
const clean = (value: unknown, max = 200): string => {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, max);
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const baseSlug = (title: string): string =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 60) || 'deal';

/** `<slug>-<id8>` - matches the format the SPA and existing offers use. */
const slugFor = (title: string, id: string): string => `${baseSlug(title)}-${id.slice(0, 8)}`;

/** Build the human-readable price/offer-value text stored on the offer, if any. */
const priceFromOffer = (offer: any): string | null => {
  const details = parseJson(offer.discountDetails);
  if (details && typeof details.offerValue === 'string' && details.offerValue.trim()) {
    return details.offerValue.trim();
  }
  return null;
};

const termsFromOffer = (offer: any): string[] => {
  const details = parseJson(offer.eligibilityDetails);
  if (Array.isArray(details)) return details.filter((t) => typeof t === 'string');
  if (details && Array.isArray(details.items)) return details.items.filter((t: unknown) => typeof t === 'string');
  if (details && Array.isArray(details.terms)) return details.terms.filter((t: unknown) => typeof t === 'string');
  if (typeof details === 'string' && details.trim()) return [details.trim()];
  return [];
};

const areaOf = (offer: any): string => {
  const city = offer.city || offer.business?.city || '';
  const country = offer.country || offer.business?.country || '';
  return [city, country].filter(Boolean).join(', ');
};

const dealPath = (offer: any): string => `/deal/${offer.publicUrlSlug || offer.id}`;

/** Resolve an offer by its `<slug>-<id8>` or `<id>-<slug>` form, a slug, or a bare id. */
const findOfferBySlug = async (slug: string) => {
  const direct = await prisma.offer.findFirst({
    where: { publicUrlSlug: slug },
    include: { business: true },
  });
  if (direct) return direct;

  const uuid = extractUuid(slug);
  if (uuid) {
    const byId = await prisma.offer.findUnique({ where: { id: uuid }, include: { business: true } });
    if (byId) return byId;
  }

  // Handle the `/deal/<id>-<slug>` shape: try any token that looks like an id prefix.
  for (const token of slug.split('-')) {
    if (/^[0-9a-f]{8,}$/i.test(token)) {
      const byPrefix = await prisma.offer.findFirst({
        where: { id: { startsWith: token } },
        include: { business: true },
      });
      if (byPrefix) return byPrefix;
    }
  }

  // Fall back to a slug prefix match (older links may omit the id suffix).
  return prisma.offer.findFirst({
    where: { publicUrlSlug: { startsWith: slug } },
    include: { business: true },
  });
};

/** Resolve a business by `<id>-<slug>`, a bare id, or a name-derived slug. */
const findBusinessBySlug = async (slug: string) => {
  const uuid = extractUuid(slug);
  if (uuid) {
    const byId = await prisma.business.findUnique({ where: { id: uuid } });
    if (byId) return byId;
  }
  const exact = await prisma.business.findUnique({ where: { id: slug } });
  if (exact) return exact;
  return null;
};

/** Live, approved, unexpired deals for a country/city. */
const liveDealsWhere = (country: string, city: string) => {
  const now = new Date();
  return {
    status: 'ACTIVE',
    validFrom: { lte: now },
    validTo: { gte: now },
    OR: [
      { country: { equals: country }, city: { equals: city } },
      { country: null, business: { country: { equals: country }, city: { equals: city } } },
    ],
  } as any;
};

// GET /deal/<id>-<slug> - public deal page (plain HTML, no JS bundle).
router.get('/deal/:slugId', async (req: Request, res: Response) => {
  try {
    const offer = await findOfferBySlug(req.params.slugId);
    if (!offer || offer.status !== 'ACTIVE') return sendNotFound(res);

    const expired = offer.validTo.getTime() < Date.now();
    const title = offer.title;
    const businessName = offer.business?.tradingName || 'Local business';

    const html = renderDealPage({
      title,
      businessName,
      area: areaOf(offer),
      description: offer.shortDescription || offer.longDescription || '',
      price: priceFromOffer(offer),
      terms: termsFromOffer(offer),
      expiryText: formatDate(offer.validTo),
      imageUrl: offer.imageUrl || null,
      expired,
      meta: {
        title: `${title} - ${businessName} | DealPass`,
        description: (offer.shortDescription || '').slice(0, 160),
        canonical: `${siteUrl}${dealPath(offer)}`,
        image: offer.imageUrl || null,
        noindex: pageNoindex(expired),
      },
      saveUrl: `/offers/${offer.id}`,
    });

    res.status(200).type('html').send(html);
  } catch {
    return sendNotFound(res);
  }
});

// GET /biz/<slug> - public business page.
router.get('/biz/:slug', async (req: Request, res: Response) => {
  try {
    const business = await findBusinessBySlug(req.params.slug);
    if (!business || business.status !== 'ACTIVE') return sendNotFound(res);

    const now = new Date();
    const deals = await prisma.offer.findMany({
      where: { businessId: business.id, status: 'ACTIVE', validTo: { gte: now } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const html = renderBusinessPage({
      businessName: business.tradingName,
      area: [business.city, business.country].filter(Boolean).join(', '),
      description: business.description || '',
      deals: deals.map((d) => ({ title: d.title, url: dealPath(d), imageUrl: d.imageUrl || null })),
      postUrl: `/post?name=${encodeURIComponent(business.tradingName)}&city=${encodeURIComponent(business.city)}`,
      meta: {
        title: `${business.tradingName} | DealPass`,
        description: (business.description || `Deals from ${business.tradingName}`).slice(0, 160),
        canonical: `${siteUrl}/biz/${business.id}`,
        image: business.coverImageUrl || business.logoUrl || null,
        noindex: pageNoindex(),
      },
    });

    res.status(200).type('html').send(html);
  } catch {
    return sendNotFound(res);
  }
});

// GET /deals/<country>/<city> - live deals in an area.
router.get('/deals/:country/:city', async (req: Request, res: Response) => {
  try {
    const country = String(req.params.country || '').slice(0, 60);
    const city = String(req.params.city || '').slice(0, 80);

    const deals = await prisma.offer.findMany({
      where: liveDealsWhere(country, city),
      include: { business: { select: { tradingName: true } } },
      orderBy: { createdAt: 'desc' },
      take: 60,
    });

    const postUrl = `/post?city=${encodeURIComponent(city)}&source=city-page`;

    const html = renderCityPage({
      country,
      city,
      deals: deals.map((d) => ({
        title: d.title,
        url: dealPath(d),
        imageUrl: d.imageUrl || null,
        businessName: (d as any).business?.tradingName || 'Local business',
      })),
      postUrl,
      meta: {
        title: `Deals in ${city} - DealPass`,
        description: `Live local deals in ${city}, ${country}. Updated daily.`,
        canonical: `${siteUrl}/deals/${encodeURIComponent(country)}/${encodeURIComponent(city)}`,
        image: null,
        noindex: pageNoindex(),
      },
    });

    res.status(200).type('html').send(html);
  } catch {
    return sendNotFound(res);
  }
});

// GET /post - one-minute posting flow (prefilled from directory listings).
router.get('/post', (req: Request, res: Response) => {
  const rawName = typeof req.query.name === 'string' ? req.query.name : '';
  const rawCity = typeof req.query.city === 'string' ? req.query.city : '';
  const rawSource = typeof req.query.source === 'string' ? req.query.source : '';
  const rawListing = typeof req.query.listing === 'string' ? req.query.listing : '';

  // Validate (and bound) prefilled values. Rendering also HTML-escapes them.
  const name = rawName.replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, 80);
  const city = rawCity.replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, 80);
  const source = /^[a-z0-9_-]{0,32}$/i.test(rawSource) ? rawSource : '';
  const listing = /^[a-z0-9_-]{0,64}$/i.test(rawListing) ? rawListing : '';

  const html = renderPostPage({
    name,
    city,
    source,
    listing,
    countries: POST_COUNTRIES,
    meta: {
      title: 'Post a free deal - DealPass',
      description: 'List your first local deal free in about a minute. Reviewed before it goes live.',
      canonical: `${siteUrl}/post`,
      image: null,
      noindex: pageNoindex(),
    },
  });

  res.status(200).type('html').send(html);
});

// POST /post - submit a deal for moderation (the one-minute mobile flow).
router.post('/post', async (req: Request, res: Response) => {
  const body = req.body || {};
  const email = clean(body.email, 160);
  const businessName = clean(body.businessName, 80);
  const city = clean(body.city, 80);
  const rawCountry = clean(body.country, 8).toUpperCase();
  const country = POST_COUNTRIES.some((c) => c.code === rawCountry) ? rawCountry : 'OTHER';
  const title = clean(body.title, 120);
  const whatYouGet = clean(body.whatYouGet, 600);
  const offerValue = clean(body.offerValue, 60);
  const expiry = clean(body.expiry, 10);
  const photoUrl = clean(body.photoUrl, 500);

  const renderError = (message: string) =>
    res.status(400).type('html').send(
      renderMessagePage({
        meta: {
          title: 'Post a deal - DealPass',
          description: 'Post a free local deal.',
          canonical: `${siteUrl}/post`,
          noindex: pageNoindex(),
        },
        heading: 'We could not post that',
        message,
        ctaHref: '/post',
        ctaLabel: 'Back to the form',
      })
    );

  if (!EMAIL_RE.test(email)) return renderError('Please enter a valid email address.');
  if (!businessName) return renderError('Please enter your business name.');
  if (!city) return renderError('Please enter your suburb or city.');
  if (!title) return renderError('Please enter a deal title.');
  if (!whatYouGet) return renderError('Please describe what the customer gets.');

  const validTo = new Date(`${expiry}T23:59:59.000Z`);
  if (!expiry || Number.isNaN(validTo.getTime())) return renderError('Please choose a valid expiry date.');

  const imageUrl = /^https?:\/\/\S+$/i.test(photoUrl) ? photoUrl : null;

  try {
    // Family-safe / AdSense-safe moderation. Prohibited categories are rejected
    // outright; everything else is queued for a human to approve.
    const businessModeration = await moderateBusinessProfile(businessName, whatYouGet, undefined);
    if (businessModeration.status === 'REJECTED') {
      return renderError(businessModeration.reasoning.join(' '));
    }
    const moderation = await moderateOfferContent(title, whatYouGet, 0);
    if (moderation.status === 'REJECTED') {
      return renderError(moderation.reasoning.join(' '));
    }

    const finalTitle = moderation.suggestedTitle || title;

    // Accounts are passwordless: the owner signs in through the emailed magic
    // link, so we create the user with a random password they never see.
    const passwordHash = await hashPassword(randomBytes(24).toString('hex'));

    const { userId, offerId } = await prisma.$transaction(async (tx) => {
      let user = await tx.user.findUnique({ where: { email } });
      if (!user) {
        user = await tx.user.create({
          data: {
            email,
            passwordHash,
            name: businessName,
            role: 'BUSINESS_OWNER',
            referralCode: `BIZ${randomBytes(4).toString('hex').toUpperCase()}`,
            city,
            country,
            emailVerified: false,
          },
        });
      }

      let business = await tx.business.findFirst({ where: { ownerUserId: user.id } });
      if (!business) {
        business = await tx.business.create({
          data: {
            ownerUserId: user.id,
            legalName: businessName,
            tradingName: businessName,
            city,
            country,
            currency: 'USD',
            timezone: 'UTC',
            email,
            categoryTags: '',
            status: 'PENDING_APPROVAL',
          } as any,
        });
      }

      const offer = await tx.offer.create({
        data: {
          businessId: business.id,
          title: finalTitle,
          shortDescription: whatYouGet,
          imageUrl: imageUrl ?? undefined,
          country,
          city,
          currency: 'USD',
          timezone: 'UTC',
          validFrom: new Date(),
          validTo,
          creditCost: 1,
          primaryPromotionTypeCode: 'DEAL',
          // Every posted deal lands in the moderation queue for a human to approve.
          status: 'PENDING_MODERATION',
          discountDetails: offerValue ? JSON.stringify({ offerValue }) : undefined,
          aiModerationResult: JSON.stringify({ score: moderation.score, reasoning: moderation.reasoning }),
        } as any,
      });

      await tx.offer.update({
        where: { id: offer.id },
        data: { publicUrlSlug: slugFor(finalTitle, offer.id) } as any,
      });

      return { userId: user.id, offerId: offer.id };
    });

    const link = buildMagicLink(userId);
    await sendEmail({
      to: email,
      subject: 'Your DealPass deal is in review',
      text: `Thanks for posting "${finalTitle}" on DealPass. It is now in review.\n\nSign in to manage your listing: ${link}\n`,
    });

    res.status(200).type('html').send(
      renderMessagePage({
        meta: {
          title: 'Deal submitted - DealPass',
          description: 'Your deal is in review.',
          canonical: `${siteUrl}/post`,
          noindex: pageNoindex(),
        },
        heading: 'Thanks - your deal is in review',
        message: `We have queued "${finalTitle}" (ref ${offerId.slice(0, 8)}) for review. We emailed a sign-in link to ${email} so you can manage it.`,
        ctaHref: '/',
        ctaLabel: 'Browse deals',
      })
    );
  } catch (error) {
    console.error('Public post error:', error);
    return renderError('Something went wrong submitting your deal. Please try again.');
  }
});

// GET /qr/<slug>.png - server-rendered QR code for the counter.
router.get('/qr/:slug', async (req: Request, res: Response) => {
  try {
    const slug = String(req.params.slug).replace(/\.png$/i, '');
    const offer = await findOfferBySlug(slug);
    // Only approved deals get a QR code; pending/rejected deals 404.
    if (!offer || offer.status !== 'ACTIVE') return sendNotFound(res);

    const target = `${siteUrl}${dealPath(offer)}`;
    const buffer = await QRCode.toBuffer(target, { errorCorrectionLevel: 'H', width: 512 });

    res.set('Cache-Control', 'public, max-age=86400');
    res.status(200).type('image/png').send(buffer);
  } catch {
    return sendNotFound(res);
  }
});

export default router;
