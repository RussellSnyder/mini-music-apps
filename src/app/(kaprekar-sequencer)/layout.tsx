import type { Metadata } from "next";
import "@/apps/kaprekar-sequencer/index.css";

export const metadata: Metadata = { title: "Kaprekar Sequencer" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
