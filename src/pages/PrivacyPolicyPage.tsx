import { Link } from 'react-router-dom';

import { ScreenShell } from '@/components/common';
import { ROUTES } from '@/constants/routes';
import { useTranslation } from '@/lib/i18n';

/** One rendered policy section. Mirrors the shape stored in the privacy locale. */
interface PrivacySection {
  heading: string;
  body?: string;
  items?: string[];
}

/**
 * Public, unauthenticated privacy policy page (`/privacy`). Content lives in the
 * `privacy` i18n namespace (AR + EN) and is rendered data-driven, so the page
 * stays generic. Shown as a DRAFT pending legal review.
 */
export default function PrivacyPolicyPage(): JSX.Element {
  const { t } = useTranslation('privacy');
  const sections = t('sections', { returnObjects: true }) as unknown as PrivacySection[];

  return (
    <ScreenShell eyebrow={t('eyebrow')} title={t('title')}>
      <p className="font-sans text-[12px] text-obsidian/50">{t('lastUpdated')}</p>
      <p className="mt-3 font-sans text-[14px] leading-[1.65] text-obsidian/80">
        {t('intro')}
      </p>

      <div className="mt-8 space-y-7">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-display text-[18px] font-bold text-obsidian">
              {section.heading}
            </h2>
            {section.body ? (
              <p className="mt-2 font-sans text-[14px] leading-[1.65] text-obsidian/80">
                {section.body}
              </p>
            ) : null}
            {section.items ? (
              <ul className="mt-2 list-disc space-y-1.5 ps-5 font-sans text-[14px] leading-[1.6] text-obsidian/80">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>

      <div className="mt-10">
        <Link
          to={ROUTES.ROOT}
          className="font-sans text-[14px] font-bold text-obsidian underline underline-offset-2"
        >
          {t('back')}
        </Link>
      </div>
    </ScreenShell>
  );
}
