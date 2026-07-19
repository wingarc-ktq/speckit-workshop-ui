import z from 'zod';

import { tKeys } from '@/i18n';
import { i18n } from '@/i18n/config';
/**
 * 認証関連のドメインモデル
 */

/**
 * ログイン認証情報のスキーマ
 * @remarks
 * - emailとpasswordは必須
 * - rememberMeはオプション（true=localStorage / false=sessionStorage にトークンを保存）
 * @remarks
 * - カスタムエラーメッセージは`error: () => i18n.t(tkeys.xxx.xxx)`の形式で記載
 * - アロー関数にすることで、言語が変更されても追従できる
 */
export const loginCredentialsSchema = z.object({
  email: z
    .string()
    .min(1, { error: () => i18n.t(tKeys.validations.require) })
    .pipe(z.email({ error: () => i18n.t(tKeys.validations.invalidEmail) })),
  password: z
    .string()
    .min(1, { error: () => i18n.t(tKeys.validations.require) })
    .min(8, { error: () => i18n.t(tKeys.validations.minLength, { min: 8 }) })
    .max(36, {
      error: () => i18n.t(tKeys.validations.maxLength, { max: 36 }),
    }),
  rememberMe: z.boolean().optional(),
});

/**
 * ログイン認証情報の型
 */
export type LoginCredentials = z.infer<typeof loginCredentialsSchema>;

export interface User {
  /** ユーザーID */
  readonly id: string;
  /** メールアドレス */
  readonly email: string;
  /** 氏名 */
  readonly name: string;
}

export interface SessionInfo {
  /** アクセストークンの有効期限 */
  readonly expiresAt: Date;
}

export interface AuthSession {
  /** ユーザー情報 */
  readonly user: User;
  /** セッション情報（ログイン時のみ有効期限を保持） */
  readonly sessionInfo?: SessionInfo;
}

export interface LoginResult {
  /** 認証セッション */
  readonly session: AuthSession;
}
