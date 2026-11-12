import { createTranslationHook } from '@/i18n';
import { appointmentsEn } from './en';
import { appointmentsEs } from './es';

export const useTranslation = createTranslationHook({ es: appointmentsEs, en: appointmentsEn });
