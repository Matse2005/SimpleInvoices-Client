import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Button from "../components/Button";
import { useRouter } from "next/router";
import fetch from '../lib/fetch'
import Loading from "../components/tabs/Loading";
import Image from "next/image";

export default function WelcomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [setup, setSetup] = useState(false);
  const [invoices, setInvoices] = useState(false);
  const [config, setConfig] = useState(null)

  const getConfig = async () => {
    try {
      const config = await fetch.getConfig();
      setConfig(config);
    } catch (err) {
      console.log('Error: ', err.message);
    }
  };

  useEffect(() => {
    getConfig()
  }, []);

  useEffect(() => {
    if (config !== null) {  // Only run startUpCheck if config is available
      startUpCheck();
    }
  }, [config]);

  const startUpCheck = async () => {
    var setupVar = setup
    var invoicesVar = invoices

    try {
      if (config != null && Object.keys(config).length > 0) {
        setupVar = true

        const invoices = await fetch.byDate({
          server: config['server'],
          key: config['key'],
        });

        if (invoices !== null && invoices.length > 0) {
          invoicesVar = true
        }
      }
      if (setupVar && invoicesVar)
        router.push('/invoices');
      else {
        setInvoices(invoicesVar)
        setSetup(setupVar)
        setLoading(false)
      }
    } catch (e) {
      console.log('Error: ', e.message);
    }
  };

  return (
    <React.Fragment>
      <Head>
        <title>Simpele Facturen</title>
      </Head>
      <div className="">
        {loading == false ? (
          <div className="flex items-center justify-center h-full min-h-screen">
            <section className="flex flex-col items-center max-w-screen-sm mx-auto gap-y-5">
              <div className="flex flex-col w-full gap-y-3">
                <div className="">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-24 p-3 mx-auto rounded-full bg-primary-200 text-primary-600" viewBox="0 0 512 512">
                    <path d="M432 320V144a32 32 0 00-32-32h0a32 32 0 00-32 32v112M368 256V80a32 32 0 00-32-32h0a32 32 0 00-32 32v160M240 241V96a32 32 0 00-32-32h0a32 32 0 00-32 32v224M304 240V48a32 32 0 00-32-32h0a32 32 0 00-32 32v192" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="35" />
                    <path d="M432 320c0 117.4-64 176-152 176s-123.71-39.6-144-88L83.33 264c-6.66-18.05-3.64-34.79 11.87-43.6h0c15.52-8.82 35.91-4.28 44.31 11.68L176 320" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="35" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-center text-primary-600">Simpele Facturen</h1>
                <p className="text-center text-gray-700">Welkom bij Simpele Facturen, om verder te gaan zorg dat alle instellingen voltooid zijn en maak je eerste factuur aan. Voor verdere vragen kan je altijd terecht bij de beheerder van Simpele Facturen instantie.</p>
                {setup == false ? (
                  <Link href={'/setup'}>
                    <Button slot="Instellen" className="w-full" />
                  </Link>
                ) : <Button slot="Instellingen voltooid" className="w-full" disabled={true} />}
                {setup == true && invoices == false ? (
                  <Link href={'/create?next=1'}>
                    <Button slot="Eerste factuur aanmaken" className="w-full" />
                  </Link>
                ) : invoices == true &&
                (<Link href={'/invoices'}>
                  <Button slot="Naar facturen" className="w-full" />
                </Link>)}
              </div>
              <div className="flex flex-col w-full gap-y-4">

              </div>
            </section>
          </div>
          // ) : <main className="flex items-center h-full min-h-screen"><Loading slot={"Systemen worden gecontrolleerd..."} /></main>}
        ) : (
          <div className="flex flex-col items-center justify-between h-screen p-5 space-y-4 bg-gradient-to-br from-primary-200 to-primary-200 via-primary-500">
            <div className=""></div>
            <div className="">
              <div className="space-y-2 text-center">
                <h1 className="text-4xl font-bold text-white">Simpele Facturen</h1>
                <p className="text-sm text-white">Simpele Facturen wordt opgestart</p>
              </div>
              <div className="flex justify-center w-full max-h-screen p-10 overflow-y-hidden">
                <div className="flex items-center justify-center w-full h-full text-center">
                  <div role="status" className="flex flex-col items-center gap-y-3">
                    <svg
                      aria-hidden="true"
                      className="inline w-8 h-8 text-primary-500 animate-spin fill-white"
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="currentColor"
                      />
                      <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="currentFill"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="-space-y-1 text-center text-white">
              <h3 className="text-sm">Ontwikkeld Door</h3>
              <h2 className="text-lg font-bold">MatseVH</h2>
            </div>
          </div>
        )}
      </div>
    </React.Fragment>
  );
}
