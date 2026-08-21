import type { FileInfo } from '@/adapters/generated/files';

import { filterFiles } from '../filterFiles';

const files: FileInfo[] = [
  {
    id: 'file-1',
    name: '契約書.pdf',
    size: 100,
    mimeType: 'application/pdf',
    uploadedAt: '2024-01-15T09:00:00.000Z',
    downloadUrl: '/files/file-1/download',
    tagIds: ['tag-2'],
  },
  {
    id: 'file-2',
    name: '請求書.xlsx',
    size: 200,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    uploadedAt: '2024-01-10T09:00:00.000Z',
    downloadUrl: '/files/file-2/download',
    tagIds: ['tag-3'],
  },
];

test.concurrent('タグでファイルを絞り込めること', () => {
  expect(
    filterFiles(files, { selectedTags: ['tag-2'], startDate: '', endDate: '' }),
  ).toEqual([files[0]]);
});

test.concurrent('指定した日付の範囲でファイルを絞り込めること', () => {
  expect(
    filterFiles(files, {
      selectedTags: [],
      startDate: '2024-01-11',
      endDate: '2024-01-16',
    }),
  ).toEqual([files[0]]);
});

test.concurrent('フィルターが未指定の場合はすべてのファイルを返すこと', () => {
  expect(filterFiles(files, { selectedTags: [], startDate: '', endDate: '' })).toEqual(
    files,
  );
});