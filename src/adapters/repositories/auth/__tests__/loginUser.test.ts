import { mockLoginCredentials, mockLoginResponse } from '@/__fixtures__/auth';
import { getAccessToken } from '@/adapters/authToken';
import { customInstance } from '@/adapters/axios';
import { loginUser } from '@/adapters/repositories/auth/loginUser';
import { AuthException, WebApiException } from '@/domain/errors';

vi.mock('@/adapters/axios');
const mocked = vi.mocked(customInstance);

// トークン保存は実ストレージで検証する（logoutUser.test と同方針）。
// 実ストレージを触るため各テストは逐次実行し、beforeEach で初期化する。
describe('loginUser', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('正常系', () => {
    test('正常なレスポンスの場合、適切にLoginResultに変換される', async () => {
      mocked.mockResolvedValue(mockLoginResponse);

      const result = await loginUser(mockLoginCredentials);

      expect(mocked).toHaveBeenCalledWith({
        method: 'POST',
        url: '/auth/login',
        headers: { 'Content-Type': 'application/json' },
        data: {
          email: mockLoginCredentials.email,
          password: mockLoginCredentials.password,
        },
      });

      expect(result.session.user).toEqual({
        id: mockLoginResponse.user.id,
        email: mockLoginResponse.user.email,
        name: mockLoginResponse.user.name,
      });
      expect(result.session.sessionInfo?.expiresAt).toBeInstanceOf(Date);
    });

    test('expiresIn からアクセストークンの有効期限が算出される', async () => {
      mocked.mockResolvedValue({ ...mockLoginResponse, expiresIn: 3600 });

      const before = Date.now();
      const result = await loginUser(mockLoginCredentials);
      const after = Date.now();

      const expiresAt = result.session.sessionInfo!.expiresAt.getTime();
      expect(expiresAt).toBeGreaterThanOrEqual(before + 3600 * 1000);
      expect(expiresAt).toBeLessThanOrEqual(after + 3600 * 1000);
    });
  });

  describe('アクセストークンの保存', () => {
    test('rememberMe=true の場合、localStorage に保存される', async () => {
      mocked.mockResolvedValue(mockLoginResponse);

      await loginUser({ ...mockLoginCredentials, rememberMe: true });

      expect(localStorage.getItem('accessToken')).toBe(
        mockLoginResponse.accessToken
      );
      expect(sessionStorage.getItem('accessToken')).toBeNull();
    });

    test('rememberMe=false の場合、sessionStorage に保存される', async () => {
      mocked.mockResolvedValue(mockLoginResponse);

      await loginUser({ ...mockLoginCredentials, rememberMe: false });

      expect(sessionStorage.getItem('accessToken')).toBe(
        mockLoginResponse.accessToken
      );
      expect(localStorage.getItem('accessToken')).toBeNull();
    });

    test('rememberMe 未指定の場合、sessionStorage に保存される', async () => {
      mocked.mockResolvedValue(mockLoginResponse);

      await loginUser({
        email: mockLoginCredentials.email,
        password: mockLoginCredentials.password,
      });

      expect(sessionStorage.getItem('accessToken')).toBe(
        mockLoginResponse.accessToken
      );
      expect(localStorage.getItem('accessToken')).toBeNull();
    });
  });

  describe('異常系', () => {
    test('401エラーでAuthExceptionがthrowされ、トークンは保存されない', async () => {
      const unauthorizedError = new WebApiException(401, 'Unauthorized', {
        message: 'Invalid credentials',
      });
      mocked.mockRejectedValue(unauthorizedError);

      await expect(loginUser(mockLoginCredentials)).rejects.toThrow(
        AuthException
      );

      expect(getAccessToken()).toBeNull();
    });
  });
});
