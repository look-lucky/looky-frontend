import { Linking, Platform } from 'react-native';

export type MapType = 'naver' | 'kakao' | 'google';

interface MapLinkOptions {
    latitude: number;
    longitude: number;
    name: string;
    address?: string;
}

export const MapLinks = {
    naver: {
        name: '네이버 지도',
        getAppUrl: (lat: number, lng: number, name: string) =>
            Platform.select({
                ios: `nmap://map?v=2&lat=${lat}&lng=${lng}&zoom=15&text=${encodeURIComponent(name)}&appname=kr.looky.looky`,
                android: `nmap://map?v=2&lat=${lat}&lng=${lng}&zoom=15&text=${encodeURIComponent(name)}&appname=kr.looky.looky`,
            })!,
        getWebUrl: (lat: number, lng: number, name: string) =>
            `https://map.naver.com/index.nhn?slng=&slat=&stext=&elng=${lng}&elat=${lat}&etext=${encodeURIComponent(name)}&menu=route`,
    },
    kakao: {
        name: '카카오맵',
        getAppUrl: (lat: number, lng: number, name: string) =>
            `kakaomap://route?ep=${lat},${lng}&by=CAR`,
        getWebUrl: (lat: number, lng: number, name: string) =>
            `https://map.kakao.com/link/to/${encodeURIComponent(name)},${lat},${lng}`,
    },
    google: {
        name: '구글 맵',
        getAppUrl: (lat: number, lng: number, name: string) =>
            Platform.select({
                ios: `comgooglemaps://?daddr=${lat},${lng}&directionsmode=driving`,
                android: `google.navigation:q=${lat},${lng}&mode=d`,
            })!,
        getWebUrl: (lat: number, lng: number, name: string) =>
            `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
    },
};

export async function openExternalMap(type: MapType, options: MapLinkOptions) {
    const { latitude, longitude, name } = options;
    const map = MapLinks[type];
    const appUrl = map.getAppUrl(latitude, longitude, name);
    const webUrl = map.getWebUrl(latitude, longitude, name);

    try {
        const supported = await Linking.canOpenURL(appUrl);
        if (supported) {
            await Linking.openURL(appUrl);
        } else {
            await Linking.openURL(webUrl);
        }
    } catch (error) {
        console.error(`Failed to open ${type} map:`, error);
        await Linking.openURL(webUrl);
    }
}
