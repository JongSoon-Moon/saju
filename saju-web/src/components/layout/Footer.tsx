export default function Footer() {
  return (
    <footer className="w-full mt-auto py-8 bg-[#f5f3ee] border-t border-outline-variant/10">
      <div className="flex flex-col md:flex-row justify-between items-center px-8 gap-4 max-w-7xl mx-auto">
        <span className="font-headline font-bold text-primary text-sm tracking-tight">
          Saju Archivist
        </span>
        <div className="flex gap-6">
          <a
            href="#"
            className="font-headline text-[11px] uppercase tracking-wider text-outline opacity-80 hover:opacity-100 hover:text-primary transition-opacity duration-200"
          >
            Disclaimer
          </a>
          <a
            href="#"
            className="font-headline text-[11px] uppercase tracking-wider text-outline opacity-80 hover:opacity-100 hover:text-primary transition-opacity duration-200"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="font-headline text-[11px] uppercase tracking-wider text-outline opacity-80 hover:opacity-100 hover:text-primary transition-opacity duration-200"
          >
            Contact
          </a>
        </div>
        <span className="font-headline text-[11px] uppercase tracking-wider text-outline">
          © 2024 Saju Archivist v2.1.0
        </span>
      </div>
    </footer>
  );
}
