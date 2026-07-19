import {
  HTTP_STATUS_CLIENT_ERROR,
  HTTP_STATUS_SERVER_ERROR,
} from '@/domain/constants';
import { NetworkException, WebApiException } from '@/domain/errors';

export const serviceUnavailableError = new WebApiException(
  HTTP_STATUS_SERVER_ERROR.SERVICE_UNAVAILABLE,
  'SERVICE_UNAVAILABLE'
);

export const badRequestError = new WebApiException(
  HTTP_STATUS_CLIENT_ERROR.BAD_REQUEST,
  'BAD_REQUEST'
);

export const unauthorizedError = new WebApiException(
  HTTP_STATUS_CLIENT_ERROR.UNAUTHORIZED,
  'UNAUTHORIZED'
);

export const forbiddenError = new WebApiException(
  HTTP_STATUS_CLIENT_ERROR.FORBIDDEN,
  'FORBIDDEN'
);

export const networkError = new NetworkException('Network error');
