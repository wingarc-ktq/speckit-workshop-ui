/**
 * ファイルタイプ定数
 */
export const FileType = {
  PDF: 'pdf',
  WORD: 'word',
  EXCEL: 'excel',
  IMAGE: 'image',
  OTHER: 'other',
} as const;
export type FileType = (typeof FileType)[keyof typeof FileType];

/**
 * バイト数を人間可読形式に変換（例: "2.4 KB", "964.51 kB"）
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 0) {
    throw new Error('File size cannot be negative');
  }
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(k)),
    sizes.length - 1
  );

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * 10MBを超えているか判定
 */
export function exceedsMaxUploadSize(bytes: number): boolean {
  const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB
  return bytes > MAX_UPLOAD_SIZE;
}

/**
 * ファイルタイプを取得（アイコン表示用）
 */
export function getFileType(mimeType: string): FileType {
  if (mimeType.includes('pdf')) return FileType.PDF;
  if (mimeType.includes('word') || mimeType.includes('document'))
    return FileType.WORD;
  if (mimeType.includes('excel') || mimeType.includes('sheet'))
    return FileType.EXCEL;
  if (mimeType.includes('image')) return FileType.IMAGE;
  return FileType.OTHER;
}

/**
 * サポート対象のMIMEタイプか判定
 */
export function isSupportedFileType(mimeType: string): boolean {
  const supportedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
  ];
  return supportedTypes.some((type) => mimeType.includes(type));
}
