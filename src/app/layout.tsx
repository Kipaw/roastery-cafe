import { Toaster } from "@/components/ui/sonner";
import AuthStoreProvider from "@/providers/auth-store-provider";
import ReactQueryProvider from "@/providers/react-query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import type { Metadata } from "next";
import { Geist_Mono, Montserrat } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Sinergy Roastery",
    template: "%s | Sinergy Roastery",
  },
  description: "Good Beans, Better Days.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookiesStore = await cookies();
  const profile = JSON.parse(cookiesStore.get("user_profile")?.value ?? "{}");

  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${montserrat.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ReactQueryProvider>
          <AuthStoreProvider profile={profile}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster />
            </ThemeProvider>
          </AuthStoreProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
