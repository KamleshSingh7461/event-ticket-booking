import cloudinary from './cloudinary';

/**
 * Upload an image to Cloudinary
 * @param file - File buffer or base64 string
 * @param folder - Cloudinary folder to upload to (default: 'events')
 * @returns Cloudinary upload result with secure_url
 */
export async function uploadToCloudinary(
    file: Buffer | string,
    folder: string = 'events'
): Promise<{ secure_url: string; public_id: string }> {
    try {
        // Convert buffer to base64 if needed
        const fileStr = Buffer.isBuffer(file)
            ? `data:image/png;base64,${file.toString('base64')}`
            : file;

        const result = await cloudinary.uploader.upload(fileStr, {
            folder,
            resource_type: 'auto',
        });

        return {
            secure_url: result.secure_url,
            public_id: result.public_id,
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error('Failed to upload image to Cloudinary');
    }
}

/**
 * Delete an image from Cloudinary
 * @param publicId - The public ID of the image to delete
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        throw new Error('Failed to delete image from Cloudinary');
    }
}

/**
 * Upload event banner to Cloudinary
 * @param file - File buffer or base64 string
 * @param eventId - Event ID for naming
 * @returns Cloudinary secure URL
 */
export async function uploadEventBanner(
    file: Buffer | string,
    eventId?: string
): Promise<string> {
    const folder = 'events/banners';
    const result = await uploadToCloudinary(file, folder);
    return result.secure_url;
}
