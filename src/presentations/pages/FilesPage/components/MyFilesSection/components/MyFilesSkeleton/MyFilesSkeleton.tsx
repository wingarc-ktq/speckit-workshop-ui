import React from 'react';

import Skeleton from '@mui/material/Skeleton';
import { useTranslation } from 'react-i18next';

import { tKeys } from '@/i18n/tKeys';

import * as S from './styled';

/**
 * MyFilesSection のデータ取得中に表示するスケルトン。
 *
 * @remarks
 * タイトルは既知のため実テキストで表示し、FileListTable（MUI DataGrid）部分のみを
 * 骨格（ヘッダー行 + データ行 + ページネーションフッター）で模す。これにより
 * タイトルはロード中・完了後で変わらず、テーブル領域のレイアウトシフトも抑える。
 */
export const MyFilesSkeleton: React.FC = () => {
  const { t } = useTranslation();

  return (
    <S.Container data-testid="myFilesSkeleton" aria-busy="true">
      <S.Header>
        <S.Title>{t(tKeys.filesPage.myFilesSection.title)}</S.Title>
      </S.Header>

      <S.Root>
        <S.HeaderRow>
          <S.CheckboxCell>
            <Skeleton variant="rounded" width={18} height={18} />
          </S.CheckboxCell>
          {COLUMNS.map((column) => (
            <S.Cell key={column.key} style={{ flexGrow: column.grow }}>
              <Skeleton variant="text" width={column.headerWidth} />
            </S.Cell>
          ))}
        </S.HeaderRow>

        {Array.from({ length: SKELETON_ROW_COUNT }).map((_, rowIndex) => (
          <S.Row key={rowIndex}>
            <S.CheckboxCell>
              <Skeleton variant="rounded" width={18} height={18} />
            </S.CheckboxCell>
            {COLUMNS.map((column) => (
              <S.Cell key={column.key} style={{ flexGrow: column.grow }}>
                {renderCellContent(column.key)}
              </S.Cell>
            ))}
          </S.Row>
        ))}

        <S.Footer>
          <Skeleton variant="text" width={90} />
          <Skeleton variant="rounded" width={40} height={24} />
          <Skeleton variant="text" width={70} />
          <Skeleton variant="circular" width={28} height={28} />
          <Skeleton variant="circular" width={28} height={28} />
        </S.Footer>
      </S.Root>
    </S.Container>
  );
};

/** テーブルのスケルトンとして描画するプレースホルダ行数 */
const SKELETON_ROW_COUNT = 5;

/** FileListTable のカラム構成に対応するスケルトン定義 */
const COLUMNS = [
  { key: 'name', grow: 3, headerWidth: 52 },
  { key: 'tags', grow: 2, headerWidth: 44 },
  { key: 'modified', grow: 2, headerWidth: 96 },
  { key: 'size', grow: 1.5, headerWidth: 68 },
] as const;

/** カラムごとにセル内のスケルトン表現を出し分ける */
const renderCellContent = (key: (typeof COLUMNS)[number]['key']) => {
  switch (key) {
    case 'name':
      return (
        <>
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="text" width="60%" />
        </>
      );
    case 'tags':
      return (
        <>
          <Skeleton variant="rounded" width={48} height={20} />
          <Skeleton variant="rounded" width={36} height={20} />
        </>
      );
    case 'modified':
      return <Skeleton variant="text" width="70%" />;
    case 'size':
      return <Skeleton variant="text" width="45%" />;
  }
};
