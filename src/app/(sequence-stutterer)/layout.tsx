import type { Metadata } from "next";
import "@/apps/sequence-stutterer/index.css";

export const metadata: Metadata = { title: "Sequence Stutterer" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
