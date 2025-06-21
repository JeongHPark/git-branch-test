// tokenStore.ts - Class 없는 간단한 구현

interface StoredRefreshToken {
  userId: number;
  refreshToken: string;
  createdAt: Date;
}

// 🔥 간단한 Map 저장소 (실제 환경에서는 Redis나 DB 사용)
const refreshTokens = new Map<number, StoredRefreshToken>();

// Refresh Token 저장
export const saveRefreshToken = (userId: number, refreshToken: string): void => {
  refreshTokens.set(userId, {
    userId,
    refreshToken,
    createdAt: new Date()
  });
  console.log(`✅ Refresh token saved for user ${userId}`);
};

// Refresh Token 검증
export const validateRefreshToken = (userId: number, refreshToken: string): boolean => {
  const stored = refreshTokens.get(userId);
  
  // 저장된 토큰이 없으면 false
  if (!stored) {
    console.log(`❌ No refresh token found for user ${userId}`);
    return false;
  }
  
  // 토큰 값이 다르면 false
  if (stored.refreshToken !== refreshToken) {
    console.log(`❌ Token mismatch for user ${userId}`);
    return false;
  }
  
  // 7일 만료 체크 (추가 보안)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  if (stored.createdAt < sevenDaysAgo) {
    console.log(`❌ Token expired for user ${userId}`);
    refreshTokens.delete(userId);
    return false;
  }
  
  console.log(`✅ Token validated for user ${userId}`);
  return true;
};

// Refresh Token 삭제 (로그아웃, 토큰 재발급 시)
export const removeRefreshToken = (userId: number): void => {
  const deleted = refreshTokens.delete(userId);
  if (deleted) {
    console.log(`🗑️ Refresh token removed for user ${userId}`);
  }
};

// 현재 저장된 토큰들 확인 (디버깅용)
export const getAllTokens = (): Map<number, StoredRefreshToken> => {
  console.log('📋 All stored tokens:', refreshTokens);
  return refreshTokens;
};

// 특정 사용자 토큰 조회 (디버깅용)
export const getTokenForUser = (userId: number): StoredRefreshToken | undefined => {
  return refreshTokens.get(userId);
};