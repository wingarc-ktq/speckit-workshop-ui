import React from 'react';

import { useTranslation } from 'react-i18next';

import { tKeys } from '@/i18n/tKeys';

import * as S from './styled';

/**
 * 最近使用したファイルが1件もないときに表示する空状態。
 *
 * @remarks
 * 何も描画しないとタイトルだけになりレイアウトが詰まってしまうため、
 * ファイル一覧と同等の高さを持つプレースホルダを表示してガタつきを防ぐ。
 */
export const EmptyRecentFiles: React.FC = () => {
  const { t } = useTranslation();

  return (
    <S.EmptyState data-testid="emptyRecentFiles">
      <S.EmptyIcon aria-hidden />
      <S.EmptyStateTitle>
        {t(tKeys.filesPage.recentFilesSection.emptyState.title)}
      </S.EmptyStateTitle>
      <S.EmptyStateDescription>
        {t(tKeys.filesPage.recentFilesSection.emptyState.description)}
      </S.EmptyStateDescription>
    </S.EmptyState>
  );
};
