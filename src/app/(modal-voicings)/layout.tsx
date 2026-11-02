import type { Metadata } from "next";
import "@/apps/melody-block-voicing/index.css";

export const metadata: Metadata = { title: "Melody Block Voicing" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
