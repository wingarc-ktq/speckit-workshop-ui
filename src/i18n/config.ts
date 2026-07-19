import i18n from 'i18next';
import languageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import { en } from './locales/en';
import { ja } from './locales/ja';

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    debug: import.meta.env.DEV,
    resources: {
      cs: {
        translation: en,
      },
      de: {
        translation: en,
      },
      el: {
        translation: en,
      },
      en: {
        translation: en,
      },
      'en-US': {
        translation: en,
      },
      es: {
        translation: en,
      },
      fr: {
        translation: en,
      },
      hi: {
        translation: en,
      },
      id: {
        translation: en,
      },
      it: {
        translation: en,
      },
      ja: {
        translation: ja,
      },
      ko: {
        translation: en,
      },
      ms: {
        translation: en,
      },
      my: {
        translation: en,
      },
      nl: {
        translation: en,
      },
      pl: {
        translation: en,
      },
      pt: {
        translation: en,
      },
      ro: {
        translation: en,
      },
      ru: {
        translation: en,
      },
      ta: {
        translation: en,
      },
      th: {
        translation: en,
      },
      tr: {
        translation: en,
      },
      vi: {
        translation: en,
      },
      zh: {
        translation: en,
      },
      'zh-CN': {
        translation: en,
      },
      'zh-TW': {
        translation: en,
      },
    },
    fallbackLng: 'en',
    supportedLngs: [
      'cs',
      'de',
      'el',
      'en',
      'en-US',
      'es',
      'fr',
      'hi',
      'id',
      'it',
      'ja',
      'ko',
      'ms',
      'my',
      'nl',
      'pl',
      'pt',
      'ro',
      'ru',
      'ta',
      'th',
      'tr',
      'vi',
      'zh',
      'zh-CN',
      'zh-TW',
    ],
    detection: {
      order: ['navigator'],
      caches: [],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export { i18n };
