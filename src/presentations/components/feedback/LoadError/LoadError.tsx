import React from 'react';

import AutorenewIcon from '@mui/icons-material/Autorenew';
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';

import { ApplicationException } from '@/domain/errors';
import { tKeys } from '@/i18n';
import { useErrorMessage } from '@/presentations/hooks';

import * as S from './styled';

interface LoadErrorProps {
  /** 捕捉したエラー。指定するとエラー内容に応じたメッセージを表示する */
  error?: Error | null;
  /** 再読み込みボタンクリック時のハンドラ */
  onReload: () => void;
}

/**
 * データ取得失敗時の汎用インラインエラー表示。
 *
 * @remarks
 * - QueryBoundary の既定のエラー表示。メッセージは AppErrorDialog と同じ
 *   {@link useErrorMessage} で出し分ける
 * - メッセージに変換できない未知の {@link ApplicationException} は再スローし、外側の
 *   ErrorBoundary に委譲する。ハンドリング漏れを握り潰さないための安全網で、
 *   QueryBoundary の shouldRethrow の設定に依存しない
 */
export const LoadError: React.FC<LoadErrorProps> = ({ onReload, error }) => {
  const { t } = useTranslation();
  const message = useLoadErrorMessage(error);

  return (
    <S.CenterContainer role="status">
      <S.Content>
        <S.ErrorIcon aria-hidden />
        <S.Message data-testid="loadErrorMessage">{message}</S.Message>
        <Button
          variant="text"
          color="primary"
          size="small"
          startIcon={<AutorenewIcon fontSize="small" />}
          onClick={onReload}
        >
          {t(tKeys.components.loadError.reload)}
        </Button>
      </S.Content>
    </S.CenterContainer>
  );
};

/**
 * エラー内容からインライン表示用のメッセージを解決する
 */
const useLoadErrorMessage = (error: Error | null | undefined): string => {
  const { t } = useTranslation();
  const { toMessageFromError } = useErrorMessage();

  if (error instanceof ApplicationException) {
    return toMessageFromError(error);
  }
  return t(tKeys.components.loadError.message);
};
