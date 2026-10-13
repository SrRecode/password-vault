import { useEffect, useState } from 'react';

const LABELS = ['Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'];
const WIDTHS = ['w-[8%]', 'w-[28%]', 'w-[52%]', 'w-[76%]', 'w-full'];
const COLORS = ['bg-danger', 'bg-danger', 'bg-accent', 'bg-[#7ba05b]', 'bg-[#5a8a3c]'];

export function StrengthMeter({ password, showLabel = true }) {
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!password) {
      setScore(0);
      return;
    }
    let cancelled = false;
    import('zxcvbn').then(({ default: zxcvbn }) => {
      if (cancelled) return;
      setScore(zxcvbn(password).score);
    });
    return () => {
      cancelled = true;
    };
  }, [password]);

  if (!password) return null;

  return (
    <div className="mt-2 px-1">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
        <div
          className={`h-full rounded-full transition-all duration-300 ${COLORS[score]} ${WIDTHS[score]}`}
        />
      </div>
      {showLabel && (
        <p className="mt-1.5 text-[12px] text-soft">
          Strength: <span className="font-semibold text-ink">{LABELS[score]}</span>
        </p>
      )}
    </div>
  );
}
