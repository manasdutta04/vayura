import en from './locales/en.json';
import hi from './locales/hi.json';
import ta from './locales/ta.json';
import mr from './locales/mr.json';
import bn from './locales/bn.json';
import gn from './locales/gn.json';
import te from './locales/te.json';

export type Locale =
  | 'en'
  | 'hi'
  | 'ta'
  | 'mr'
  | 'bn'
  | 'gn'
  | 'te';

export const defaultLocale: Locale = 'en';

export const translations = {
  en,
  hi,
  ta,
  mr,
  bn,
  gn,
  te,
};