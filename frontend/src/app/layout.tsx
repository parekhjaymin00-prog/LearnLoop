import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SmoothScroll } from "@/components/smooth-scroll";
import { UserProvider } from "@/context/user-context";
import { GoogleProvider } from "@/components/google-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LearnLoop | Learn. Share. Grow.",
  description: "A skill-based learning and discussion platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <UserProvider>
            <GoogleProvider>
              <SmoothScroll />
              {children}
            </GoogleProvider>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
