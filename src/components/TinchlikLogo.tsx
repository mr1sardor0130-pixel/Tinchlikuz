const LOGO_SRC = '/assets/tinchlik-logo-hd.jpg';

export function TinchlikLogo({ className = 'w-14 h-14' }: { className?: string }) {
  return (
    <div
      className={`rounded-full overflow-hidden bg-white border border-stone-200/90 flex items-center justify-center shrink-0 ${className}`}
    >
      <img
        src={LOGO_SRC}
        alt="Tinchlik Oilaviy Restorani logotipi"
        className="w-full h-full object-cover object-center scale-[1.03]"
      />
    </div>
  );
}
