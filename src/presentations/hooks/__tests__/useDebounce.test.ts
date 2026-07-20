import { renderHook, act } from '@testing-library/react';

import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  describe('初期状態', () => {
    test.concurrent('初期値が正しく返されること', () => {
      const { result } = renderHook(() => useDebounce('initial', 300));

      expect(result.current).toBe('initial');
    });

    test.concurrent('数値型の初期値が正しく返されること', () => {
      const { result } = renderHook(() => useDebounce(42, 300));

      expect(result.current).toBe(42);
    });

    test.concurrent('オブジェクト型の初期値が正しく返されること', () => {
      const initialValue = { id: 1, name: 'test' };
      const { result } = renderHook(() => useDebounce(initialValue, 300));

      expect(result.current).toEqual(initialValue);
    });
  });

  describe('デバウンス動作', () => {
    test('指定された遅延時間後に値が更新されること', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        {
          initialProps: { value: 'initial', delay: 300 },
        }
      );

      expect(result.current).toBe('initial');

      // 値を変更
      rerender({ value: 'updated', delay: 300 });

      // デバウンス期間中は値が更新されない
      expect(result.current).toBe('initial');

      // 指定された遅延時間を進める
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // 値が更新される
      expect(result.current).toBe('updated');
    });

    test('遅延時間内に値が変更された場合、タイマーがリセットされること', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        {
          initialProps: { value: 'initial', delay: 500 },
        }
      );

      expect(result.current).toBe('initial');

      // 1回目の値変更
      rerender({ value: 'update1', delay: 500 });
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // まだ遅延時間が経過していないので値は更新されない
      expect(result.current).toBe('initial');

      // 2回目の値変更（タイマーリセット）
      rerender({ value: 'update2', delay: 500 });
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // タイマーがリセットされたため、まだ値は更新されない
      expect(result.current).toBe('initial');

      // 残りの200msを進める
      act(() => {
        vi.advanceTimersByTime(200);
      });

      // 最後の値に更新される
      expect(result.current).toBe('update2');
    });

    test('複数回の値変更でも最後の値が正しく反映されること', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        {
          initialProps: { value: 'initial', delay: 300 },
        }
      );

      // 短時間に複数回値を変更
      rerender({ value: 'update1', delay: 300 });
      act(() => {
        vi.advanceTimersByTime(100);
      });

      rerender({ value: 'update2', delay: 300 });
      act(() => {
        vi.advanceTimersByTime(100);
      });

      rerender({ value: 'update3', delay: 300 });
      act(() => {
        vi.advanceTimersByTime(100);
      });

      // まだ最後の変更から300ms経過していない
      expect(result.current).toBe('initial');

      // 残りの200msを進める
      act(() => {
        vi.advanceTimersByTime(200);
      });

      // 最後の値に更新される
      expect(result.current).toBe('update3');
    });
  });

  describe('遅延時間の変更', () => {
    test('遅延時間を変更した場合、新しい遅延時間が適用されること', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        {
          initialProps: { value: 'initial', delay: 500 },
        }
      );

      // 値と遅延時間を変更
      rerender({ value: 'updated', delay: 200 });

      // 新しい遅延時間（200ms）を進める
      act(() => {
        vi.advanceTimersByTime(200);
      });

      // 値が更新される
      expect(result.current).toBe('updated');
    });
  });

  describe('クリーンアップ', () => {
    test('アンマウント時にタイマーがクリアされること', () => {
      const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');

      const { rerender, unmount } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        {
          initialProps: { value: 'initial', delay: 300 },
        }
      );

      // 値を変更
      rerender({ value: 'updated', delay: 300 });

      // アンマウント
      unmount();

      // clearTimeoutが呼ばれたことを確認
      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    test('値変更時に前のタイマーがクリアされること', () => {
      const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');

      const { rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        {
          initialProps: { value: 'initial', delay: 300 },
        }
      );

      // clearTimeoutの呼び出し回数をリセット
      clearTimeoutSpy.mockClear();

      // 1回目の値変更
      rerender({ value: 'update1', delay: 300 });

      // 2回目の値変更（前のタイマーがクリアされる）
      rerender({ value: 'update2', delay: 300 });

      // 前のタイマーがクリアされたことを確認（少なくとも1回）
      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });

  describe('エッジケース', () => {
    test('遅延時間が0の場合でも動作すること', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        {
          initialProps: { value: 'initial', delay: 0 },
        }
      );

      rerender({ value: 'updated', delay: 0 });

      // 遅延時間0でも即座には更新されない（次のティック）
      expect(result.current).toBe('initial');

      // タイマーを進める
      act(() => {
        vi.advanceTimersByTime(0);
      });

      // 値が更新される
      expect(result.current).toBe('updated');
    });

    test('空文字列の値でも正しく動作すること', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        {
          initialProps: { value: 'initial', delay: 300 },
        }
      );

      rerender({ value: '', delay: 300 });
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current).toBe('');
    });

    test('nullやundefinedの値でも正しく動作すること', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        {
          initialProps: { value: 'initial' as string | null, delay: 300 },
        }
      );

      rerender({ value: null, delay: 300 });
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current).toBe(null);
    });
  });

  describe('実用例: 検索機能での使用', () => {
    test('検索キーワードのデバウンスが正しく動作すること', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        {
          initialProps: { value: '', delay: 300 },
        }
      );

      // ユーザーが「React」と入力する様子をシミュレート
      rerender({ value: 'R', delay: 300 });
      act(() => {
        vi.advanceTimersByTime(100);
      });

      rerender({ value: 'Re', delay: 300 });
      act(() => {
        vi.advanceTimersByTime(100);
      });

      rerender({ value: 'Rea', delay: 300 });
      act(() => {
        vi.advanceTimersByTime(100);
      });

      rerender({ value: 'Reac', delay: 300 });
      act(() => {
        vi.advanceTimersByTime(100);
      });

      rerender({ value: 'React', delay: 300 });

      // まだ入力中なので検索は発火しない
      expect(result.current).toBe('');

      // 入力が止まって300ms経過
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // 最終的な検索キーワードが反映される
      expect(result.current).toBe('React');
    });
  });
});
