import { zodResolver } from '@hookform/resolvers/zod';
import TextField from '@mui/material/TextField';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { i18n } from '@/i18n/config';
import { loadZodLocale } from '@/i18n/zodLocale';

import { StringController } from '../StringController';

describe('StringController', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ja');
  });

  // 基本的なテスト用スキーマ
  const basicSchema = z.object({
    testField: z.string(),
  });
  type BasicFormData = z.infer<typeof basicSchema>;

  const label = 'テストフィールド';

  // テスト用のフォームコンポーネント
  const BasicTestForm: React.FC<{
    onSubmit?: (data: BasicFormData) => void;
  }> = ({ onSubmit = vi.fn() }) => {
    const { control, handleSubmit } = useForm<BasicFormData>({
      resolver: zodResolver(basicSchema),
      defaultValues: { testField: '' },
    });

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <StringController
          name="testField"
          control={control}
          render={(props) => <TextField {...props} label={label} />}
        />
        <button type="submit" data-testid="submit-button">
          送信
        </button>
      </form>
    );
  };

  describe('基本的な表示', () => {
    test('smallサイズで表示される', () => {
      render(<BasicTestForm />);
      const input = screen.getByLabelText('テストフィールド');
      expect(input.closest('.MuiInputBase-root')).toHaveClass(
        'MuiInputBase-sizeSmall'
      );
    });

    describe('初期値', () => {
      const PrefilledTestForm: React.FC<{
        prefilledValue: string;
      }> = ({ prefilledValue }) => {
        const { control, handleSubmit } = useForm<BasicFormData>({
          resolver: zodResolver(basicSchema),
          defaultValues: { testField: prefilledValue },
        });

        return (
          <form onSubmit={handleSubmit(() => {})}>
            <StringController
              name="testField"
              control={control}
              render={(props) => <TextField {...props} label={label} />}
            />
            <button type="submit">送信</button>
          </form>
        );
      };
      test('useFormの初期値が反映される', () => {
        const value = '初期値';
        render(<PrefilledTestForm prefilledValue={value} />);

        const input = screen.getByLabelText(label);
        expect(input).toHaveValue(value);
      });
    });
  });

  describe('ユーザー入力', () => {
    test('テキスト入力が正常に動作する', async () => {
      const user = userEvent.setup();
      render(<BasicTestForm />);

      const input = screen.getByLabelText(label);

      expect(input).toHaveValue('');

      await user.type(input, 'テスト入力');

      expect(input).toHaveValue('テスト入力');
    });

    test('入力値をクリアできる', async () => {
      const user = userEvent.setup();
      render(<BasicTestForm />);

      const input = screen.getByLabelText(label);

      await user.type(input, 'テスト入力');

      expect(input).toHaveValue('テスト入力');

      await user.clear(input);

      expect(input).toHaveValue('');
    });

    test('フォーム送信時に入力値が正しく渡される', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      const value = 'フォーム送信テスト';
      render(<BasicTestForm onSubmit={onSubmit} />);

      const input = screen.getByLabelText(label);
      const submitButton = screen.getByTestId('submit-button');

      await user.type(input, value);
      await user.click(submitButton);

      expect(onSubmit).toHaveBeenCalledWith(
        {
          testField: value,
        },
        expect.any(Object) // React SyntheticEvent
      );
    });
  });

  describe('バリデーション', () => {
    describe('デフォルトエラーメッセージ', () => {
      // デフォルトエラーメッセージ用テストフォーム
      const DefaultErrorTestForm: React.FC = () => {
        const defaultErrorSchema = z.object({
          testField: z.string().min(1),
        });

        const { control, handleSubmit } = useForm({
          resolver: zodResolver(defaultErrorSchema),
          defaultValues: { testField: '' },
        });

        return (
          <form onSubmit={handleSubmit(() => {})}>
            <StringController
              name="testField"
              control={control}
              render={(props) => <TextField {...props} />}
            />
            <button type="submit" data-testid="submit-button">
              送信
            </button>
          </form>
        );
      };

      test('日本語のデフォルトエラーメッセージが表示される', async () => {
        // 日本語にする
        await i18n.changeLanguage('ja');
        await loadZodLocale('ja');

        const user = userEvent.setup();

        render(<DefaultErrorTestForm />);

        const submitButton = screen.getByTestId('submit-button');

        // エラーを発生させる
        await user.click(submitButton);

        // Zodのデフォルト必須エラーメッセージ（実際の表示内容）
        expect(
          screen.getByText(
            '小さすぎる値: stringは1文字以上である必要があります'
          )
        ).toBeInTheDocument();
      });

      test('英語のデフォルトエラーメッセージが表示される', async () => {
        // 英語にする
        await i18n.changeLanguage('en');
        await loadZodLocale('en');

        const user = userEvent.setup();

        render(<DefaultErrorTestForm />);

        const submitButton = screen.getByTestId('submit-button');

        // 必須エラーをトリガー
        await user.click(submitButton);

        // Zodのデフォルト必須エラーメッセージ（実際の表示内容）
        expect(
          screen.getByText('Too small: expected string to have >=1 characters')
        ).toBeInTheDocument();
      });
    });

    describe('カスタムエラーメッセージ', () => {
      // カスタムエラーメッセージ用テストフォーム
      const CustomErrorTestForm: React.FC = () => {
        const customErrorSchema = z.object({
          testField: z
            .string()
            .min(1, { error: () => i18n.t('validations.require') }),
        });

        const { control, handleSubmit } = useForm({
          resolver: zodResolver(customErrorSchema),
          defaultValues: { testField: '' },
        });

        return (
          <form onSubmit={handleSubmit(() => {})}>
            <StringController
              name="testField"
              control={control}
              render={(props) => <TextField {...props} />}
            />
            <button type="submit" data-testid="submit-button">
              送信
            </button>
          </form>
        );
      };

      test('日本語のカスタムエラーメッセージが表示される', async () => {
        // 日本語にする
        await i18n.changeLanguage('ja');
        await loadZodLocale('ja');

        const user = userEvent.setup();

        render(<CustomErrorTestForm />);

        const submitButton = screen.getByTestId('submit-button');

        // 必須エラーをトリガー
        await user.click(submitButton);

        // カスタム必須エラーメッセージ（日本語）
        expect(screen.getByText('必須項目です')).toBeInTheDocument();
      });

      test('英語のカスタムエラーメッセージが表示される', async () => {
        // 英語にする
        await i18n.changeLanguage('en');
        await loadZodLocale('en');

        const user = userEvent.setup();

        render(<CustomErrorTestForm />);

        const submitButton = screen.getByTestId('submit-button');

        // 必須エラーをトリガー
        await user.click(submitButton);

        // カスタム必須エラーメッセージ（英語）
        expect(screen.getByText('This field is required')).toBeInTheDocument();
      });

      test('言語切り替え時にエラーメッセージも切り替わる', async () => {
        const user = userEvent.setup();

        // 最初は日本語でレンダリング
        await i18n.changeLanguage('ja');
        await loadZodLocale('ja');

        const { rerender } = render(<CustomErrorTestForm />);

        const submitButton = screen.getByTestId('submit-button');

        // エラーを発生させる
        await user.click(submitButton);
        expect(screen.getByText('必須項目です')).toBeInTheDocument();

        // 言語を英語に切り替え
        await i18n.changeLanguage('en');
        await loadZodLocale('en');
        rerender(<CustomErrorTestForm />);

        // 再度エラーをトリガー
        await user.click(submitButton);

        // エラーメッセージが英語に変わっていることを確認
        expect(screen.getByText('This field is required')).toBeInTheDocument();
        expect(screen.queryByText('必須項目です')).not.toBeInTheDocument();
      });
    });

    describe('複数のバリデーションエラー', () => {
      // 明確に重複する条件を持つテストフォーム
      const OverlappingValidationTestForm: React.FC = () => {
        const overlappingValidationSchema = z.object({
          testField: z
            .string()
            .regex(/^[a-zA-Z]+$/, { error: () => '英字のみ入力してください' })
            .min(5, { error: () => '5文字以上入力してください' }),
        });

        const { control, handleSubmit } = useForm({
          resolver: zodResolver(overlappingValidationSchema),
          defaultValues: { testField: '' },
        });

        return (
          <form onSubmit={handleSubmit(() => {})}>
            <StringController
              name="testField"
              control={control}
              render={(props) => (
                <TextField {...props} label="テストフィールド" />
              )}
            />
            <button type="submit" data-testid="submit-button">
              送信
            </button>
          </form>
        );
      };

      test('2つの条件に同時に違反している場合は最初のエラーのみ表示される', async () => {
        const user = userEvent.setup();

        render(<OverlappingValidationTestForm />);

        const input = screen.getByLabelText('テストフィールド');
        const submitButton = screen.getByTestId('submit-button');

        // 「数字3文字」を入力 → 英字のみ違反 + 5文字以上違反（両方同時に違反）
        await user.type(input, '123');
        await user.click(submitButton);

        // 最初のバリデーション（英字のみ）のエラーメッセージのみ表示
        expect(
          screen.getByText('英字のみ入力してください')
        ).toBeInTheDocument();
        // 2番目のエラーメッセージ（5文字以上）は表示されない
        expect(
          screen.queryByText('5文字以上入力してください')
        ).not.toBeInTheDocument();
      });
    });
  });
});
