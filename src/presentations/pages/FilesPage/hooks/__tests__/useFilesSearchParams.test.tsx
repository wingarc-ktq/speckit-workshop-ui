import { type ReactNode } from 'react';

import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { QUERY_PARAMS } from '@/presentations/constants/queryParams';

import { useFilesSearchParams } from '../useFilesSearchParams';

describe('useFilesSearchParams', () => {
  /**
   * useFilesSearchParams を実際の React Router (MemoryRouter) 上で描画して検証する。
   *
   * useSearchParams をモックせず本物のルーターを使うことで、URL への反映やページの
   * リセットを「実際の動作」としてテストできる（モックしないため型キャストも不要）。
   */
  const renderUseFilesSearchParams = (
    initialParams?: Record<string, string>
  ) => {
    const search = initialParams
      ? `?${new URLSearchParams(initialParams).toString()}`
      : '';

    const wrapper = ({ children }: { children: ReactNode }) => (
      <MemoryRouter initialEntries={[`/${search}`]}>{children}</MemoryRouter>
    );

    return renderHook(() => useFilesSearchParams(), { wrapper });
  };

  describe('初期状態', () => {
    test('クエリパラメータが空の場合、すべての値がundefinedであること', () => {
      const { result } = renderUseFilesSearchParams();

      expect(result.current.searchQuery).toBeUndefined();
      expect(result.current.page).toBeUndefined();
      expect(result.current.pageSize).toBeUndefined();
    });
  });

  describe('getSearchQuery: 検索クエリの取得', () => {
    test('検索クエリが存在する場合、正しい値が返されること', () => {
      const { result } = renderUseFilesSearchParams({
        [QUERY_PARAMS.SEARCH]: 'test query',
      });

      expect(result.current.searchQuery).toBe('test query');
    });

    test('検索クエリが存在しない場合、undefinedが返されること', () => {
      const { result } = renderUseFilesSearchParams();

      expect(result.current.searchQuery).toBeUndefined();
    });

    test('空文字列の検索クエリの場合、空文字列が返されること', () => {
      const { result } = renderUseFilesSearchParams({
        [QUERY_PARAMS.SEARCH]: '',
      });

      expect(result.current.searchQuery).toBe('');
    });

    test('日本語の検索クエリが正しく取得できること', () => {
      const { result } = renderUseFilesSearchParams({
        [QUERY_PARAMS.SEARCH]: 'テスト検索',
      });

      expect(result.current.searchQuery).toBe('テスト検索');
    });

    test('特殊文字を含む検索クエリが正しく取得できること', () => {
      const { result } = renderUseFilesSearchParams({
        [QUERY_PARAMS.SEARCH]: 'test@#$%&*',
      });

      expect(result.current.searchQuery).toBe('test@#$%&*');
    });
  });

  describe('setSearchQuery: 検索クエリの設定', () => {
    test('検索クエリを設定できること', () => {
      const { result } = renderUseFilesSearchParams();

      act(() => {
        result.current.setSearchQuery('new query');
      });

      expect(result.current.searchQuery).toBe('new query');
    });

    test('空文字列を設定した場合、検索クエリパラメータが削除されること', () => {
      const { result } = renderUseFilesSearchParams({
        [QUERY_PARAMS.SEARCH]: 'existing query',
      });

      act(() => {
        result.current.setSearchQuery('');
      });

      expect(result.current.searchQuery).toBeUndefined();
    });

    test('検索クエリ設定時にページパラメータがリセットされること', () => {
      const { result } = renderUseFilesSearchParams({
        [QUERY_PARAMS.PAGE]: '3',
        [QUERY_PARAMS.PAGE_SIZE]: '20',
      });

      act(() => {
        result.current.setSearchQuery('new query');
      });

      // ページパラメータは削除される
      expect(result.current.page).toBeUndefined();
      // ページサイズは維持される
      expect(result.current.pageSize).toBe(20);
      // 検索クエリは設定される
      expect(result.current.searchQuery).toBe('new query');
    });

    test('検索クエリを空文字列に設定した場合、ページパラメータはリセットされないこと', () => {
      const { result } = renderUseFilesSearchParams({
        [QUERY_PARAMS.SEARCH]: 'existing query',
        [QUERY_PARAMS.PAGE]: '3',
      });

      act(() => {
        result.current.setSearchQuery('');
      });

      // 検索クエリは削除される
      expect(result.current.searchQuery).toBeUndefined();
      // ページパラメータは維持される
      expect(result.current.page).toBe(3);
    });

    test('日本語の検索クエリを設定できること', () => {
      const { result } = renderUseFilesSearchParams();

      act(() => {
        result.current.setSearchQuery('テスト検索');
      });

      expect(result.current.searchQuery).toBe('テスト検索');
    });

    test('特殊文字を含む検索クエリを設定できること', () => {
      const { result } = renderUseFilesSearchParams();

      act(() => {
        result.current.setSearchQuery('test@#$%&*');
      });

      expect(result.current.searchQuery).toBe('test@#$%&*');
    });

    test('連続して検索クエリを設定できること', () => {
      const { result } = renderUseFilesSearchParams();

      act(() => {
        result.current.setSearchQuery('query1');
      });

      act(() => {
        result.current.setSearchQuery('query2');
      });

      expect(result.current.searchQuery).toBe('query2');
    });
  });

  describe('getPage: ページ番号の取得', () => {
    test('ページ番号が存在する場合、数値が返されること', () => {
      const { result } = renderUseFilesSearchParams({
        [QUERY_PARAMS.PAGE]: '5',
      });

      expect(result.current.page).toBe(5);
    });

    test('ページ番号が存在しない場合、undefinedが返されること', () => {
      const { result } = renderUseFilesSearchParams();

      expect(result.current.page).toBeUndefined();
    });

    test('ページ番号が文字列"0"の場合、0が返されること', () => {
      const { result } = renderUseFilesSearchParams({
        [QUERY_PARAMS.PAGE]: '0',
      });

      expect(result.current.page).toBe(0);
    });

    test('ページ番号が文字列"1"の場合、1が返されること', () => {
      const { result } = renderUseFilesSearchParams({
        [QUERY_PARAMS.PAGE]: '1',
      });

      expect(result.current.page).toBe(1);
    });

    test('ページ番号に大きな数値が設定されている場合、正しく変換されること', () => {
      const { result } = renderUseFilesSearchParams({
        [QUERY_PARAMS.PAGE]: '9999',
      });

      expect(result.current.page).toBe(9999);
    });

    test('ページ番号に不正な値が設定されている場合、NaNが返されること', () => {
      const { result } = renderUseFilesSearchParams({
        [QUERY_PARAMS.PAGE]: 'invalid',
      });

      expect(result.current.page).toBeNaN();
    });

    test('ページ番号に負の数が設定されている場合、負の数が返されること', () => {
      const { result } = renderUseFilesSearchParams({
        [QUERY_PARAMS.PAGE]: '-1',
      });

      expect(result.current.page).toBe(-1);
    });
  });

  describe('getPageSize: ページサイズの取得', () => {
    test('ページサイズが存在する場合、数値が返されること', () => {
      const { result } = renderUseFilesSearchParams({
        [QUERY_PARAMS.PAGE_SIZE]: '20',
      });

      expect(result.current.pageSize).toBe(20);
    });

    test('ページサイズが存在しない場合、undefinedが返されること', () => {
      const { result } = renderUseFilesSearchParams();

      expect(result.current.pageSize).toBeUndefined();
    });

    test('ページサイズが文字列"10"の場合、10が返されること', () => {
      const { result } = renderUseFilesSearchParams({
        [QUERY_PARAMS.PAGE_SIZE]: '10',
      });

      expect(result.current.pageSize).toBe(10);
    });

    test('ページサイズが文字列"50"の場合、50が返されること', () => {
      const { result } = renderUseFilesSearchParams({
        [QUERY_PARAMS.PAGE_SIZE]: '50',
      });

      expect(result.current.pageSize).toBe(50);
    });

    test('ページサイズに大きな数値が設定されている場合、正しく変換されること', () => {
      const { result } = renderUseFilesSearchParams({
        [QUERY_PARAMS.PAGE_SIZE]: '1000',
      });

      expect(result.current.pageSize).toBe(1000);
    });

    test('ページサイズに不正な値が設定されている場合、NaNが返されること', () => {
      const { result } = renderUseFilesSearchParams({
        [QUERY_PARAMS.PAGE_SIZE]: 'invalid',
      });

      expect(result.current.pageSize).toBeNaN();
    });

    test('ページサイズに負の数が設定されている場合、負の数が返されること', () => {
      const { result } = renderUseFilesSearchParams({
        [QUERY_PARAMS.PAGE_SIZE]: '-10',
      });

      expect(result.current.pageSize).toBe(-10);
    });
  });

  describe('複合的な動作', () => {
    test('複数のクエリパラメータが同時に存在する場合、すべて正しく取得できること', () => {
      const { result } = renderUseFilesSearchParams({
        [QUERY_PARAMS.SEARCH]: 'test query',
        [QUERY_PARAMS.PAGE]: '3',
        [QUERY_PARAMS.PAGE_SIZE]: '25',
      });

      expect(result.current.searchQuery).toBe('test query');
      expect(result.current.page).toBe(3);
      expect(result.current.pageSize).toBe(25);
    });

    test('検索クエリを変更しても他のパラメータは影響を受けないこと（ページ以外）', () => {
      const { result } = renderUseFilesSearchParams({
        [QUERY_PARAMS.PAGE_SIZE]: '30',
      });

      act(() => {
        result.current.setSearchQuery('new search');
      });

      expect(result.current.searchQuery).toBe('new search');
      expect(result.current.pageSize).toBe(30);
    });
  });

  describe('QUERY_PARAMS定数の使用確認', () => {
    test('QUERY_PARAMS.SEARCHが正しく使用されていること', () => {
      const { result } = renderUseFilesSearchParams({
        [QUERY_PARAMS.SEARCH]: 'test',
      });

      expect(result.current.searchQuery).toBe('test');
    });

    test('QUERY_PARAMS.PAGEが正しく使用されていること', () => {
      const { result } = renderUseFilesSearchParams({
        [QUERY_PARAMS.PAGE]: '2',
      });

      expect(result.current.page).toBe(2);
    });

    test('QUERY_PARAMS.PAGE_SIZEが正しく使用されていること', () => {
      const { result } = renderUseFilesSearchParams({
        [QUERY_PARAMS.PAGE_SIZE]: '15',
      });

      expect(result.current.pageSize).toBe(15);
    });
  });

  describe('エッジケース', () => {
    test('URLSearchParamsが空の状態でsetSearchQueryを呼び出しても動作すること', () => {
      const { result } = renderUseFilesSearchParams();

      act(() => {
        result.current.setSearchQuery('first query');
      });

      expect(result.current.searchQuery).toBe('first query');
    });

    test('同じ検索クエリを連続して設定しても正しく動作すること', () => {
      const { result } = renderUseFilesSearchParams();

      act(() => {
        result.current.setSearchQuery('same query');
      });

      act(() => {
        result.current.setSearchQuery('same query');
      });

      expect(result.current.searchQuery).toBe('same query');
    });

    test('空白文字のみの検索クエリを設定できること', () => {
      const { result } = renderUseFilesSearchParams();

      act(() => {
        result.current.setSearchQuery('   ');
      });

      expect(result.current.searchQuery).toBe('   ');
    });

    test('ページ番号とページサイズのみが設定されている場合も正しく動作すること', () => {
      const { result } = renderUseFilesSearchParams({
        [QUERY_PARAMS.PAGE]: '2',
        [QUERY_PARAMS.PAGE_SIZE]: '50',
      });

      expect(result.current.searchQuery).toBeUndefined();
      expect(result.current.page).toBe(2);
      expect(result.current.pageSize).toBe(50);
    });
  });
});
