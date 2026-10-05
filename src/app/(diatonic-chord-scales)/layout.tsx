import type { Metadata } from "next";
import "@/apps/diatonic-chord-scales/index.css";

export const metadata: Metadata = { title: "Diatonic Chord Scales" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
