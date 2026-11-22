import QRCode from 'qrcode';

/**
 * Generates QR code data (e.g., a data URL for an image) from a given string.
 * This can be used to encode coupon codes or other redemption data.
 * @param data The string data to encode in the QR code.
 * @returns A Promise that resolves to a data URL string (e.g., 'data:image/png;base64,...').
 */
export const generateQrCodeDataUrl = async (data: string): Promise<string> => {
  try {
    // You can customize options here, e.g., errorCorrectionLevel, type
    const dataUrl = await QRCode.toDataURL(data, { errorCorrectionLevel: 'H' });
    return dataUrl;
  } catch (err) {
    console.error('Error generating QR code:', err);
    throw new Error(`Failed to generate QR code: ${err instanceof Error ? err.message : String(err)}`);
  }
};