export const createSlug = (title: string, id: string) => {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  
  // Format: /deal/offer-title-slug-<ID>
  return `${slug}-${id}`;
};

export const extractIdFromSlug = (slugId: string) => {
  // Finds the last segment after the last hyphen
  const parts = slugId.split('-');
  return parts[parts.length - 1];
};