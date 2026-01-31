import type { Metadata } from "next";
import { Architects_Daughter, DM_Sans, Fira_Code, Geist, Geist_Mono, Inter, Space_Mono, Unbounded } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/provider/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/navbar";
import { GlobalPomodoroTimer } from "./(pages)/pomodoro/_components/global-timer";

// Default Font
// const inter = Inter({
//   variable: "--font-inter",
//   subsets: ["latin"],
// });

// const unbounded = Unbounded({
//   variable: "--font-unbounded",
//   subsets: ["latin"],
// });


// Notebook Theme Font
// const architectsDaughter = Architects_Daughter({
//   weight: "400",
//   variable: "--font-sans",
//   subsets: ["latin"],
// })

// const firaCode = Fira_Code({
//   variable: "--font-mono",
//   subsets: ["latin"],
// })

// Neo Brutalism Theme Font
// const dmSans = DM_Sans({
//   subsets: ["latin"],
//   variable: "--font-sans",
//   weight: ["400", "500", "700"],
// });

// const spaceMono = Space_Mono({
//   subsets: ["latin"],
//   variable: "--font-mono",
//   weight: ["400", "700"],
// });

// Vercel Theme Font
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "700"],
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: {
    template: "MyNova | %s",
    default: "MyNova | Start your day with clarity",
  },
  description:
    "MyNova is a private, self-hosted personal system to organize your tasks, goals, ideas, and daily focus — built to help you start each day with clarity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geist.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
          >
            <Navbar />

            {children}

            <GlobalPomodoroTimer />

            <Toaster position="bottom-right" />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
