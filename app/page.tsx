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
        <section className="w-full md:w-[65%] p-8">
          Main
        </section>
        <aside className="w-full md:w-[35%] p-8 border-t border-white/10 md:border-t-0 md:border-l">
          Sidebar
        </aside>
      </div>
    </div>
  );
}
