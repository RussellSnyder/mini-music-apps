import abcjs from "abcjs";

type Synth = InstanceType<typeof abcjs.synth.CreateSynth>;

let current: { synth: Synth; stop: () => void } | null = null;

export function stopPlayback() {
  current?.stop();
  current = null;
}

// Plays an ABC tune without rendering it; resolves when it finishes or is stopped.
export async function playAbc(abc: string) {
  stopPlayback();
  if (!abcjs.synth.supportsAudio()) return;

  const [visualObj] = abcjs.renderAbc("*", abc);
  const synth = new abcjs.synth.CreateSynth();
  const handle = { synth, stop: () => synth.stop() };
  current = handle;

  await synth.init({ visualObj });
  await synth.prime();
  if (current !== handle) return;
  synth.start();
}
