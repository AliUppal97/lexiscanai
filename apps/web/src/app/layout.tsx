import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LexiScan AI - Intelligent Document Analysis',
  description: 'AI-powered document analysis and legal review platform for law firms, enterprises, and compliance teams',
  keywords: ['document analysis', 'legal AI', 'contract review', 'compliance automation', 'legal tech'],
  authors: [{ name: 'LexiScan AI' }],
  creator: 'LexiScan AI',
  publisher: 'LexiScan AI',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://lexiscan.ai',
    siteName: 'LexiScan AI',
    title: 'LexiScan AI - Intelligent Document Analysis',
    description: 'AI-powered document analysis and legal review platform',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LexiScan AI - Intelligent Document Analysis',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LexiScan AI - Intelligent Document Analysis',
    description: 'AI-powered document analysis and legal review platform',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  )
}
