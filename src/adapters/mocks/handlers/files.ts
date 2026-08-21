import { http, HttpResponse, delay } from 'msw';

import {
  HTTP_STATUS_SUCCESS,
} from '@/domain/constants';

// ダミーのファイル一覧データを生成
const generateMockFiles = () => {
  const files = [
    {
      id: 'file-1',
      name: '田中商事_請求書_202401.pdf',
      size: 2340000,
      mimeType: 'application/pdf',
      uploadedAt: new Date(2024, 0, 15, 18, 30).toISOString(),
      downloadUrl: '/api/v1/files/file-1/download',
      tagIds: ['tag-1', 'tag-2'],
    },
    {
      id: 'file-2',
      name: '会議室予約_スケジュール.xlsx',
      size: 512000,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      uploadedAt: new Date(2024, 0, 14, 18, 0).toISOString(),
      downloadUrl: '/api/v1/files/file-2/download',
      tagIds: ['tag-3'],
    },
    {
      id: 'file-3',
      name: '緊急対応_報告書.pdf',
      size: 1228800,
      mimeType: 'application/pdf',
      uploadedAt: new Date(2024, 0, 14, 2, 30).toISOString(),
      downloadUrl: '/api/v1/files/file-3/download',
      tagIds: ['tag-4', 'tag-5'],
    },
    {
      id: 'file-4',
      name: '鈴木工業_契約書_2024.pdf',
      size: 2048000,
      mimeType: 'application/pdf',
      uploadedAt: new Date(2024, 0, 12, 20, 20).toISOString(),
      downloadUrl: '/api/v1/files/file-4/download',
      tagIds: ['tag-5', 'tag-2'],
    },
    {
      id: 'file-5',
      name: '営業レポート_202401.docx',
      size: 2560000,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      uploadedAt: new Date(2024, 0, 12, 0, 10).toISOString(),
      downloadUrl: '/api/v1/files/file-5/download',
      tagIds: ['tag-6'],
    },
    {
      id: 'file-6',
      name: '佐藤建設_契約書_2024.docx',
      size: 1497600,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      uploadedAt: new Date(2024, 0, 10, 23, 20).toISOString(),
      downloadUrl: '/api/v1/files/file-6/download',
      tagIds: ['tag-5', 'tag-1'],
    },
    {
      id: 'file-7',
      name: '製品カタログ_2024.pdf',
      size: 8388608,
      mimeType: 'application/pdf',
      uploadedAt: new Date(2024, 0, 9, 19, 45).toISOString(),
      downloadUrl: '/api/v1/files/file-7/download',
      tagIds: ['tag-6'],
    },
    {
      id: 'file-8',
      name: '週次会議_議事録_20240108.pdf',
      size: 857088,
      mimeType: 'application/pdf',
      uploadedAt: new Date(2024, 0, 9, 1, 0).toISOString(),
      downloadUrl: '/api/v1/files/file-8/download',
      tagIds: ['tag-3', 'tag-6'],
    },
    {
      id: 'file-9',
      name: '研修資料_新入向け.pdf',
      size: 4194304,
      mimeType: 'application/pdf',
      uploadedAt: new Date(2024, 0, 7, 23, 0).toISOString(),
      downloadUrl: '/api/v1/files/file-9/download',
      tagIds: ['tag-3'],
    },
    {
      id: 'file-10',
      name: '高橋物産_請求書_202312.pdf',
      size: 2097152,
      mimeType: 'application/pdf',
      uploadedAt: new Date(2024, 0, 6, 20, 15).toISOString(),
      downloadUrl: '/api/v1/files/file-10/download',
      tagIds: ['tag-1', 'tag-5'],
    },
    {
      id: 'file-11',
      name: '予算案_2024年度.xlsx',
      size: 3145728,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      uploadedAt: new Date(2024, 0, 5, 19, 15).toISOString(),
      downloadUrl: '/api/v1/files/file-11/download',
      tagIds: ['tag-6'],
    },
    {
      id: 'file-12',
      name: '中間報告_プロジェクトA.docx',
      size: 1789952,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      uploadedAt: new Date(2024, 0, 5, 1, 30).toISOString(),
      downloadUrl: '/api/v1/files/file-12/download',
      tagIds: ['tag-3', 'tag-6'],
    },
    {
      id: 'file-13',
      name: '在庫管理表_202401.xlsx',
      size: 1048576,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      uploadedAt: new Date(2024, 0, 3, 18, 45).toISOString(),
      downloadUrl: '/api/v1/files/file-13/download',
      tagIds: ['tag-6', 'tag-2'],
    },
    {
      id: 'file-14',
      name: '営業成績_第4四半期.pdf',
      size: 3145728,
      mimeType: 'application/pdf',
      uploadedAt: new Date(2024, 0, 3, 0, 0).toISOString(),
      downloadUrl: '/api/v1/files/file-14/download',
      tagIds: ['tag-6', 'tag-5'],
    },
    {
      id: 'file-15',
      name: '事業計画書_2024年版.docx',
      size: 2621440,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      uploadedAt: new Date(2023, 11, 28, 22, 45).toISOString(),
      downloadUrl: '/api/v1/files/file-15/download',
      tagIds: ['tag-3', 'tag-1'],
    },
    {
      id: 'file-16',
      name: 'プロジェクトB_仕様書.pdf',
      size: 1840000,
      mimeType: 'application/pdf',
      uploadedAt: new Date(2023, 11, 25, 15, 20).toISOString(),
      downloadUrl: '/api/v1/files/file-16/download',
      tagIds: ['tag-3', 'tag-6'],
    },
    {
      id: 'file-17',
      name: '人事評価シート_2023.xlsx',
      size: 980000,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      uploadedAt: new Date(2023, 11, 20, 10, 30).toISOString(),
      downloadUrl: '/api/v1/files/file-17/download',
      tagIds: ['tag-6'],
    },
    {
      id: 'file-18',
      name: '山田製作所_見積書.pdf',
      size: 1560000,
      mimeType: 'application/pdf',
      uploadedAt: new Date(2023, 11, 18, 14, 45).toISOString(),
      downloadUrl: '/api/v1/files/file-18/download',
      tagIds: ['tag-1', 'tag-5'],
    },
    {
      id: 'file-19',
      name: '研修計画_2024年度.docx',
      size: 2100000,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      uploadedAt: new Date(2023, 11, 15, 9, 0).toISOString(),
      downloadUrl: '/api/v1/files/file-19/download',
      tagIds: ['tag-3'],
    },
    {
      id: 'file-20',
      name: '月次報告_202312.pdf',
      size: 1780000,
      mimeType: 'application/pdf',
      uploadedAt: new Date(2023, 11, 10, 17, 30).toISOString(),
      downloadUrl: '/api/v1/files/file-20/download',
      tagIds: ['tag-6', 'tag-5'],
    },
    {
      id: 'file-21',
      name: '品質管理マニュアル.pdf',
      size: 4500000,
      mimeType: 'application/pdf',
      uploadedAt: new Date(2023, 11, 5, 11, 15).toISOString(),
      downloadUrl: '/api/v1/files/file-21/download',
      tagIds: ['tag-3', 'tag-6'],
    },
    {
      id: 'file-22',
      name: '鈴木コーポ_発注書.xlsx',
      size: 720000,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      uploadedAt: new Date(2023, 11, 1, 13, 45).toISOString(),
      downloadUrl: '/api/v1/files/file-22/download',
      tagIds: ['tag-1', 'tag-2'],
    },
    {
      id: 'file-23',
      name: 'セキュリティポリシー.docx',
      size: 1920000,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      uploadedAt: new Date(2023, 10, 28, 16, 20).toISOString(),
      downloadUrl: '/api/v1/files/file-23/download',
      tagIds: ['tag-4', 'tag-6'],
    },
    {
      id: 'file-24',
      name: 'クライアント名簿.xlsx',
      size: 1300000,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      uploadedAt: new Date(2023, 10, 20, 10, 0).toISOString(),
      downloadUrl: '/api/v1/files/file-24/download',
      tagIds: ['tag-2', 'tag-6'],
    },
    {
      id: 'file-25',
      name: 'リスク管理体制.pdf',
      size: 2850000,
      mimeType: 'application/pdf',
      uploadedAt: new Date(2023, 10, 15, 14, 30).toISOString(),
      downloadUrl: '/api/v1/files/file-25/download',
      tagIds: ['tag-4', 'tag-5'],
    },
  ];

  return files;
};

