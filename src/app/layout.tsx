import type { Metadata } from "next";
import { Inter, Space_Grotesk, Arimo } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const arimo = Arimo({
  subsets: ["latin"],
  variable: "--font-arimo",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SoftCV Studio — Create, Improve & Download Your Resume",
    template: "%s | SoftCV Studio",
  },
  description:
    "Create a professional resume with AI-assisted writing improvements, live preview, ATS readiness checks, and real PDF/DOCX export. Create once, tailor to each job.",
  keywords: [
    "resume builder",
    "CV maker",
    "AI resume",
    "ATS resume",
    "PDF resume",
    "DOCX resume",
    "resume templates",
  ],
  authors: [{ name: "SoftCV Studio" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "SoftCV Studio — Create, Improve & Download Your Resume",
    description:
      "Build a professional resume with AI writing assistance, ATS readiness checks, and reliable PDF/DOCX export.",
    siteName: "SoftCV Studio",
  },
  twitter: {
    card: "summary_large_image",
    title: "SoftCV Studio",
    description:
      "Create once. Improve with AI. Tailor to each job. Download without friction.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${arimo.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen antialiased">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
