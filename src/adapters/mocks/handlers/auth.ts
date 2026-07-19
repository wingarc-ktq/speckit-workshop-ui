import { http, HttpResponse, delay } from 'msw';

import {
  getLoginUserResponseMock,
  getGetCurrentUserResponseMock,
} from '@/adapters/generated/auth';
import {
  HTTP_STATUS_CLIENT_ERROR,
  HTTP_STATUS_SUCCESS,
} from '@/domain/constants';

// JWT 認証APIのモックハンドラーを返す関数
export const getCustomAuthAPIMock = () => {
  // ログイン: JSON ボディを検証し、成功時に JWT を返す
  const login = http.post('*/auth/login', async ({ request }) => {
    await delay(1000);

    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    // 特定の無効なパスワード（wrong_password等）の場合のみエラーを返す
    if (body.password === 'wrong_password') {
      return new HttpResponse(
        JSON.stringify({
          message: 'メールアドレスまたはパスワードが正しくありません',
          code: 'AUTH_FAILED',
        }),
        {
          status: HTTP_STATUS_CLIENT_ERROR.UNAUTHORIZED,
          headers: { 'content-type': 'application/json' },
        }
      );
    }

    return new HttpResponse(JSON.stringify(getLoginUserResponseMock()), {
      status: HTTP_STATUS_SUCCESS.OK,
      headers: { 'content-type': 'application/json' },
    });
  });

  // 認証中ユーザー取得: Authorization ヘッダー（Bearer）が無ければ 401
  const me = http.get('*/auth/me', async ({ request }) => {
    await delay(1000);

    const authHeader = request.headers.get('Authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return new HttpResponse(
        JSON.stringify({ message: '未認証です', code: 'UNAUTHORIZED' }),
        {
          status: HTTP_STATUS_CLIENT_ERROR.UNAUTHORIZED,
          headers: { 'content-type': 'application/json' },
        }
      );
    }

    return new HttpResponse(JSON.stringify(getGetCurrentUserResponseMock()), {
      status: HTTP_STATUS_SUCCESS.OK,
      headers: { 'content-type': 'application/json' },
    });
  });

  return [login, me];
};
