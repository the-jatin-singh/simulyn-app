import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const siteUrl = 'https://app.simulyn.dev'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Simulyn — Enterprise Mock API Platform for Agile Development Teams',
    template: '%s | Simulyn',
  },
  description:
    'Accelerate development with Simulyn. Instantly generate high-fidelity, AI-ready mock REST API endpoints to decouple frontend and backend workflows, streamline prototyping, and ensure robust contract testing for modern engineering teams.',
  keywords: [
    'mock API platform',
    'enterprise REST API mocking',
    'API simulation tool',
    'JSON schema mock generator',
    'fake API server for testing',
    'API sandbox environment',
    'frontend development acceleration',
    'API contract testing',
    'mock server for react',
    'developer productivity tools',
    'AI-ready API mocks',
    'decoupled architecture',
    'simulyn dev',
    'agile api development',
  ],
  authors: [{ name: 'Simulyn', url: siteUrl }],
  creator: 'Simulyn',
  publisher: 'Simulyn',
  category: 'technology',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Simulyn',
    title: 'Simulyn — Enterprise Mock API Platform for Agile Teams',
    description:
      'Decouple your development workflow and eliminate backend dependencies. Generate high-fidelity mock REST API endpoints instantly. Built for scale and speed.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Simulyn — Professional Mock API Platform for Enterprise Engineering',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulyn — Instant Enterprise Mock API Platform',
    description:
      'Stop waiting on backend teams. Spawn realistic mock REST API endpoints in seconds and accelerate your frontend development.',
    images: ['/og-image.png'],
    creator: '@simulyn',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: ['/favicon.ico'],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
      },
    ],
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: siteUrl,
  },
};

import { NavigationLoader } from '@/components/NavigationLoader';
import { Suspense } from 'react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#ffffff" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Simulyn',
              url: 'https://app.simulyn.dev',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: 'https://app.simulyn.dev/search?q={search_term_string}',
                },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Simulyn',
              url: 'https://app.simulyn.dev',
              logo: 'https://app.simulyn.dev/apple-touch-icon.png',
              sameAs: [
                'https://twitter.com/simulyn',
                'https://github.com/simulyn',
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'Simulyn',
              operatingSystem: 'All',
              applicationCategory: 'DeveloperApplication',
              description: 'Instant Mock API Platform for Agile Development Teams',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: 'What is Simulyn?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Simulyn is an enterprise-grade mock API platform that allows developers to instantly generate realistic REST API endpoints from JSON schemas or templates.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'How does Simulyn accelerate development?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'By providing instant mock endpoints, Simulyn decouples frontend and backend development, allowing teams to build and test features in parallel without waiting for backend readiness.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Is Simulyn AI-ready?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes, Simulyn is designed to work seamlessly with AI tools and LLMs, providing structured, reliable API responses for modern application development.',
                  },
                },
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Service',
              serviceType: 'Mock API Platform',
              provider: {
                '@type': 'Organization',
                name: 'Simulyn',
              },
              areaServed: 'Worldwide',
              hasOfferCatalog: {
                '@type': 'OfferCatalog',
                name: 'API Mocking Services',
                itemListElement: [
                  {
                    '@type': 'Offer',
                    itemOffered: {
                      '@type': 'Service',
                      name: 'Instant Mock Endpoints',
                    },
                  },
                  {
                    '@type': 'Offer',
                    itemOffered: {
                      '@type': 'Service',
                      name: 'JSON Schema Generation',
                    },
                  },
                ],
              },
            }),
          }}
        />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased bg-white text-zinc-900 min-h-screen selection:bg-indigo-100 selection:text-indigo-900`}
        suppressHydrationWarning
      >
        <Suspense fallback={null}>
          <NavigationLoader />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
