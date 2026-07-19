import { i18n } from '@/i18n/config';
import { loadZodLocale } from '@/i18n/zodLocale';

import { loginCredentialsSchema } from '../type';

describe('loginCredentialsSchema', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ja');
    await loadZodLocale('ja');
  });

  describe('email フィールドのバリデーション', () => {
    describe('必須バリデーション', () => {
      test.concurrent('空文字の場合はエラーになること', () => {
        const result = loginCredentialsSchema.safeParse({
          email: '',
          password: 'password123',
        });

        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe('必須項目です');
      });

      test.concurrent('有効なメールアドレスの場合は成功すること', () => {
        const result = loginCredentialsSchema.safeParse({
          email: 'user@example.com',
          password: 'password123',
        });

        expect(result.success).toBe(true);
        expect(result.data?.email).toBe('user@example.com');
      });
    });

    describe('メールアドレス形式', () => {
      test.concurrent(
        'サブアドレス付きの形式でも成功すること',
        () => {
          const result = loginCredentialsSchema.safeParse({
            email: 'test.user+tag@example.co.jp',
            password: 'password123',
          });

          expect(result.success).toBe(true);
        }
      );

      test.concurrent('@ を含まない場合はエラーになること', () => {
        const result = loginCredentialsSchema.safeParse({
          email: 'testuser123',
          password: 'password123',
        });

        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe(
          '有効なメールアドレスを入力してください'
        );
      });

      test.concurrent('ドメインが無い場合はエラーになること', () => {
        const result = loginCredentialsSchema.safeParse({
          email: 'test@',
          password: 'password123',
        });

        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe(
          '有効なメールアドレスを入力してください'
        );
      });
    });
  });

  describe('password フィールドのバリデーション', () => {
    describe('必須バリデーション', () => {
      test.concurrent('空文字の場合はエラーになること', () => {
        const result = loginCredentialsSchema.safeParse({
          email: 'test@example.com',
          password: '',
        });

        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe('必須項目です');
      });

      test.concurrent('有効なパスワードの場合は成功すること', () => {
        const result = loginCredentialsSchema.safeParse({
          email: 'test@example.com',
          password: 'password123',
        });

        expect(result.success).toBe(true);
      });
    });

    describe('最小文字数バリデーション（境界値テスト）', () => {
      test.concurrent('7文字の場合はエラーになること', () => {
        const result = loginCredentialsSchema.safeParse({
          email: 'test@example.com',
          password: 'pass123',
        });

        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe(
          '8文字以上で入力してください'
        );
      });

      test.concurrent('8文字ちょうどの場合は成功すること', () => {
        const result = loginCredentialsSchema.safeParse({
          email: 'test@example.com',
          password: 'pass1234',
        });

        expect(result.success).toBe(true);
      });
    });

    describe('最大文字数バリデーション（境界値テスト）', () => {
      test.concurrent('36文字ちょうどの場合は成功すること', () => {
        const result = loginCredentialsSchema.safeParse({
          email: 'test@example.com',
          password: 'a'.repeat(36),
        });

        expect(result.success).toBe(true);
      });

      test.concurrent('37文字の場合はエラーになること', () => {
        const result = loginCredentialsSchema.safeParse({
          email: 'test@example.com',
          password: 'a'.repeat(37),
        });

        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe(
          '36文字以内で入力してください'
        );
      });
    });

    describe('特殊文字を含むパスワード', () => {
      test.concurrent('記号を含むパスワードは成功すること', () => {
        const result = loginCredentialsSchema.safeParse({
          email: 'test@example.com',
          password: 'P@ssw0rd!',
        });

        expect(result.success).toBe(true);
      });

      test.concurrent('スペースを含むパスワードは成功すること', () => {
        const result = loginCredentialsSchema.safeParse({
          email: 'test@example.com',
          password: 'pass word 123',
        });

        expect(result.success).toBe(true);
      });

      test.concurrent('日本語を含むパスワードは成功すること', () => {
        const result = loginCredentialsSchema.safeParse({
          email: 'test@example.com',
          password: 'パスワード123',
        });

        expect(result.success).toBe(true);
      });
    });
  });

  describe('rememberMe フィールドのバリデーション', () => {
    test.concurrent('trueの場合は成功すること', () => {
      const result = loginCredentialsSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true,
      });

      expect(result.success).toBe(true);
      expect(result.data?.rememberMe).toBe(true);
    });

    test.concurrent('falseの場合は成功すること', () => {
      const result = loginCredentialsSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      });

      expect(result.success).toBe(true);
      expect(result.data?.rememberMe).toBe(false);
    });

    test.concurrent('省略した場合は成功すること', () => {
      const result = loginCredentialsSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(true);
      expect(result.data?.rememberMe).toBeUndefined();
    });

    test.concurrent('undefinedの場合は成功すること', () => {
      const result = loginCredentialsSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: undefined,
      });

      expect(result.success).toBe(true);
      expect(result.data?.rememberMe).toBeUndefined();
    });
  });
});
