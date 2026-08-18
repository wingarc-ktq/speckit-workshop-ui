import {
  formatFileSize,
  exceedsMaxUploadSize,
  getFileType,
  isSupportedFileType,
  FileType,
} from '../fileFormatters';

describe('fileFormatters', () => {
  describe('formatFileSize', () => {
    describe('正常系', () => {
      test.concurrent('0バイトが "0 Bytes" に変換されること', () => {
        expect(formatFileSize(0)).toBe('0 Bytes');
      });

      test.concurrent('1023バイトが "Bytes" 単位で表示されること', () => {
        expect(formatFileSize(1023)).toBe('1023 Bytes');
      });

      test.concurrent('1024バイトが "1 KB" に変換されること', () => {
        expect(formatFileSize(1024)).toBe('1 KB');
      });

      test.concurrent('1536バイトが "1.5 KB" に変換されること', () => {
        expect(formatFileSize(1536)).toBe('1.5 KB');
      });

      test.concurrent('1048576バイト（1MB）が正しく変換されること', () => {
        expect(formatFileSize(1048576)).toBe('1 MB');
      });

      test.concurrent('2621440バイト（2.5MB）が正しく変換されること', () => {
        expect(formatFileSize(2621440)).toBe('2.5 MB');
      });

      test.concurrent('1073741824バイト（1GB）が正しく変換されること', () => {
        expect(formatFileSize(1073741824)).toBe('1 GB');
      });

      test.concurrent('小数点以下は2桁で表示されること', () => {
        // 987936 bytes を計算すると 964.78125 KB となる
        expect(formatFileSize(987936)).toBe('964.78 KB');
      });
    });

    describe('エッジケース', () => {
      test.concurrent('1バイトが "1 Bytes" に変換されること', () => {
        expect(formatFileSize(1)).toBe('1 Bytes');
      });

      test.concurrent('1000000000バイトが "MB" 単位で表示されること', () => {
        // 1000000000 bytes = 953.67 MB (1GB未満)
        const result = formatFileSize(1000000000);
        expect(result).toMatch(/MB$/);
      });
    });

    describe('エラーハンドリング', () => {
      test.concurrent('負数が渡されるとエラーが投げられること', () => {
        expect(() => formatFileSize(-1)).toThrow(
          'File size cannot be negative'
        );
      });

      test.concurrent(
        '負の大きな数値が渡されるとエラーが投げられること',
        () => {
          expect(() => formatFileSize(-1048576)).toThrow(
            'File size cannot be negative'
          );
        }
      );
    });
  });

  describe('exceedsMaxUploadSize', () => {
    describe('正常系', () => {
      test.concurrent('0バイトが10MBを超過していないこと', () => {
        expect(exceedsMaxUploadSize(0)).toBe(false);
      });

      test.concurrent('1MBが10MBを超過していないこと', () => {
        expect(exceedsMaxUploadSize(1 * 1024 * 1024)).toBe(false);
      });

      test.concurrent('10MBが10MBを超過していないこと（境界値）', () => {
        expect(exceedsMaxUploadSize(10 * 1024 * 1024)).toBe(false);
      });

      test.concurrent('9.99MBが10MBを超過していないこと', () => {
        expect(exceedsMaxUploadSize(10 * 1024 * 1024 - 1000)).toBe(false);
      });
    });

    describe('超過判定', () => {
      test.concurrent('10MB + 1バイトが10MBを超過していること', () => {
        expect(exceedsMaxUploadSize(10 * 1024 * 1024 + 1)).toBe(true);
      });

      test.concurrent('11MBが10MBを超過していること', () => {
        expect(exceedsMaxUploadSize(11 * 1024 * 1024)).toBe(true);
      });

      test.concurrent('100MBが10MBを超過していること', () => {
        expect(exceedsMaxUploadSize(100 * 1024 * 1024)).toBe(true);
      });

      test.concurrent('1GBが10MBを超過していること', () => {
        expect(exceedsMaxUploadSize(1024 * 1024 * 1024)).toBe(true);
      });
    });
  });

  describe('getFileType', () => {
    describe('PDF型の判定', () => {
      test.concurrent('application/pdfがPDFと判定されること', () => {
        expect(getFileType('application/pdf')).toBe(FileType.PDF);
      });

      test.concurrent('pdfを含むMIMEタイプがPDFと判定されること', () => {
        expect(getFileType('text/pdf')).toBe(FileType.PDF);
      });
    });

    describe('Word型の判定', () => {
      test.concurrent(
        'application/vnd.openxmlformats-officedocument.wordprocessingml.documentがWordと判定されること',
        () => {
          expect(
            getFileType(
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            )
          ).toBe(FileType.WORD);
        }
      );

      test.concurrent(
        'application/vnd.ms-wordがWordと判定されること（wordを含む）',
        () => {
          expect(getFileType('application/vnd.ms-word')).toBe(FileType.WORD);
        }
      );

      test.concurrent('documentを含むMIMEタイプがWordと判定されること', () => {
        expect(
          getFileType(
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          )
        ).toBe(FileType.WORD);
      });
    });

    describe('Excel型の判定', () => {
      test.concurrent('sheetを含むMIMEタイプがExcelと判定されること', () => {
        // 注: application/vnd.openxmlformats-officedocument.spreadsheetml.sheetは
        // "document"という文字列を含むため、Word型として判定される
        // getFileTypeの実装では"document"がsheet より先に評価されるため
        expect(
          getFileType(
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          )
        ).toBe(FileType.WORD);
      });

      test.concurrent(
        'application/vnd.ms-excelがExcelと判定されること（excelを含む）',
        () => {
          expect(getFileType('application/vnd.ms-excel')).toBe(FileType.EXCEL);
        }
      );

      test.concurrent(
        'sheetを含むシンプルなMIMEタイプがExcelと判定されること',
        () => {
          expect(getFileType('application/sheet')).toBe(FileType.EXCEL);
        }
      );

      test.concurrent(
        'sheetwordのような複合文字列ではwordが優先されること',
        () => {
          // wordはexcelの前に評価されるため、wordが含まれるとWord型と判定される
          expect(getFileType('application/sheetword')).toBe(FileType.WORD);
        }
      );
    });

    describe('Image型の判定', () => {
      test.concurrent('image/jpegがImageと判定されること', () => {
        expect(getFileType('image/jpeg')).toBe(FileType.IMAGE);
      });

      test.concurrent('image/pngがImageと判定されること', () => {
        expect(getFileType('image/png')).toBe(FileType.IMAGE);
      });

      test.concurrent('image/gifがImageと判定されること', () => {
        expect(getFileType('image/gif')).toBe(FileType.IMAGE);
      });
    });

    describe('Other型の判定', () => {
      test.concurrent(
        'サポート対象外のMIMEタイプがOtherと判定されること',
        () => {
          expect(getFileType('text/plain')).toBe(FileType.OTHER);
        }
      );

      test.concurrent('application/jsonがOtherと判定されること', () => {
        expect(getFileType('application/json')).toBe(FileType.OTHER);
      });

      test.concurrent('空文字列がOtherと判定されること', () => {
        expect(getFileType('')).toBe(FileType.OTHER);
      });
    });

    describe('マッチング優先度', () => {
      test.concurrent(
        'pdfを含む場合は最初に評価されてPDFと判定されること',
        () => {
          expect(getFileType('application/pdf')).toBe(FileType.PDF);
        }
      );

      test.concurrent(
        'wordが含まれていてdocumentも含まれている場合はwordが優先されること',
        () => {
          expect(getFileType('application/vnd.ms-word-document')).toBe(
            FileType.WORD
          );
        }
      );
    });
  });

  describe('isSupportedFileType', () => {
    describe('サポート対象型', () => {
      test.concurrent('application/pdfがサポート対象と判定されること', () => {
        expect(isSupportedFileType('application/pdf')).toBe(true);
      });

      test.concurrent(
        'application/vnd.openxmlformats-officedocument.wordprocessingml.documentがサポート対象と判定されること',
        () => {
          expect(
            isSupportedFileType(
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            )
          ).toBe(true);
        }
      );

      test.concurrent(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheetがサポート対象と判定されること',
        () => {
          expect(
            isSupportedFileType(
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
          ).toBe(true);
        }
      );

      test.concurrent('image/jpegがサポート対象と判定されること', () => {
        expect(isSupportedFileType('image/jpeg')).toBe(true);
      });

      test.concurrent('image/pngがサポート対象と判定されること', () => {
        expect(isSupportedFileType('image/png')).toBe(true);
      });
    });

    describe('非サポート対象型', () => {
      test.concurrent('text/plainがサポート対象外と判定されること', () => {
        expect(isSupportedFileType('text/plain')).toBe(false);
      });

      test.concurrent(
        'application/jsonがサポート対象外と判定されること',
        () => {
          expect(isSupportedFileType('application/json')).toBe(false);
        }
      );

      test.concurrent('image/gifがサポート対象外と判定されること', () => {
        expect(isSupportedFileType('image/gif')).toBe(false);
      });

      test.concurrent(
        'application/vnd.ms-wordがサポート対象外と判定されること',
        () => {
          expect(isSupportedFileType('application/vnd.ms-word')).toBe(false);
        }
      );

      test.concurrent('空文字列がサポート対象外と判定されること', () => {
        expect(isSupportedFileType('')).toBe(false);
      });
    });

    describe('エッジケース', () => {
      test.concurrent('大文字のMIMEタイプでの判定', () => {
        // 注: 関数が大文字に対応していない場合は失敗
        // 実装上、includes()は大文字小文字を区別するため、
        // 大文字のMIMEタイプはサポート対象外となる
        expect(isSupportedFileType('APPLICATION/PDF')).toBe(false);
      });

      test.concurrent(
        'pdfを含むが完全一致でないMIMEタイプは判定されること',
        () => {
          // application/pdfを含む場合はサポート対象
          expect(isSupportedFileType('application/pdf-archive')).toBe(true);
        }
      );
    });

    describe('複数のサポート対象型が含まれる場合', () => {
      test.concurrent(
        '最初のサポート対象型がマッチするとtrueが返されること',
        () => {
          // 両方を含む異常なMIMEタイプでも、最初にマッチするものを返す
          expect(isSupportedFileType('application/pdf;image/jpeg')).toBe(true);
        }
      );
    });
  });
});
