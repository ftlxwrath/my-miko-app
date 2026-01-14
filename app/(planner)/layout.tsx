import Link from "next/link";
import MikoCompanion from "./components/miko-companion";

export default function PlannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#fff6f6] text-[#2b1616]">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-20 -top-16 h-72 w-72 rounded-full bg-[#ffd6d6] opacity-70 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 bottom-0 h-72 w-72 rounded-full bg-[#ffe8e8] opacity-70 blur-3xl" />

        <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-6 pb-16 pt-10 md:px-10">
          <nav className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#7b4c4c]">
            <Link
              className="rounded-full border border-[#f1d6d6] bg-white px-4 py-2 text-[#7b4c4c] transition hover:text-[#2b1616]"
              href="/"
            >
              Home
            </Link>
            <Link
              className="rounded-full border border-[#f1d6d6] bg-white px-4 py-2 text-[#7b4c4c] transition hover:text-[#2b1616]"
              href="/trips"
            >
              Trips
            </Link>
            <Link
              className="rounded-full border border-[#f1d6d6] bg-white px-4 py-2 text-[#7b4c4c] transition hover:text-[#2b1616]"
              href="/schedule"
            >
              Schedule
            </Link>
            <Link
              className="rounded-full border border-[#f1d6d6] bg-white px-4 py-2 text-[#7b4c4c] transition hover:text-[#2b1616]"
              href="/todos"
            >
              To-dos
            </Link>
            <Link
              className="rounded-full border border-[#f1d6d6] bg-white px-4 py-2 text-[#7b4c4c] transition hover:text-[#2b1616]"
              href="/companion"
            >
              Miko
            </Link>
          </nav>

          {children}
        </div>

        <MikoCompanion />
      </div>
    </div>
  );
}
