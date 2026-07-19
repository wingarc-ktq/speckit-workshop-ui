/**
 * JWT アクセストークンのクライアント側ストア
 * @remarks
 * - `rememberMe` が true の場合は localStorage（リロード後も保持）、
 *   false の場合は sessionStorage（タブを閉じるまで保持）に保存する
 * - 送信時は `Authorization: Bearer <token>` として付与する（axios.ts の interceptor 参照）
 */
const TOKEN_KEY = 'accessToken';

/**
 * アクセストークンを保存する
 * @param token JWT アクセストークン
 * @param remember true=localStorage / false=sessionStorage に保存
 */
export function setAccessToken(token: string, remember: boolean): void {
  // 保存先を切り替えるため、両方から一旦削除してから設定する
  clearAccessToken();
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(TOKEN_KEY, token);
}

/**
 * 保存済みのアクセストークンを取得する
 * @returns アクセストークン。存在しない場合は null
 */
export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
}

/**
 * 保存済みのアクセストークンを破棄する
 */
export function clearAccessToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}
