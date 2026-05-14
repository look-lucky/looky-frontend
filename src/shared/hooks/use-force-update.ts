import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import VersionCheck from 'react-native-version-check';

export function useForceUpdate() {
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [storeUrl, setStoreUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function check() {
      try {
        const res = await VersionCheck.needUpdate({
          packageName: 'kr.looky.looky',
          ...(Platform.OS === 'ios' && { country: 'kr' }),
        });
        if (res?.isNeeded) {
          setNeedsUpdate(true);
          setStoreUrl(res.storeUrl);
        }
      } catch {
        // 버전 체크 실패 시 앱 진입 차단하지 않음
      }
    }
    check();
  }, []);

  return { needsUpdate, storeUrl };
}
