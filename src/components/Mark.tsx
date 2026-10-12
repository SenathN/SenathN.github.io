// Monogram: a waterline with a small tip above and the larger mass below.
export default function Mark({ className = "w-[18px] h-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M1 8.5h18" strokeOpacity="0.55" />
      <path d="M6.5 8.5 9 4.5l1.8 1.6L13.5 8.5" />
      <path d="M4.5 8.5 9.5 18.5 15.5 8.5" strokeOpacity="0.7" />
    </svg>
  );
}
