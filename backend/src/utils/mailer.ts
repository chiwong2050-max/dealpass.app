// Minimal transactional email helper for the posting flow.
//
// No paid email provider is wired up yet (billing and paid services stay off),
// so this degrades gracefully: it logs the message the operator needs to act on
// instead of throwing. Swapping in a real provider later only has to change the
// body of `sendEmail` - callers never depend on a provider being present.

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
}

/**
 * Send an email. Without a configured provider this logs the message so the
 * link is never silently lost. Never throws: the caller (a public form post)
 * must not fail just because email delivery is unavailable.
 */
export const sendEmail = async (message: EmailMessage): Promise<void> => {
  try {
    console.log(`[email] to=${message.to} subject="${message.subject}"`);
    console.log(`[email] body: ${message.text}`);
  } catch (error) {
    console.error('[email] failed to emit message', error);
  }
};
