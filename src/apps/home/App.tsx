"use client";
import { usePathname } from "next/navigation";
import "./App.css";

const apps = [
  {
    title: "Diatonic Chord Scales",
    description:
      "Explore the chords that belong to every major and minor scale.",
    href: "/diatonic-chord-scales/",
    visual: "scales",
  },
  {
    title: "Kaprekar Sequencer",
    description: "Turn number patterns into evolving musical sequences.",
    href: "/kaprekar-sequencer/",
    visual: "sequence",
  },
  {
    title: "Sequence Stutterer",
    description:
      "Slice, repeat, and reshape MIDI phrases into rhythmic textures.",
    href: "/sequence-stutterer/",
    visual: "stutter",
  },
  {
    title: "Chord Differentiator",
    description:
      "Compare chord voicings and discover the notes that set them apart.",
    href: "/chord-differentiator/",
    visual: "chords",
  },
  {
    title: "Melody Block Voicing",
    description:
      "Harmonize a melody in four-way close block voicing, sax soli style.",
    href: "/melody-block-voicing/",
    visual: "chords",
  },
];

function Navigation() {
  return (
    <nav className="site-nav" aria-label="Main navigation">
      <a className="site-brand" href="/">
        Mini Music Apps
      </a>
      <a className="site-nav-link" href="/about/">
        About
      </a>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      Created with <span aria-label="love">❤️</span> by{" "}
      <a href="https://rustybass.com" target="_blank" rel="noreferrer">
        Russell Snyder
      </a>
    </footer>
  );
}

function AboutPage() {
  return (
    <>
      <Navigation />
      <main className="about-page">
        <p className="eyebrow">About Mini Music Apps</p>
        <h1 className="leading-10">Tools for modern composition</h1>
        <p className="pb-4">
          Mini Music Apps is a collection of focused tools for exploring music
          theory, number patterns, rhythm, and harmonic ideas.
        </p>
        <p className="pb-4">
          This project started as a consolidation of smaller apps built by
          <a href="https://rustybass.com" target="_blank" rel="noreferrer">
            Russell Snyder
          </a>{" "}
          for his personal projects. It brings those experiments together in one
          place for musicians, composers, and curious minds.
        </p>
      </main>
      <Footer />
    </>
  );
}

function App() {
  const pathname = usePathname();
  if (pathname === "/about/" || pathname === "/about") {
    return <AboutPage />;
  }

  return (
    <>
      <Navigation />
      <main>
        <section className="hero">
          <h1 className="mb-8">Mini Music Apps</h1>
          <p>
            A collection of tools for exploring music theory and composition
          </p>
        </section>
        <section className="tool-grid" aria-label="Composer tools">
          {apps.map((app) => (
            <a className="tool-card" key={app.href} href={app.href}>
              <div
                className={`tool-card-visual ${app.visual}`}
                aria-hidden="true"
              >
                <span />
                <span />
                <span />
              </div>
              <div className="tool-card-content">
                <h2>{app.title}</h2>
                <p>{app.description}</p>
                <span className="tool-card-link">
                  Open tool <span aria-hidden="true">-&gt;</span>
                </span>
              </div>
            </a>
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
}

export default App;
