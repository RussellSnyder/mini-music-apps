import type { Metadata } from "next";
import "@/apps/tonaljs-explorer/index.css";

export const metadata: Metadata = { title: "TonalJS Explorer" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
