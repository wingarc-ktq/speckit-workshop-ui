import React from 'react';

import Skeleton from '@mui/material/Skeleton';

import * as S from './styled';

/** RecentFilesSection が表示する FileCard の最大件数（useFiles の limit と揃える） */
const SKELETON_CARD_COUNT = 4;

/**
 * RecentFilesSection のデータ取得中に表示するスケルトン。
 *
 * @remarks
 * タイトルと横並びの FileCard という最終レイアウトと同じ骨格を表示し、
 * ロード完了時のレイアウトシフトを抑える。
 */
export const RecentFilesSkeleton: React.FC = () => {
  return (
    <S.FilesContainer data-testid="recentFilesSkeleton" aria-busy="true">
      {Array.from({ length: SKELETON_CARD_COUNT }).map((_, index) => (
        <S.Card key={index}>
          <Skeleton variant="rounded" height={80} />
          <Skeleton variant="rounded" width={64} height={24} />
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="50%" />
          <Skeleton variant="rounded" height={32} />
        </S.Card>
      ))}
    </S.FilesContainer>
  );
};
