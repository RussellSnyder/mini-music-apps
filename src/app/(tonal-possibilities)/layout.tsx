import type { Metadata } from "next";
import "@/apps/tonal-possibilities/index.css";

export const metadata: Metadata = { title: "Tonal Possibilities" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
