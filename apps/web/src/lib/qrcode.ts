import QRCode from 'qrcode';

/**
 * Generate QR code as data URL
 */
export async function generateQRCode(data: string): Promise<string> {
    try {
        const qrCodeDataURL = await QRCode.toDataURL(data, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });
        return qrCodeDataURL;
    } catch (error) {
        console.error('QR Code generation error:', error);
        throw error;
    }
}

/**
 * Generate QR code for ticket verification
 */
export async function generateTicketQR(params: {
    ticketId: string;
    bookingReference: string;
    qrCodeHash: string;
}): Promise<string> {
    const { ticketId, bookingReference, qrCodeHash } = params;

    // Create QR data with ticket information
    const qrData = JSON.stringify({
        ticketId,
        bookingReference,
        hash: qrCodeHash,
        timestamp: Date.now()
    });

    return await generateQRCode(qrData);
}
