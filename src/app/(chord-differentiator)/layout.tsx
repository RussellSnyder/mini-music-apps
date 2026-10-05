import type { Metadata } from "next";
import "@/apps/chord-differentiator/index.css";

export const metadata: Metadata = { title: "Chord Differentiator" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
