import { useTranslation } from 'react-i18next';

import { ScreenShell } from '@/components/common';

export interface PlaceholderPageProps {
  titleKey: string;
}

/**
 * Stub used for the Chunk 5b screens (stamp-success, lockout, rewards,
 * profile, etc.) while they're still pending implementation.
 */
export default function PlaceholderPage({
  titleKey,
}: PlaceholderPageProps): JSX.Element {
  const { t } = useTranslation('common');
  return (
    <ScreenShell eyebrow={t('status.comingSoon')} title={titleKey.toUpperCase()}>
      <p className="font-sans text-[14px] text-obsidian/60">
        {t('status.comingSoon')}
      </p>
    </ScreenShell>
  );
}
