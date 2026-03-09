import { customFetch } from '@/src/api/mutator';
import * as FileSystem from 'expo-file-system/legacy';

// Domain-specific upload limits
export const DOMAIN_LIMITS = {
    STORE_PROFILE: { sizeLimit: 5, maxCount: 1 },
    STORE_GALLERY: { sizeLimit: 10, maxCount: 3 },
    STORE_NEWS: { sizeLimit: 10, maxCount: 5 },
    USER_PROFILE: { sizeLimit: 5, maxCount: 1 },
    MENU_IMAGE: { sizeLimit: 5, maxCount: 1 },
    REVIEW: { sizeLimit: 5, maxCount: 3 },
    INQUIRY: { sizeLimit: 5, maxCount: 5 },
    EVENT_BANNER: { sizeLimit: 10, maxCount: 1 },
    EVENT_GENERAL: { sizeLimit: 10, maxCount: 10 },
    BIZ_REGISTRATION: { sizeLimit: 10, maxCount: 1 },
} as const;

export type UploadDomain = keyof typeof DOMAIN_LIMITS;

export interface ValidationSuccess {
    valid: true;
}

export interface ValidationFailure {
    valid: false;
    reason: string;
}

export type ValidationResult = ValidationSuccess | ValidationFailure;

/**
 * Validates a single image asset based on size and format.
 */
export function validateImage(
    uri: string,
    fileSize: number | undefined,
    domain: UploadDomain
): ValidationResult {
    if (!uri) {
        return { valid: false, reason: "이미지 경로가 누락되었습니다." };
    }

    // 1. Format validation (JPG, JPEG, PNG only)
    const filename = uri.split('/').pop() || '';
    const ext = filename.split('.').pop()?.toLowerCase();
    const isAllowedFormat = ['jpg', 'jpeg', 'png'].includes(ext || '');

    if (!isAllowedFormat) {
        return { valid: false, reason: "JPG, PNG 형식의 이미지만 업로드 가능합니다." };
    }

    // 2. Size validation
    const limitMB = DOMAIN_LIMITS[domain].sizeLimit;
    if (fileSize && fileSize > limitMB * 1024 * 1024) {
        return { valid: false, reason: `${limitMB}MB 이하의 이미지만 업로드 가능합니다.` };
    }

    return { valid: true };
}

/**
 * Validates the number of images selected.
 */
export function validateImageCount(
    currentCount: number,
    newCount: number,
    domain: UploadDomain
): ValidationResult {
    const maxCount = DOMAIN_LIMITS[domain].maxCount;
    if (currentCount + newCount > maxCount) {
        return { valid: false, reason: `이미지는 최대 ${maxCount}장까지 업로드 가능합니다.` };
    }
    return { valid: true };
}

/**
 * Helper to determine MIME type from extension or fallback.
 */
export function getMimeType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'png': return 'image/png';
        case 'jpg':
        case 'jpeg': return 'image/jpeg';
        default: return 'image/jpeg'; // fallback
    }
}

/**
 * Requests a Presigned URL from the backend.
 */
export async function getPresignedUrl(fileName: string, contentType: string) {
    const response = await customFetch<any>(
        '/api/presigned-url',
        {
            method: 'POST',
            body: JSON.stringify({ fileName, contentType }),
        }
    );
    console.log("Presigned URL API Response:", JSON.stringify(response.data));

    // Backend may return `{ data: { presignedUrl, fileUrl } }` or just `{ presignedUrl, fileUrl }`
    const presignedUrl = response.data?.data?.presignedUrl || response.data?.presignedUrl;
    const fileUrl = response.data?.data?.fileUrl || response.data?.fileUrl;

    if (!presignedUrl) {
        throw new Error("API 응답에 presignedUrl이 없습니다. " + JSON.stringify(response.data));
    }
    return { presignedUrl, fileUrl };
}

/**
 * Uploads a local file to S3 using a Presigned URL.
 */
export async function uploadToS3(presignedUrl: string, localUri: string, mimeType: string) {
    try {
        const uploadRes = await FileSystem.uploadAsync(presignedUrl, localUri, {
            httpMethod: 'PUT',
            headers: {
                'Content-Type': mimeType,
            },
            uploadType: 0 as any, // FileSystemUploadType.BINARY_CONTENT
        });

        if (uploadRes.status < 200 || uploadRes.status >= 300) {
            throw new Error(`S3 업로드 실패: 상태 코드 ${uploadRes.status}`);
        }
    } catch (error) {
        console.error("S3 직접 업로드 오류", error);
        throw error;
    }
}

/**
 * One-stop function to process an array of local URIs:
 * validate -> getPresignedUrl -> put to S3 -> return array of final S3 fileUrls.
 * Local URIs without 'http' are uploaded. Existing 'http' URLs are ignored and returned as is
 * in the final result or caller should separate them before calling this.
 * 
 * NOTE: This function only uploads NEW images.
 */
export async function processAndUploadImages(
    localUris: string[],
): Promise<string[]> {
    const uploadedUrls: string[] = [];

    for (const uri of localUris) {
        if (uri.startsWith('http')) {
            // Already uploaded, skipping
            uploadedUrls.push(uri);
            continue;
        }

        const filename = uri.split('/').pop() || `image-${Date.now()}.jpg`;
        const mimeType = getMimeType(filename);

        // 1. Get Presigned URL
        const { presignedUrl, fileUrl } = await getPresignedUrl(filename, mimeType);

        // 2. Upload to S3
        await uploadToS3(presignedUrl, uri, mimeType);

        // 3. Store final URL
        uploadedUrls.push(fileUrl);
    }

    return uploadedUrls;
}
