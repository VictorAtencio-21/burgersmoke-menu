import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-400 text-sm py-4">
      <div className="flex flex-col items-center gap-1 text-center sm:flex-row sm:justify-center sm:gap-2">
        <span className="flex items-center gap-1">
          <span>Powered by</span>
          <Link
            href="https://www.linkedin.com/in/victor-atencio/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white"
          >
            Victor Atencio
          </Link>
        </span>
        <span className="hidden sm:inline">|</span>
        <a
          href="mailto:atenciomvictor@gmail.com"
          className="underline hover:text-white"
        >
          atenciomvictor@gmail.com
        </a>
        <span className="hidden sm:inline">|</span>
        <Link
          href="https://victoratencio.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-white"
        >
          victoratencio.vercel.app
        </Link>
      </div>
    </footer>
  );
}
