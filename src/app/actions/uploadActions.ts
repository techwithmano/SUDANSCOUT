
'use server';
import cloudinary from '@/lib/cloudinary';

export async function uploadImage(formData: FormData) {
    const file = formData.get('file') as File;

    if (!file) {
        return { success: false, message: 'No file provided.' };
    }
    
    // Check for file size (e.g., 10MB limit)
    if (file.size > 10 * 1024 * 1024) {
        return { success: false, message: 'File is too large. Max 10MB.' };
    }

    try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        const result: any = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({
                folder: process.env.CLOUDINARY_FOLDER || 'scout-central',
                resource_type: "auto"
            }, (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(result);
            }).end(buffer);
        });

        return { success: true, url: result.secure_url };

    } catch (error) {
        console.error('Upload Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown upload error';
        return { success: false, message: `Upload failed: ${errorMessage}` };
    }
}
