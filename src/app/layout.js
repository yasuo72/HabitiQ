'use client';
import { Inter } from 'next/font/google'
import './globals.css'
import { JournalProvider } from '@/context/JournalContext'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useEffect, useState } from 'react'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <div className="min-h-screen bg-white flex flex-col">
          {mounted ? (
            <JournalProvider>
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </JournalProvider>
          ) : (
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-pulse text-gray-500">Loading...</div>
            </div>
          )}
        </div>
      </body>
    </html>
  )
}