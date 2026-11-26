// Server-rendered public HTML for DealPass.
//
// These pages are intentionally dependency-free plain HTML with inlined CSS and
// NO JavaScript bundle: they must be readable by search/social crawlers and stay
// tiny (target: well under 50 KB) so they load fast on a phone. The "Save to my
// pass" button is a normal link that boots the SPA on demand.

const SITE_NAME = 'DealPass';

/** Escape a value for safe interpolation into HTML text or attribute context. */
export const escapeHtml = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

export interface PageMeta {
  title: string;
  description: string;
  /** Absolute canonical URL. */
  canonical: string;
  /** Real image URL, or null to render a text-only social card. */
  image?: string | null;
  /** When true, emit <meta name="robots" content="noindex">. */
  noindex: boolean;
}

const BASE_CSS = `
:root{color-scheme:light dark}
*{box-sizing:border-box}
body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;line-height:1.5;color:#0f172a;background:#f8fafc}
a{color:#2563eb}
.wrap{max-width:680px;margin:0 auto;padding:16px}
header.site{padding:14px 16px;border-bottom:1px solid #e2e8f0;background:#fff}
header.site a{font-weight:700;font-size:18px;text-decoration:none;color:#0f172a}
.card{background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:18px;margin:16px 0}
h1{font-size:24px;margin:0 0 6px}
h2{font-size:16px;margin:18px 0 6px}
.muted{color:#64748b;font-size:14px}
.area{color:#64748b;font-size:14px;margin:0 0 12px}
.hero-img{width:100%;border-radius:10px;display:block}
.textcard{border:2px dashed #cbd5e1;border-radius:10px;padding:22px;text-align:center;font-weight:700;color:#475569}
.price{font-size:22px;font-weight:800;color:#16a34a;margin:10px 0}
.badge{display:inline-block;font-size:12px;font-weight:700;padding:3px 9px;border-radius:999px;background:#fee2e2;color:#b91c1c}
.cta{display:inline-block;margin-top:14px;background:#2563eb;color:#fff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:10px}
.cta.alt{background:#fff;color:#2563eb;border:1px solid #2563eb}
.row{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #f1f5f9}
.row:last-child{border-bottom:0}
.row img{width:56px;height:56px;object-fit:cover;border-radius:8px}
.row .t{font-weight:600;text-decoration:none;color:#0f172a}
.empty{text-align:center;padding:32px 16px}
ul.terms{padding-left:18px;margin:6px 0}
footer.site{color:#94a3b8;font-size:12px;text-align:center;padding:24px 16px}
@media (prefers-color-scheme:dark){
body{background:#0f172a;color:#e2e8f0}
header.site,.card{background:#1e293b;border-color:#334155}
header.site a,.row .t{color:#e2e8f0}
.muted,.area{color:#94a3b8}
}
`;

const renderPage = (meta: PageMeta, body: string): string => {
  const image = meta.image
    ? `
<meta property="og:image" content="${escapeHtml(meta.image)}" />
<meta name="twitter:image" content="${escapeHtml(meta.image)}" />
<meta name="twitter:card" content="summary_large_image" />`
    : `
<meta name="twitter:card" content="summary" />`;

  const robots = meta.noindex ? '<meta name="robots" content="noindex" />' : '';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(meta.title)}</title>
