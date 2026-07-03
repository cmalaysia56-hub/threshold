import { SITE_URL } from "../lib/decisions";
import { AuthProvider } from "../lib/auth-context";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Threshold — Wisdom for the decision in front of you",
  description:
    "Bring what you're facing. Leave with clarity, Scripture, and a next step you can actually take.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1C1815",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
