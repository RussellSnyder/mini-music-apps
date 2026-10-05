"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./App.css";
import SystemWrapper from "./components/system-wrapper";

function Home() {
  return (
    <main className="page">
      <SystemWrapper />
    </main>
  );
}

function About() {
  return (
    <main className="page">
      <p className="intro">
        Tool for generating tonal systems in different keys
      </p>
    </main>
  );
}

function NotFound() {
  return (
    <main className="page">
      <p className="eyebrow">404</p>
      <h1>That page has not been composed.</h1>
      <Link className="button primary" href="/diatonic-chord-scales">
        Return home
      </Link>
    </main>
  );
}

const BASE_URL = "/diatonic-chord-scales";

function App() {
  const pathname = usePathname().replace(/\/$/, "");
  const route = pathname.slice(BASE_URL.length);

  let page = <NotFound />;
  if (route === "") page = <Home />;
  else if (route === "/about") page = <About />;

  return (
    <>
      <header className="site-header">
        <Link className="brand" href={BASE_URL}>
          Tonal Generating Systems
        </Link>
        <nav aria-label="Main navigation">
          <Link className={route === "" ? "active" : ""} href={BASE_URL}>
            Home
          </Link>
          <Link
            className={route === "/about" ? "active" : ""}
            href={`${BASE_URL}/about`}
          >
            About
          </Link>
        </nav>
      </header>
      {page}
    </>
  );
}

export default App;
