export default function PricingAnnouncementBar() {
  return (
    <div className="announcement-bar sticky top-0 z-50 py-2 px-4 text-center">
      <p className="text-xs md:text-sm font-semibold tracking-wide text-white">
        <span className="inline-block animate-pulse mr-2">&#128680;</span>
        PRICING DECLASSIFIED — Limited founding-rate slots for San Diego academies —{' '}
        <a
          href="#checkout"
          className="underline underline-offset-2 font-bold hover:text-dojo-gold transition-colors"
        >
          Lock in your rate now
        </a>
      </p>
    </div>
  );
}
