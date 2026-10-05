import type { Metadata } from "next";
import "@/apps/home/index.css";

export const metadata: Metadata = { title: "Mini Music Apps" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
