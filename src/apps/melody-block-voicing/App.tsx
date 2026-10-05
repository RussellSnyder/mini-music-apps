"use client";
import Link from "next/link";
import { MusicInput } from "@/shared/MusicInput";

const defaultNotes = "64, 67, 72, 71, 69, 67, 64";
const defaultAbc = `
M:4/4
L:1/4
E G c B | A G E2 |
`;

function App() {
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-4 p-8">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">
        Mini Music Apps
      </Link>
      <h1 className="text-3xl font-semibold">Melody Block Voicing</h1>
      <p className="text-zinc-600">
        Harmonize a melody in four-way close block voicing, with the baritone
        doubling the lead, as in a big band sax soli.
      </p>
      <MusicInput
        initialNotes={defaultNotes}
        initialAbc={defaultAbc}
        onMusicInputChange={() => {}}
      />
    </div>
  );
}

export default App;
