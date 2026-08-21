/**
 * テスト用ファイルのフィクスチャ
 * 
 * E2Eテストで使用するダミーファイルのパス定義
 */

export const testFiles = {
  // 小さいテキストファイル（22B）
  smallTextFile: 'playwright/tests/fixtures/files/test-document.txt',

  // PDFファイル（1.5MB想定）
  pdfFile: 'playwright/tests/fixtures/files/drag-drop-test.pdf',

  // 複数ファイルアップロード用
  document1: 'playwright/tests/fixtures/files/document1.pdf',
  document2: 'playwright/tests/fixtures/files/document2.docx',
  document3: 'playwright/tests/fixtures/files/document3.xlsx',

  // サイズ超過ファイル（15MB）- 実際のファイルは用意せず、テスト内で動的生成
  largeFile: 'playwright/tests/fixtures/files/large-file.pdf',

  // 対応外形式ファイル
  invalidFile: 'playwright/tests/fixtures/files/invalid-file.exe',

  // タグなしアップロード用
  noTagFile: 'playwright/tests/fixtures/files/no-tag-file.pdf',
};

/**
 * テスト用ファイルを動的に生成するヘルパー
 */
export class TestFileGenerator {
  /**
   * 指定サイズのダミーファイルを生成
   * @param sizeInBytes ファイルサイズ（バイト）
   * @returns Buffer
   */
  static generateDummyFile(sizeInBytes: number): Buffer {
    return Buffer.alloc(sizeInBytes, 'A');
  }

  /**
   * 小さいテキストファイルを生成（22バイト）
   */
  static generateSmallTextFile(): Buffer {
    return Buffer.from('This is a test file.\n', 'utf-8');
  }

  /**
   * 10MBを超える大きなファイルを生成
   */
  static generateLargeFile(): Buffer {
    return this.generateDummyFile(15 * 1024 * 1024); // 15MB
  }

  /**
   * 正常サイズのPDFダミーファイル（1.5MB）
   */
  static generateNormalPdfFile(): Buffer {
    return this.generateDummyFile(1.5 * 1024 * 1024);
  }
}
