import { PlugsIcon } from '@phosphor-icons/react';
import { useCommonTranslation } from '@/i18n/common';
import { EmptyState } from './EmptyState';

export function NoContextState() {
  const t = useCommonTranslation();
  return (
    <EmptyState
      icon={<PlugsIcon size={28} weight="duotone" />}
      title={t.noContext.title}
      description={t.noContext.description}
    />
  );
}
