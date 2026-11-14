import { useState } from 'react';

interface StudentAvatarProps {
  name: string;
  avatarUrl?: string;
  sizeClass?: string;
}

export function StudentAvatar({
  name,
  avatarUrl,
  sizeClass = 'w-12 h-12 text-sm',
}: StudentAvatarProps) {
  const [failed, setFailed] = useState(false);

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  if (!avatarUrl || failed) {
    return (
      <div
        className={`${sizeClass} rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-display font-semibold flex items-center justify-center shrink-0 select-none`}
        aria-label={name}
      >
        {initials || 'ST'}
      </div>
    );
  }

  return (
    <img
      src={avatarUrl}
      alt={name}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`${sizeClass} rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100`}
    />
  );
}
