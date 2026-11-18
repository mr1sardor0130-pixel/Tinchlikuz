const LOGO_SRC =
  '/assets/aistudio/772663878_17962044918168521_5018536621947110371_n_8365f95c.jpg';

export function TinchlikLogo({ className = 'w-14 h-14' }: { className?: string }) {
  return (
    <img
      src={LOGO_SRC}
      alt="Tinchlik Oilaviy Restorani logotipi"
      className={`rounded-full object-cover border border-stone-200/90 bg-white shrink-0 ${className}`}
    />
  );
}
