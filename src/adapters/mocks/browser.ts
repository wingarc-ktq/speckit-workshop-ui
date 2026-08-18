import { setupWorker } from 'msw/browser';

import { filesHandlers, getCustomAuthAPIMock } from './handlers';

// MSWワーカーを設定
export const worker = setupWorker(...getCustomAuthAPIMock(), ...filesHandlers);

// 開発環境でのみMSWを開始
export async function enableMocking() {
  if (import.meta.env.MODE !== 'development') {
    return;
  }

  try {
    await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
    });
  } catch (error) {
    console.error('🔶 MSW初期化エラー:', error);
  }
}
