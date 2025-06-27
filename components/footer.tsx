import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-400 text-sm py-4 text-center">
      <span>Powered by </span>
      <Link href="https://www.linkedin.com/in/victor-atencio/" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
        Victor Atencio
      </Link>
      <span className="mx-1">|</span>
      <a href="mailto:atenciomvictor@gmail.com" className="underline hover:text-white">
        atenciomvictor@gmail.com
      </a>
    </footer>
  );
}
