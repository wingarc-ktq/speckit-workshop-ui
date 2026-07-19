import { mockUserResponse } from '@/__fixtures__/auth';
import { customInstance } from '@/adapters/axios';
import { AuthException, WebApiException } from '@/domain/errors';

import { getCurrentSession } from '../getCurrentSession';

vi.mock('@/adapters/axios');
const mocked = vi.mocked(customInstance);

describe('getCurrentSession', () => {
  describe('正常系', () => {
    test.concurrent(
      '正常なレスポンスの場合、適切にAuthSessionに変換される',
      async () => {
        mocked.mockResolvedValue(mockUserResponse);

        const r = await getCurrentSession();

        expect(mocked).toHaveBeenCalledWith({
          method: 'GET',
          url: '/auth/me',
        });
        expect(r).toEqual({
          user: {
            id: mockUserResponse.user.id,
            email: mockUserResponse.user.email,
            name: mockUserResponse.user.name,
          },
        });
      }
    );
  });
  describe('準正常系', () => {
    test.concurrent('401エラーでAuthExceptionがthrowされる', async () => {
      const unauthorizedError = new WebApiException(401, 'Unauthorized', {
        message: 'Session expired',
      });
      mocked.mockRejectedValue(unauthorizedError);

      await expect(getCurrentSession()).rejects.toThrow(AuthException);
    });
  });
});
