import type { LoginResponse, UserResponse } from '@/adapters/generated/auth';
import type {
  AuthSession,
  LoginCredentials,
  LoginResult,
} from '@/domain/models/auth';

// 生成された API 型に対応するユーザー
const mockApiUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

// API レスポンス用のモックデータ（JWT ログイン）
export const mockLoginResponse: LoginResponse = {
  accessToken: 'test-access-token',
  tokenType: 'Bearer',
  expiresIn: 3600,
  user: mockApiUser,
};

// API レスポンス用のモックデータ（GET /auth/me）
export const mockUserResponse: UserResponse = {
  user: mockApiUser,
};

// ドメインモデル用のモックデータ
export const mockAuthSession: AuthSession = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
  },
};

// ログイン用のモックデータ
export const mockLoginCredentials: LoginCredentials = {
  email: 'test@example.com',
  password: 'password123',
  rememberMe: true,
};

export const mockLoginResult: LoginResult = {
  session: {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
    },
    sessionInfo: {
      expiresAt: new Date('2026-01-01T01:00:00Z'),
    },
  },
};
