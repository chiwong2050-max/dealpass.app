interface ModerationResult {
  status: string; // Generic status string to map to specific Enums
  score: number;
  reasoning: string[];
  suggestedTitle?: string;
}

const BANNED_KEYWORDS = ['scam', 'xxx', 'illegal', 'drug', 'fake'];
const SPAM_KEYWORDS = ['free money', 'click here', '100% free', 'winner', 'lottery'];

// Family-safe / AdSense-safe blocklist. DealPass must never carry gambling,
// adult or alcohol-promotion content. Matched as whole words so that, e.g.,
// "better" does not trip the "bet" rule.
const BLOCKED_CATEGORY_WORDS = [
  // Gambling
  'casino', 'poker', 'gambling', 'betting', 'wager', 'roulette', 'blackjack',
  'jackpot', 'sportsbook', 'bookmaker', 'slot machine',
  // Adult
  'porn', 'porno', 'escort', 'nude', 'nudity', 'onlyfans', 'brothel', 'strip club',
  // Alcohol promotion
  'alcohol', 'beer', 'wine', 'vodka', 'whisky', 'whiskey', 'tequila', 'champagne',
  'cocktail', 'liquor', 'happy hour', 'pub crawl',
];
const BLOCKED_CATEGORY_PATTERN = new RegExp(`\\b(${BLOCKED_CATEGORY_WORDS.join('|')})\\b`, 'i');

export const moderateOfferContent = async (
  title: string,
  description: string,
  creditCost: number
): Promise<ModerationResult> => {
  const reasoning: string[] = [];
  let score = 100;
  let status = 'ACTIVE';

  const combinedText = `${title} ${description}`.toLowerCase();

  // 1. Safety Check (Block)
  const hasBannedWords = BANNED_KEYWORDS.some(word => combinedText.includes(word));
  if (hasBannedWords) {
    return {
      status: 'REJECTED',
      score: 0,
      reasoning: ['Contains prohibited keywords (Safety Violation).']
    };
  }

  // 1b. Family-safe category check (Block gambling / adult / alcohol promos).
  if (BLOCKED_CATEGORY_PATTERN.test(combinedText)) {
    return {
      status: 'REJECTED',
      score: 0,
      reasoning: ['Contains prohibited category keywords (Family-safe violation).']
    };
  }

  // 2. Spam Check (Flag)
  const hasSpamWords = SPAM_KEYWORDS.some(word => combinedText.includes(word));
  if (hasSpamWords) {
    score -= 40;
    reasoning.push('Contains potential spam phrases.');
    status = 'PENDING_MODERATION';
  }

  // 3. Quality Checks
  if (description.length < 20) {
    score -= 20;
    reasoning.push('Description is too short/vague.');
    status = 'PENDING_MODERATION';
  }

  if (title === title.toUpperCase() && title.length > 10) {
    score -= 10;
    reasoning.push('Title is all caps (low quality).');
    // We can allow it but lower score
  }

  if (creditCost > 100) {
    reasoning.push('High credit cost requires manual review.');
    status = 'PENDING_MODERATION';
  }

  // Auto-Improve Title (Simple capitalization)
  const suggestedTitle = title
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    status,
    score,
    reasoning,
    suggestedTitle: suggestedTitle !== title ? suggestedTitle : undefined
  };
};

export const moderateBusinessProfile = async (
  tradingName: string,
  description: string,
  website?: string
): Promise<ModerationResult> => {
  const reasoning: string[] = [];
  let score = 100;
  let status = 'ACTIVE'; // Default to active for businesses in this "AI-first" model

  // 1. Completeness Check
  if (!description || description.length < 50) {
    score -= 30;
    reasoning.push('Business description is thin.');
    status = 'PENDING_APPROVAL';
  }

  if (!website && description.length < 100) {
    score -= 20;
    reasoning.push('No website provided and short description. Verification harder.');
    status = 'PENDING_APPROVAL';
  }

  // 2. Keyword Check
  const combinedText = `${tradingName} ${description}`.toLowerCase();
  if (BANNED_KEYWORDS.some(word => combinedText.includes(word))) {
    return {
      status: 'REJECTED',
      score: 0,
      reasoning: ['Business profile contains prohibited keywords.']
    };
  }

  if (BLOCKED_CATEGORY_PATTERN.test(combinedText)) {
    return {
      status: 'REJECTED',
      score: 0,
      reasoning: ['Business profile contains prohibited category keywords (Family-safe violation).']
    };
  }

  return {
    status,
    score,
    reasoning
  };
};