import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
} from '../authToken';

describe('authToken', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('setAccessToken', () => {
    test('remember=true の場合は localStorage に保存される', () => {
      setAccessToken('token-a', true);

      expect(localStorage.getItem('accessToken')).toBe('token-a');
      expect(sessionStorage.getItem('accessToken')).toBeNull();
    });

    test('remember=false の場合は sessionStorage に保存される', () => {
      setAccessToken('token-b', false);

      expect(sessionStorage.getItem('accessToken')).toBe('token-b');
      expect(localStorage.getItem('accessToken')).toBeNull();
    });

    test('保存先を切り替えても二重保存されない', () => {
      setAccessToken('token-a', true);
      setAccessToken('token-b', false);

      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(sessionStorage.getItem('accessToken')).toBe('token-b');
    });
  });

  describe('getAccessToken', () => {
    test('localStorage / sessionStorage いずれからも取得できる', () => {
      setAccessToken('token-a', true);
      expect(getAccessToken()).toBe('token-a');

      setAccessToken('token-b', false);
      expect(getAccessToken()).toBe('token-b');
    });

    test('未保存の場合は null を返す', () => {
      expect(getAccessToken()).toBeNull();
    });
  });

  describe('clearAccessToken', () => {
    test('両方のストレージから削除される', () => {
      setAccessToken('token-a', true);
      clearAccessToken();
      expect(getAccessToken()).toBeNull();

      setAccessToken('token-b', false);
      clearAccessToken();
      expect(getAccessToken()).toBeNull();
    });
  });
});