<meta name="description" content="${escapeHtml(meta.description)}" />
${robots}
<link rel="canonical" href="${escapeHtml(meta.canonical)}" />
<meta property="og:site_name" content="${SITE_NAME}" />
<meta property="og:title" content="${escapeHtml(meta.title)}" />
<meta property="og:description" content="${escapeHtml(meta.description)}" />
<meta property="og:type" content="website" />
<meta property="og:url" content="${escapeHtml(meta.canonical)}" />${image}
<style>${BASE_CSS}</style>
</head>
<body>
<header class="site"><a href="/">${SITE_NAME}</a></header>
<main class="wrap">
${body}
</main>
<footer class="site">${SITE_NAME} - local deals worldwide.</footer>
</body>
</html>`;
};

export interface DealPageInput {
  title: string;
  businessName: string;
  area: string;
  description: string;
  price: string | null;
  terms: string[];
  expiryText: string;
  imageUrl: string | null;
  expired: boolean;
  meta: PageMeta;
  /** SPA route that opens the offer with the pass-saving flow. */
  saveUrl: string;
}

export const renderDealPage = (input: DealPageInput): string => {
  const hero = input.imageUrl
    ? `<img class="hero-img" src="${escapeHtml(input.imageUrl)}" alt="${escapeHtml(input.title)}" />`
    : `<div class="textcard">${escapeHtml(input.businessName)}</div>`;

  const expiredBadge = input.expired
    ? `<p><span class="badge">Expired</span></p>`
    : '';

  const terms = input.terms.length
    ? `<h2>Terms</h2><ul class="terms">${input.terms
        .map((t) => `<li>${escapeHtml(t)}</li>`)
        .join('')}</ul>`
    : '';

  const body = `
${hero}
<div class="card">
  ${expiredBadge}
  <h1>${escapeHtml(input.title)}</h1>
  <p class="area">${escapeHtml(input.businessName)} &middot; ${escapeHtml(input.area)}</p>
  ${input.price ? `<p class="price">${escapeHtml(input.price)}</p>` : ''}
  <p>${escapeHtml(input.description)}</p>
  <h2>Valid until</h2>
  <p class="muted">${escapeHtml(input.expiryText)}</p>
  ${terms}
  <a class="cta" href="${escapeHtml(input.saveUrl)}">Save to my pass</a>
</div>`;

  return renderPage(input.meta, body);
};

export interface BusinessPageInput {
  businessName: string;
  area: string;
  description: string;
  deals: Array<{ title: string; url: string; imageUrl: string | null }>;
  meta: PageMeta;
  postUrl: string;
}

export const renderBusinessPage = (input: BusinessPageInput): string => {
  const list = input.deals.length
    ? input.deals
        .map(
          (d) => `<div class="row">
    ${d.imageUrl ? `<img src="${escapeHtml(d.imageUrl)}" alt="" />` : ''}
    <a class="t" href="${escapeHtml(d.url)}">${escapeHtml(d.title)}</a>
  </div>`
        )
        .join('')
    : `<p class="muted">No live deals right now.</p>`;

  const body = `
<div class="card">
  <h1>${escapeHtml(input.businessName)}</h1>
  <p class="area">${escapeHtml(input.area)}</p>
  ${input.description ? `<p>${escapeHtml(input.description)}</p>` : ''}
</div>
<div class="card">
  <h2>Live deals</h2>
  ${list}
  <a class="cta alt" href="${escapeHtml(input.postUrl)}">Post a free deal</a>
</div>`;

  return renderPage(input.meta, body);
};

export interface CityPageInput {
  country: string;
  city: string;
  deals: Array<{ title: string; url: string; imageUrl: string | null; businessName: string }>;
  meta: PageMeta;
  postUrl: string;
}

export const renderCityPage = (input: CityPageInput): string => {
  const list = input.deals.length
    ? input.deals
        .map(
          (d) => `<div class="row">
    ${d.imageUrl ? `<img src="${escapeHtml(d.imageUrl)}" alt="" />` : ''}
    <div>
      <a class="t" href="${escapeHtml(d.url)}">${escapeHtml(d.title)}</a>
      <div class="muted">${escapeHtml(d.businessName)}</div>
    </div>
  </div>`
        )
        .join('')
    : `<div class="empty">
    <p><strong>No deals here yet.</strong></p>
    <p class="muted">Own a local business? List your first deal free.</p>
    <a class="cta" href="${escapeHtml(input.postUrl)}">Are you a local business? Post a free deal</a>
  </div>`;

  const body = `
<div class="card">
  <h1>Deals in ${escapeHtml(input.city)}</h1>
  <p class="area">${escapeHtml(input.city)}, ${escapeHtml(input.country)}</p>
  ${list}
  ${input.deals.length ? `<a class="cta alt" href="${escapeHtml(input.postUrl)}">Are you a local business? Post a free deal</a>` : ''}
