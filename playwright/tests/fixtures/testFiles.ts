import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/**
 * アップロード可能な最小限の有効なPDFバイナリ
 *
 * @remarks
 * ファイル形式の判定はブラウザが拡張子から推測するMIMEタイプ（application/pdf）で
 * 行われるため、内容自体は最小限のダミーデータで足りる
 */
const MINIMAL_PDF_CONTENT = Buffer.from(
  '%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF'
);

/**
 * アップロードテスト用のダミーPDFファイルをOSの一時ディレクトリに生成する
 *
 * @param fileNames 生成するファイル名の配列
 * @returns 生成したファイルの絶対パスの配列（`fileNames` と同じ順序）
 */
export function createTestFiles(fileNames: string[]): string[] {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'file-list-e2e-'));

  return fileNames.map((fileName) => {
    const filePath = path.join(dir, fileName);
    fs.writeFileSync(filePath, MINIMAL_PDF_CONTENT);
    return filePath;
  });
}

/**
 * createTestFiles で生成したファイルとその一時ディレクトリを削除する
 *
 * @param filePaths createTestFiles が返したファイルパスの配列
 */
export function cleanupTestFiles(filePaths: string[]): void {
  if (filePaths.length === 0) return;
  const dir = path.dirname(filePaths[0]);
  fs.rmSync(dir, { recursive: true, force: true });
}