// メモリ上の簡易DB（GET/POST/PUTで共有）
let filesDb = generateMockFiles();

/**
 * ファイル管理API のモックハンドラーを返す関数
 */
export const getFilesAPIMock = () => {
  const getFilesHandler = http.get('*/files', async ({ request }) => {
    await delay(500);

    const url = new URL(request.url);
    const searchQuery = url.searchParams.get('search') || '';

    let files = filesDb;

    // 検索クエリでフィルタリング（ファイル名で検索）
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      files = files.filter((file) =>
        file.name.toLowerCase().includes(lowerQuery)
      );
      console.log(`[MSW] Search: "${searchQuery}" | Found: ${files.length}/${filesDb.length}`);
    } else {
      console.log(`[MSW] Get all files: ${filesDb.length}`);
    }

    return new HttpResponse(
      JSON.stringify({
        files,
        total: files.length,
        page: 1,
        limit: 20,
      }),
      {
        status: HTTP_STATUS_SUCCESS.OK,
        headers: { 'content-type': 'application/json' },
      }
    );
  });

  // ファイルアップロード（POST /files）
  const uploadFileHandler = http.post('*/files', async ({ request }) => {
    await delay(300);
    const formData = await request.formData();
    const fileBlob = formData.get('file');
    const description = formData.get('description')?.toString();

    // Blobから名前やタイプを推定
    const name = (fileBlob as File)?.name || 'uploaded-file';
    const size = (fileBlob as File)?.size || 0;
    const mimeType = (fileBlob as File)?.type || 'application/octet-stream';

    const newFile = {
      id: `file-${Date.now()}`,
      name,
      size,
      mimeType,
      description,
      uploadedAt: new Date().toISOString(),
      downloadUrl: `/api/v1/files/${name}/download`,
      tagIds: [],
    };

    filesDb = [newFile, ...filesDb];
    console.log('[MSW] File uploaded:', newFile.name, '| Total files:', filesDb.length);

    return new HttpResponse(
      JSON.stringify({ file: newFile }),
      {
        status: HTTP_STATUS_SUCCESS.CREATED ?? HTTP_STATUS_SUCCESS.OK,
        headers: { 'content-type': 'application/json' },
      }
    );
  });

  // ファイル更新（PUT /files/:id）: タグ付け等
  const updateFileHandler = http.put('*/files/:id', async ({ params, request }) => {
    await delay(200);
    const fileId = params.id as string;
    const body = (await request.json()) as { name?: string; description?: string; tagIds?: string[] };

    const idx = filesDb.findIndex((f) => f.id === fileId);
    if (idx === -1) {
      console.error('[MSW] File not found for update:', fileId);
      return new HttpResponse(JSON.stringify({ message: 'Not Found' }), { status: 404 });
    }

    const updated = {
      ...filesDb[idx],
      ...(body?.name ? { name: body.name } : {}),
      ...(body?.description ? { description: body.description } : {}),
      ...(Array.isArray(body?.tagIds) ? { tagIds: body.tagIds! } : {}),
    };

    filesDb[idx] = updated;
    console.log('[MSW] File updated:', fileId, '| Tags:', updated.tagIds);

    return new HttpResponse(
      JSON.stringify({ file: updated }),
      {
        status: HTTP_STATUS_SUCCESS.OK,
        headers: { 'content-type': 'application/json' },
      }
    );
  });

  return [getFilesHandler, uploadFileHandler, updateFileHandler];
};
