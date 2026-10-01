import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://ascendia-os.vercel.app'),
  title: {
    default: 'AscendiaOS - AI Personal Study & Exam Prep OS',
    template: '%s | AscendiaOS',
  },
  description: 'Manage your entire study preparation, syllabus, resources, notes, sessions, and progress in one place.',
  keywords: ['AscendiaOS', 'Exam Prep', 'AI Study Assistant', 'Syllabus Tracker', 'Study OS'],
  authors: [{ name: 'Sukhwinder-i0', url: 'https://github.com/Sukhwinder-i0' }],
  creator: 'Sukhwinder-i0',
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ascendia-os.vercel.app',
    title: 'AscendiaOS - AI Personal Study & Exam Prep OS',
    description: 'Manage your entire study preparation, syllabus, resources, notes, sessions, and progress in one place.',
    siteName: 'AscendiaOS',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AscendiaOS - AI Personal Study & Exam Prep OS',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AscendiaOS - AI Personal Study & Exam Prep OS',
    description: 'Manage your entire study preparation, syllabus, resources, notes, sessions, and progress in one place.',
    images: ['/og-image.png'],
    creator: '@sukhwinder_i0',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" sizes="any" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </head>
      <body className="bg-background text-primary antialiased selection:bg-accent selection:text-white transition-colors duration-200">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
