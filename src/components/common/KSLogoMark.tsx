/**
 * KSLogoMark — the ١٠ brand mark.
 * A yellow rounded square with the Arabic numeral ١٠ centred inside.
 * Used as a decorative hero element on loyalty cards, lockout screens, etc.
 * NOT the Kayan wordmark — use <KayanLogo> for the header.
 */

export interface KSLogoMarkProps {
  /** Side length in px (default 56) */
  size?: number;
  className?: string;
}

export default function KSLogoMark({
  size = 56,
  className = '',
}: KSLogoMarkProps): JSX.Element {
  const radius = Math.round(size * 0.25); // ~25% corner radius
  const fontSize = Math.round(size * 0.43);

  return (
    <span
      aria-hidden="true"
      className={['inline-flex shrink-0 items-center justify-center', className].join(
        ' ',
      )}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: '#FFD700',
      }}
    >
      <span
        style={{
          fontFamily: '"Noto Naskh Arabic", "SF Arabic", system-ui, sans-serif',
          fontSize,
          fontWeight: 700,
          lineHeight: 1,
          color: '#0D0D0D',
          userSelect: 'none',
          letterSpacing: 0,
        }}
      >
        ١٠
      </span>
    </span>
  );
}
