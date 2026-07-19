import { getAccessToken, setAccessToken } from '@/adapters/authToken';

import { logoutUser } from '../logoutUser';

describe('logoutUser', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  test('localStorage に保存済みのアクセストークンが破棄される', async () => {
    setAccessToken('dummy-token', true);
    expect(getAccessToken()).toBe('dummy-token');

    await logoutUser();

    expect(getAccessToken()).toBeNull();
  });

  test('sessionStorage に保存済みのアクセストークンが破棄される', async () => {
    setAccessToken('dummy-token', false);
    expect(getAccessToken()).toBe('dummy-token');

    await logoutUser();

    expect(getAccessToken()).toBeNull();
  });

  test('トークンが存在しない状態でもエラーにならない', async () => {
    await expect(logoutUser()).resolves.toBeUndefined();
  });
});
