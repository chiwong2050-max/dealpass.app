import { describe, it, expect } from 'vitest';
import { moderateOfferContent, moderateBusinessProfile } from './aiModerator';

describe('AI Moderator Utils', () => {
  describe('moderateOfferContent', () => {
    it('should approve safe content', async () => {
      const result = await moderateOfferContent(
        'Great Pizza Deal',
        'Get 50% off all large pizzas this Friday!',
        5
      );
      expect(result.status).toBe('ACTIVE');
      expect(result.score).toBe(100);
    });

    it('should reject banned keywords', async () => {
      const result = await moderateOfferContent(
        'Scam Opportunity',
        'This is a fake deal involving illegal items.',
        10
      );
      expect(result.status).toBe('REJECTED');
      expect(result.score).toBe(0);
      expect(result.reasoning).toContain('Contains prohibited keywords (Safety Violation).');
    });

    it('should flag spam keywords', async () => {
      const result = await moderateOfferContent(
        'Winner!',
        'Click here for free money and lottery winnings.',
        1
      );
      expect(result.status).toBe('PENDING_MODERATION');
      expect(result.reasoning).toContain('Contains potential spam phrases.');
    });

    it('should flag short descriptions', async () => {
      const result = await moderateOfferContent(
        'Short Deal',
        'Too short.',
        1
      );
      expect(result.status).toBe('PENDING_MODERATION');
      expect(result.reasoning).toContain('Description is too short/vague.');
    });
  });

  describe('moderateBusinessProfile', () => {
    it('should approve complete profile', async () => {
      const result = await moderateBusinessProfile(
        'Valid Business',
        'We are a legitimate business with a long description that meets the requirements.',
        'https://example.com'
      );
      expect(result.status).toBe('ACTIVE');
    });

    it('should flag incomplete profile without website', async () => {
      const result = await moderateBusinessProfile(
        'New Biz',
        'Short desc.',
        undefined
      );
      expect(result.status).toBe('PENDING_APPROVAL');
      expect(result.reasoning).toContain('No website provided and short description. Verification harder.');
    });
  });
});
