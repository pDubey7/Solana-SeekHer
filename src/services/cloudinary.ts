const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME ?? '';
const UPLOAD_PRESET = 'seekher_profiles';
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

// ─── Upload ───────────────────────────────────────────────────────────────────

/**
 * Uploads a local image URI to Cloudinary using an unsigned preset.
 * Works on React Native using FormData (multipart).
 * Returns the secure_url of the uploaded image.
 */
export async function uploadProfilePhoto(
    imageUri: string,
    walletAddress: string,
): Promise<string> {
    const body = new FormData();

    // React Native FormData accepts { uri, type, name } objects
    body.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: `photo_${Date.now()}.jpg`,
    } as unknown as Blob);

    body.append('upload_preset', UPLOAD_PRESET);
    body.append('folder', `seekher/profiles/${walletAddress}`);

    const res = await fetch(UPLOAD_URL, { method: 'POST', body });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Cloudinary upload failed: ${err}`);
    }

    const data = (await res.json()) as { secure_url: string };
    return data.secure_url;
}

// ─── Delete ───────────────────────────────────────────────────────────────────

/**
 * Deletes a Cloudinary asset by its public_id.
 * Note: deletion from client-side requires a signed request in production.
 * For now this calls a thin server-side proxy; swap the URL if using a backend.
 */
export async function deletePhoto(publicId: string): Promise<void> {
    const deleteUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`;
    const body = new FormData();
    body.append('public_id', publicId);
    body.append('upload_preset', UPLOAD_PRESET);

    const res = await fetch(deleteUrl, { method: 'POST', body });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Cloudinary delete failed: ${err}`);
    }
}
