import { createTranslationHook } from '@/i18n';
import { commonEn } from './en';
import { commonEs } from './es';

export const useCommonTranslation = createTranslationHook({ es: commonEs, en: commonEn });
