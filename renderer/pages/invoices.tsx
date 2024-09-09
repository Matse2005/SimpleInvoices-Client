import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import Invoice from "../components/Invoice";
import ky from "ky";
import Button from "../components/Button";
import { usePathname } from 'next/navigation'
import { ipcMain } from "electron";
import fetch from "../lib/fetch";
import Sidebar from "../components/tabs/Sidebar";
import InvoicesBar from "../components/tabs/InvoicesBar";
import Loading from "../components/tabs/Loading";
import Click from "../components/tabs/Click";
import InvoiceBar from "../components/tabs/Invoice";
import { useRouter } from "next/router";
import TitleBar from "../components/TitleBar";

export default function InvoicesPage() {
  const router = useRouter();
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [invoice, setInvoice] = useState(false);
  const currentPath = usePathname();
  const [print, setPrint] = useState(null);
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
    getData()
  }, [config]);

  const getData = async () => {
    try {
      const fetchedData = await fetch.byDate({ server: config['server'], key: config['key'] });
      // const fetchedLocations = await fetch.locations({ server: config['server'], key: config['key'] });
      setData(fetchedData);
      // setLocations(fetchedLocations);
      setInvoice(fetchedData[0]);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  }

  const getInvoice = async (id) => {
    try {
      setLoadingInvoice(true);
      setInvoice(data[id]);
      setLoadingInvoice(false);
    } catch (e) {
      console.log("Error: " + e);
    }
  };

  const printInvoice = (invoice) => {
    const url = `/invoice?invoiceQuery=${encodeURIComponent(JSON.stringify(invoice))}`;
    window.ipc.printPage(url);
  };

  return (
    <React.Fragment>
      <Head>
        <title>Facturen</title>
      </Head>
      <div className="relative z-10 flex w-full h-full overflow-hidden print:hidden">
        {!loading ? (
          <div className="w-full">

            <Sidebar latest={data[0]['number']} />

            <InvoicesBar invoices={data} invoice={invoice} getInvoice={getInvoice} />

            <div className="p-4 sm:pl-[40rem] h-[calc(100vh)] w-full overflow-y-auto flex justify-center">
              {!loadingInvoice ? (
                invoice ? (
                  <InvoiceBar invoice={invoice} config={config} />
                ) : (
                  <Click slot={"Klik op een factuur om te bekijken."} />
                )
              ) : (
                <Loading slot={"Facturen wordt geladen..."} />
              )}
            </div>
          </div>
        ) : (
          <Loading slot={"Facturen worden opgehaald..."} />
        )}
      </div>
      {invoice ? (
        <div className="hidden print:block print:h-full print:!m-0 print:!p-0 print:overflow-hidden">
          <div className="new-page">
            <Invoice invoice={invoice} />
          </div>
        </div>
      ) : null}
    </React.Fragment>
  );
}
