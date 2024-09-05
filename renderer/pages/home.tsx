import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  return (
    <React.Fragment>
      <Head>
        <title>Home - Nextron (with-tailwindcss)</title>
      </Head>
      <div className="grid w-full text-2xl text-center grid-col-1">
        <div>
          <Image
            className="ml-auto mr-auto"
            src="/images/logo.png"
            alt="Logo image"
            width={256}
            height={256}
          />
        </div>
        <span>⚡ Electron ⚡</span>
        <span>+</span>
        <span>Next.js</span>
        <span>+</span>
        <span>tailwindcss</span>
        <span>=</span>
        <span>💕 </span>
      </div>
      <div className="flex flex-wrap justify-center w-full mt-1">
        <Link href="/next">Go to next page</Link>
      </div>
      <div className="flex flex-wrap justify-center w-full mt-1">
        <Link href="/invoices">Go to invoices page</Link>
      </div>
    </React.Fragment>
  )
}
