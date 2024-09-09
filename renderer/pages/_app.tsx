import React from 'react'
import type { AppProps } from 'next/app'

import '../styles/globals.css'
import TitleBar from '../components/TitleBar'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="flex flex-col h-screen overflow-hidden"> {/* Ensure it takes full height and hides overflow */}
      {/* Include the TitleBar at the top of the layout */}
      <TitleBar />

      {/* Main content of the application */}
      <div className="flex-grow overflow-hidden"> {/* Flex-grow to occupy remaining space, overflow-hidden to prevent unwanted scroll */}
        <Component {...pageProps} className="h-full overflow-auto" /> {/* Use overflow-auto to scroll content within available space */}
      </div>
    </div>
  )
}

export default MyApp
