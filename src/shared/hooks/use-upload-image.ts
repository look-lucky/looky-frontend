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
  // iOS에서 fetch().blob()으로 생성한 Blob은 type이 빈 문자열이 되어
  // S3에서 Content-Type 불일치로 415를 반환하는 문제가 있음.
  // XMLHttpRequest로 직접 PUT하면 iOS에서도 Content-Type 헤더가 정상 전송됨.
  await uploadToS3(presignedUrl, asset.uri, mimeType);

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

function uploadToS3(presignedUrl: string, uri: string, mimeType: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', presignedUrl);
    xhr.setRequestHeader('Content-Type', mimeType);
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`S3 업로드 실패 (${xhr.status})`));
      }
    };
    xhr.onerror = () => reject(new Error('S3 업로드 네트워크 오류'));
    xhr.send({ uri, type: mimeType, name: 'upload' } as any);
  });
}
