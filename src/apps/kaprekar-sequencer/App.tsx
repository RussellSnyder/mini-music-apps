"use client";
import { KaprekarContainer } from "@/apps/kaprekar-sequencer/components/KaprekarContainer";
import { Navbar } from "@/apps/kaprekar-sequencer/components/Navbar";
import { AboutPage } from "@/apps/kaprekar-sequencer/pages/AboutPage";
import "./App.css";
import { usePathname } from "next/navigation";

function App() {
  const route = usePathname()
    .replace(/^\/kaprekar-sequencer\/?/, "")
    .replace(/\/$/, "");
  const isAboutRoute = route === "about";

  return (
    <div className="app-shell">
      <Navbar />

      <main className="page-content">
        {isAboutRoute ? <AboutPage /> : <KaprekarContainer />}
      </main>
    </div>
  );
}

export default App;
