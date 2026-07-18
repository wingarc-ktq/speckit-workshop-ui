import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from 'react-error-boundary';

import { forbiddenError } from '@/__fixtures__/errors';
import { FatalException } from '@/domain/errors';
import { i18n } from '@/i18n/config';

import { LoadError } from '../LoadError';

describe('LoadError', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ja');
  });

  const renderLoadError = (
    props: Partial<React.ComponentProps<typeof LoadError>> = {}
  ) => {
    const onReload = vi.fn();
    const result = render(<LoadError onReload={onReload} {...props} />);
    return { onReload, ...result };
  };

  test('エラー未指定の場合、汎用メッセージと再読み込みボタンが表示されること', () => {
    renderLoadError();

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('読み込みに失敗しました')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '再読み込み' })
    ).toBeInTheDocument();
  });

  test('データ取得に失敗したことを示すアイコンが表示されること', () => {
    renderLoadError();

    expect(screen.getByTestId('ErrorOutlinedIcon')).toBeInTheDocument();
  });

  test('再読み込みボタンをクリックすると onReload が呼ばれること', async () => {
    const user = userEvent.setup();
    const { onReload } = renderLoadError();

    expect(onReload).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: '再読み込み' }));

    expect(onReload).toHaveBeenCalledTimes(1);
  });

  test('WebApiException の場合、ステータスに応じたメッセージが表示されること', () => {
    renderLoadError({ error: forbiddenError });

    expect(
      screen.getByText(
        'この操作を行う権限がありません。問題が解消しない場合はブラウザをリロードしてください。'
      )
    ).toBeInTheDocument();
  });

  test('ApplicationException 以外のエラーの場合、汎用メッセージが表示されること', () => {
    renderLoadError({ error: new Error('unexpected') });

    expect(screen.getByText('読み込みに失敗しました')).toBeInTheDocument();
  });

  test('メッセージに変換できない ApplicationException の場合、再スローして外側の ErrorBoundary に委譲すること', () => {
    const onReload = vi.fn();
    render(
      <ErrorBoundary fallback={<div>外側のエラー表示</div>}>
        <LoadError
          onReload={onReload}
          error={new FatalException('unknown', 'Error')}
        />
      </ErrorBoundary>
    );

    expect(screen.getByText('外側のエラー表示')).toBeInTheDocument();
    expect(screen.queryByTestId('loadErrorMessage')).not.toBeInTheDocument();
  });
});
