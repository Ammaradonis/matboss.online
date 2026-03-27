export default function AnnouncementBar() {
  return (
    <div className="announcement-bar sticky top-0 z-50 py-2 px-4 text-center">
      <p className="text-xs md:text-sm font-semibold tracking-wide text-white">
        <span className="inline-block animate-pulse mr-2">&#9888;</span>
        San Diego dojos are losing 3–5 students every month to no-shows —{' '}
        <a href="#booking" className="underline underline-offset-2 font-bold hover:text-dojo-gold transition-colors">
          Book your Leakage Diagnosis Call
        </a>{' '}
        before slots disappear.
      </p>
    </div>
  );
}
