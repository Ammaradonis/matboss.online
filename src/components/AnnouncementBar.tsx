export default function AnnouncementBar() {
  return (
    <div className="announcement-bar sticky top-0 z-50 px-3 py-2.5 text-center shadow-[0_1px_0_rgba(255,255,255,0.06)] sm:px-4">
      <p className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11px] font-semibold leading-relaxed tracking-wide text-white sm:text-sm">
        <span className="inline-block animate-pulse">&#9888;</span>
        San Diego dojos are losing 3–5 students every month to no-shows —{' '}
        <a
          href="#booking"
          className="inline-flex items-center underline underline-offset-2 font-bold transition-colors hover:text-dojo-gold"
        >
          Book your Leakage Diagnosis Call
        </a>{' '}
        before slots disappear.
      </p>
    </div>
  );
}
