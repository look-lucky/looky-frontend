/**
 * 사용자 ID를 기반으로 고정된 랜덤 프로필 이미지를 반환하는 유틸리티
 */
export const getProfileImage = (userId?: number | string) => {
    if (userId === undefined || userId === null || userId === "") {
        return require("@/assets/images/icons/mypage/profile-blue.png");
    }

    let index = 0;
    if (typeof userId === "number") {
        index = userId % 4;
    } else {
        // String ID (e.g., UUID) 처리: 모든 문자의 코드값을 더한 후 4로 나눔
        let hash = 0;
        for (let i = 0; i < userId.length; i++) {
            hash = (hash << 5) - hash + userId.charCodeAt(i);
            hash |= 0; // Convert to 32bit integer
        }
        index = Math.abs(hash) % 4;
    }

    switch (index) {
        case 0:
            return require("@/assets/images/icons/mypage/profile-blue.png");
        case 1:
            return require("@/assets/images/icons/mypage/profile-green.png");
        case 2:
            return require("@/assets/images/icons/mypage/profile-orange.png");
        case 3:
            return require("@/assets/images/icons/mypage/profile-red.png");
        default:
            return require("@/assets/images/icons/mypage/profile-blue.png");
    }
};
