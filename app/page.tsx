import { HugeiconsIcon } from "@hugeicons/react";
import {
  GithubIcon,
  Linkedin01Icon,
  Mail01Icon,
} from "@hugeicons/core-free-icons";

const socials = [
  { label: "GitHub", href: "https://github.com/Chukwuemekaeze", icon: GithubIcon },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/chukwuemekaaeze/", icon: Linkedin01Icon },
  { label: "Email", href: "mailto:chukwuemekaaeze@gmail.com", icon: Mail01Icon },
];

export default function Home() {
  return (
    <div className="flex flex-col flex-1 w-full font-sans">
      <header className="w-full px-8 py-8 border-b border-white/10">
        <nav className="flex justify-center gap-8">
          <span>Home</span>
          <span>Projects</span>
          <span>Resume</span>
        </nav>
      </header>
      <div className="flex flex-col flex-1 md:flex-row">
        <section className="relative flex w-full items-center overflow-hidden px-8 py-16 md:w-[65%] md:px-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              maskImage:
                "radial-gradient(ellipse at 30% 50%, black 30%, transparent 75%)",
            }}
          />
          <div className="relative flex flex-col">
            <div className="mb-8 h-px w-12 bg-[#dab134]" />
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-zinc-400 md:text-base">
              Chukwuemeka Eze
            </p>
            <h1 className="mt-4 text-6xl font-bold leading-[0.95] tracking-tight text-[#dab134] md:text-7xl lg:text-8xl">
              Software
              <br />
              Engineer
            </h1>
            <div className="mt-12 flex gap-4">
              {socials.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  {...(href.startsWith("http") && {
                    target: "_blank",
                    rel: "noopener noreferrer",
                  })}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-zinc-300 transition-colors hover:border-[#dab134] hover:text-[#dab134]"
                >
                  <HugeiconsIcon icon={icon} size={20} />
                </a>
              ))}
            </div>
          </div>
        </section>
        <aside className="w-full md:w-[35%] p-8 border-t border-white/10 md:border-t-0 md:border-l">
          Sidebar
        </aside>
      </div>
    </div>
  );
}
