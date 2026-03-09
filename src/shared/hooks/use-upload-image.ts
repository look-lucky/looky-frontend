import { getPresignedUrl } from '@/src/api/upload';
import type { ImagePickerAsset } from 'expo-image-picker';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

export type ImageSizeLimit = 'profile' | 'gallery';

const SIZE_LIMITS: Record<ImageSizeLimit, number> = {
  profile: 5 * 1024 * 1024,  // 5MB
  gallery: 10 * 1024 * 1024, // 10MB
};

export function validateImageAsset(
  asset: ImagePickerAsset,
  sizeLimit: ImageSizeLimit = 'gallery',
): string | null {
  const mimeType = asset.mimeType ?? 'image/jpeg';
  if (!ALLOWED_TYPES.includes(mimeType)) {
    return `지원하지 않는 형식입니다. JPG, PNG만 업로드할 수 있습니다. (선택된 형식: ${mimeType})`;
  }
  const limit = SIZE_LIMITS[sizeLimit];
  if (asset.fileSize && asset.fileSize > limit) {
    const limitMB = limit / 1024 / 1024;
    return `${limitMB}MB 이하의 사진만 업로드할 수 있습니다.`;
  }
  return null;
}

/**
 * 단일 이미지 → Presigned URL 발급 → S3 PUT → fileUrl 반환
 */
export async function uploadImageAsset(asset: ImagePickerAsset): Promise<string> {
  const mimeType = asset.mimeType ?? 'image/jpeg';
  const ext = mimeType.split('/')[1] ?? 'jpg';
  const fileName = asset.fileName ?? `upload_${Date.now()}.${ext}`;

  // 1. Presigned URL 발급
  const res = await getPresignedUrl({ fileName, contentType: mimeType });
  const { presignedUrl, fileUrl } = (res as any).data?.data ?? {};

  if (!presignedUrl || !fileUrl) {
    throw new Error('Presigned URL 발급 실패');
  }

  // 2. S3에 직접 PUT
  const blob = await uriToBlob(asset.uri);
  const s3Res = await fetch(presignedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': mimeType },
    body: blob,
  });

  if (!s3Res.ok) {
    throw new Error(`S3 업로드 실패 (${s3Res.status})`);
  }

  return fileUrl;
}

/**
 * 여러 이미지 순차 업로드 → fileUrl[] 반환
 */
export async function uploadImageAssets(assets: ImagePickerAsset[]): Promise<string[]> {
  const urls: string[] = [];
  for (const asset of assets) {
    const url = await uploadImageAsset(asset);
    urls.push(url);
  }
  return urls;
}

async function uriToBlob(uri: string): Promise<Blob> {
  const res = await fetch(uri);
  return res.blob();
}