</div>`;

  return renderPage(input.meta, body);
};

export interface PostPageInput {
  /** Prefilled values echoed back into the form (already validated). */
  name: string;
  city: string;
  source: string;
  listing: string;
  countries: Array<{ code: string; name: string }>;
  meta: PageMeta;
}

/**
 * The one-minute posting flow. Three steps shown on a single mobile screen:
 * 1) contact email, 2) business name + suburb/city, 3) the offer + optional photo.
 */
export const renderPostPage = (input: PostPageInput): string => {
  const countryOptions = input.countries
    .map((c) => `<option value="${escapeHtml(c.code)}">${escapeHtml(c.name)}</option>`)
    .join('');

  const body = `
<div class="card">
  <h1>Post a free deal</h1>
  <p class="muted">One minute, three steps. We review every deal before it goes live.</p>
</div>
<form class="card" method="post" action="/post">
  <h2>Step 1 - Your email</h2>
  <p><input name="email" type="email" required placeholder="you@example.com" style="width:100%;padding:10px;border:1px solid #cbd5e1;border-radius:8px" /></p>

  <h2>Step 2 - Your business</h2>
  <p><input name="businessName" required value="${escapeHtml(input.name)}" placeholder="Business name" style="width:100%;padding:10px;border:1px solid #cbd5e1;border-radius:8px" /></p>
  <p><input name="city" required value="${escapeHtml(input.city)}" placeholder="Suburb or city" style="width:100%;padding:10px;border:1px solid #cbd5e1;border-radius:8px" /></p>
  <p><select name="country" style="width:100%;padding:10px;border:1px solid #cbd5e1;border-radius:8px">${countryOptions}</select></p>

  <h2>Step 3 - Your offer</h2>
  <p><input name="title" required placeholder="Deal title (e.g. 2-for-1 burgers)" style="width:100%;padding:10px;border:1px solid #cbd5e1;border-radius:8px" /></p>
  <p><textarea name="whatYouGet" required rows="3" placeholder="What the customer gets" style="width:100%;padding:10px;border:1px solid #cbd5e1;border-radius:8px"></textarea></p>
  <p><input name="offerValue" placeholder="Price or % off (e.g. 50% off, $15)" style="width:100%;padding:10px;border:1px solid #cbd5e1;border-radius:8px" /></p>
  <p><label class="muted">Expiry date<br /><input name="expiry" type="date" required style="width:100%;padding:10px;border:1px solid #cbd5e1;border-radius:8px" /></label></p>
  <p><input name="photoUrl" type="url" placeholder="Photo URL (optional)" style="width:100%;padding:10px;border:1px solid #cbd5e1;border-radius:8px" /></p>

  <input type="hidden" name="source" value="${escapeHtml(input.source)}" />
  <input type="hidden" name="listing" value="${escapeHtml(input.listing)}" />
  <button class="cta" type="submit">Submit for review</button>
</form>`;

  return renderPage(input.meta, body);
};

export interface MessagePageInput {
  meta: PageMeta;
  heading: string;
  message: string;
  ctaHref?: string;
  ctaLabel?: string;
}

/** A small standalone page used for post-flow success and validation errors. */
export const renderMessagePage = (input: MessagePageInput): string => {
  const cta =
    input.ctaHref && input.ctaLabel
      ? `<a class="cta" href="${escapeHtml(input.ctaHref)}">${escapeHtml(input.ctaLabel)}</a>`
      : '';
  const body = `
<div class="card empty">
  <h1>${escapeHtml(input.heading)}</h1>
  <p class="muted">${escapeHtml(input.message)}</p>
  ${cta}
</div>`;
  return renderPage(input.meta, body);
};

export const renderNotFoundPage = (): string => {
  const body = `
<div class="card empty">
  <h1>Not found</h1>
  <p class="muted">This page is no longer available.</p>
  <a class="cta" href="/">Browse deals</a>
</div>`;
  return renderPage(
    {
      title: `Not found - ${SITE_NAME}`,
      description: 'The page you requested could not be found.',
      canonical: '/',
      noindex: true,
    },
    body
  );
};
