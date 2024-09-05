import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import Invoice from "../../../components/Invoice";
import ky from "ky";
import Button from "../../../components/Button";
import { usePathname } from 'next/navigation'
import { ipcMain } from "electron";
import fetch from "../../../lib/fetch";
import { useRouter } from "next/router";

interface Author {
  id: number;
  name: string;
}

interface Location {
  id: number;
  name: string;
}

interface Item {
  btw: number;
  price: number;
  total: number;
  amount: number;
  btw_percent: number;
  description: string;
}

interface Invoice {
  id: number;
  author: Author;
  location: Location;
  number: number;
  date: string; // Format: YYYY-MM-DD
  btw_number: string;
  items: Item[];
  customer: string[]; // Array of strings representing customer details
  port: number;
  no_btw: number;
  editable: boolean;
}

export default function InvoicesPage() {
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Invoice[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [invoice, setInvoice] = useState<Invoice | boolean>(false);
  const currentPath = usePathname();
  const router = useRouter();
  const filter = router.query.filter as string;
  const value = router.query.value as string;

  const getData = async () => {
    try {
      var fetchData = []

      console.log(filter)
      console.log(value)
      switch (filter) {
        case 'location':
          fetchData = await fetch.byLocation({ server: 'http://localhost:8000', key: 'hi' }, value);
          break;
        default:
          fetchData = await fetch.byDate({ server: 'http://localhost:8000', key: 'hi' });
          break;
      }

      setLocations(await fetch.locations({ server: 'http://localhost:8000', key: 'hi' }));
      setData(fetchData)
      console.log(fetchData)
      setInvoice(fetchData[0]);
    } catch (error) {
      console.error("Error fetching data: ", error);
    } finally {
      setLoading(false);
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

  const printInvoice = (invoice: Invoice) => {
    const url = `/invoice?invoiceQuery=${encodeURIComponent(JSON.stringify(invoice))}`;
    window.ipc.printPage(url);
  };

  useEffect(() => {
    getData();
  }, [false]);

  return (
    <React.Fragment>
      <Head>
        <title>Facturen | {router.asPath}</title>
      </Head>
      <div className="flex w-full h-screen overflow-hidden print:hidden">
        {!loading ? (
          <div className="w-full">
            <button
              data-drawer-target="default-sidebar"
              data-drawer-toggle="default-sidebar"
              aria-controls="default-sidebar"
              type="button"
              className="inline-flex items-center p-2 mt-2 text-sm text-gray-500 rounded-lg ms-3 sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 "
            >
              <span className="sr-only">Open sidebar</span>
              <svg
                className="w-6 h-6"
                aria-hidden="true"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  clip-rule="evenodd"
                  fill-rule="evenodd"
                  d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
                ></path>
              </svg>
            </button>

            <aside
              id="sidebar"
              className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full border-r-2 border-r-gray-200 sm:translate-x-0"
              aria-label="Sidebar"
            >
              <div className="h-full px-3 py-4 space-y-4 overflow-y-auto bg-gray-50">
                <ul className="pb-4 space-y-2 font-medium border-b-2 border-b-gray-200">
                  <Link href={'/create?next=' + ((data[0] ? data[0]["number"] : 0) + 1)}>
                    <Button
                      slot="Aanmaken" className="w-full" />
                  </Link>
                  <li>
                    <Link
                      href={"/invoices/date/"}
                      className={"flex items-center p-2 rounded-lg group hover:bg-gray-200 " + (currentPath === "/invoices/date/" ? "bg-gray-200" : "")}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        data-name="Layer 1"
                        viewBox="0 0 24 24"
                        className="w-6 h-6 transition duration-75"
                        id="invoice"
                        fill="currentColor"
                      >
                        <path d="M13,16H7a1,1,0,0,0,0,2h6a1,1,0,0,0,0-2ZM9,10h2a1,1,0,0,0,0-2H9a1,1,0,0,0,0,2Zm12,2H18V3a1,1,0,0,0-.5-.87,1,1,0,0,0-1,0l-3,1.72-3-1.72a1,1,0,0,0-1,0l-3,1.72-3-1.72a1,1,0,0,0-1,0A1,1,0,0,0,2,3V19a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V13A1,1,0,0,0,21,12ZM5,20a1,1,0,0,1-1-1V4.73L6,5.87a1.08,1.08,0,0,0,1,0l3-1.72,3,1.72a1.08,1.08,0,0,0,1,0l2-1.14V19a3,3,0,0,0,.18,1Zm15-1a1,1,0,0,1-2,0V14h2Zm-7-7H7a1,1,0,0,0,0,2h6a1,1,0,0,0,0-2Z"></path>
                      </svg>
                      <span className="ms-3">Facturen</span>
                    </Link>
                  </li>
                </ul>
                <ul className="space-y-2 font-medium">
                  {locations?.map((item, index) => (
                    <li key={index}>
                      <button
                        // href={"/invoices/location/" + item['id']}
                        onClick={() => {
                          router.push("/invoices/location/" + item['id'] + "/").then(() => {
                            router.reload();
                          });
                        }}
                        className={"flex items-center w-full p-2 rounded-lg group hover:bg-gray-200 " + (currentPath === "/invoices/location/" + item['id'] + "/" ? "bg-gray-200" : "")}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg"
                          data-name="Layer 1"
                          viewBox="0 0 24 24"
                          id="building"
                          className="w-6 h-6 transition duration-75"
                          fill="currentColor">
                          <path d="M14,8h1a1,1,0,0,0,0-2H14a1,1,0,0,0,0,2Zm0,4h1a1,1,0,0,0,0-2H14a1,1,0,0,0,0,2ZM9,8h1a1,1,0,0,0,0-2H9A1,1,0,0,0,9,8Zm0,4h1a1,1,0,0,0,0-2H9a1,1,0,0,0,0,2Zm12,8H20V3a1,1,0,0,0-1-1H5A1,1,0,0,0,4,3V20H3a1,1,0,0,0,0,2H21a1,1,0,0,0,0-2Zm-8,0H11V16h2Zm5,0H15V15a1,1,0,0,0-1-1H10a1,1,0,0,0-1,1v5H6V4H18Z"></path>
                        </svg>
                        <span className="ms-3">{item['name']}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            <aside
              id="emails"
              className="fixed top-0 z-40 h-screen transition-transform -translate-x-full border-r-2 w-96 left-64 sm:translate-x-0 border-r-gray-200"
              aria-label="Sidebar"
            >
              <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50 ">
                <ul className="space-y-2 font-medium">
                  {data.map((item, index) => (
                    <li className="mb-2" key={index}>
                      <button onClick={() => {
                        getInvoice(index)
                        // invoice = data[index];
                      }}
                        className={"w-full text-left p-2 transition-all rounded-lg " + (invoice && invoice['id'] == item['id'] ? 'bg-primary-500 text-white' : 'hover:bg-gray-200')}>
                        <h4 className="flex font-semibold gap-x-2 itemse-center">
                          <svg className="h-5" xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 24 24"
                            id="invoice">
                            <path fill="currentColor"
                              d="M13,16H7a1,1,0,0,0,0,2h6a1,1,0,0,0,0-2ZM9,10h2a1,1,0,0,0,0-2H9a1,1,0,0,0,0,2Zm12,2H18V3a1,1,0,0,0-.5-.87,1,1,0,0,0-1,0l-3,1.72-3-1.72a1,1,0,0,0-1,0l-3,1.72-3-1.72a1,1,0,0,0-1,0A1,1,0,0,0,2,3V19a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V13A1,1,0,0,0,21,12ZM5,20a1,1,0,0,1-1-1V4.73L6,5.87a1.08,1.08,0,0,0,1,0l3-1.72,3,1.72a1.08,1.08,0,0,0,1,0l2-1.14V19a3,3,0,0,0,.18,1Zm15-1a1,1,0,0,1-2,0V14h2Zm-7-7H7a1,1,0,0,0,0,2h6a1,1,0,0,0,0-2Z">
                            </path>
                          </svg>
                          Factuur #{item['number']}
                        </h4>
                        <p className="text-sm">
                          {new Date(item['date']).toLocaleDateString()} - {item['customer'][0]}
                        </p>
                        <p className="text-sm italic">
                          {item['author']['name']} - {item['location']['name']}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            <div className="p-4 sm:pl-[40rem] h-[calc(100vh)] w-full overflow-y-auto flex justify-center">
              {!loadingInvoice ? (
                invoice ? (
                  <div>
                    <div className="flex justify-between py-5 text-gray-500 border-b border-b-gray-200">
                      <div className="flex gap-x-3">
                        {invoice['editable'] ? (
                          <Link href={"#"}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="edit"
                              className="w-6 h-6 transition duration-75 hover:text-primary-500" fill="currentColor">
                              <path d="M21,12a1,1,0,0,0-1,1v6a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V5A1,1,0,0,1,5,4h6a1,1,0,0,0,0-2H5A3,3,0,0,0,2,5V19a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V13A1,1,0,0,0,21,12ZM6,12.76V17a1,1,0,0,0,1,1h4.24a1,1,0,0,0,.71-.29l6.92-6.93h0L21.71,8a1,1,0,0,0,0-1.42L17.47,2.29a1,1,0,0,0-1.42,0L13.23,5.12h0L6.29,12.05A1,1,0,0,0,6,12.76ZM16.76,4.41l2.83,2.83L18.17,8.66,15.34,5.83ZM8,13.17l5.93-5.93,2.83,2.83L10.83,16H8Z"></path>
                            </svg>
                          </Link>
                        ) : null}
                        <Link href={"#"}>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="folder-download"
                            className="w-6 h-6 transition duration-75 hover:text-primary-500" fill="currentColor">
                            <path d="M13.29,13.79l-.29.3V11.5a1,1,0,0,0-2,0v2.59l-.29-.3a1,1,0,0,0-1.42,1.42l2,2a1,1,0,0,0,.33.21.94.94,0,0,0,.76,0,1,1,0,0,0,.33-.21l2-2a1,1,0,0,0-1.42-1.42ZM19,5.5H12.72l-.32-1a3,3,0,0,0-2.84-2H5a3,3,0,0,0-3,3v13a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V8.5A3,3,0,0,0,19,5.5Zm1,13a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V5.5a1,1,0,0,1,1-1H9.56a1,1,0,0,1,.95.68l.54,1.64A1,1,0,0,0,12,7.5h7a1,1,0,0,1,1,1Z"></path>
                          </svg>
                        </Link>
                        {/* <Link href={"#"}>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="print"
                            className="w-6 h-6 transition duration-75 hover:text-primary-500" fill="currentColor">
                            <path d="M7,10a1,1,0,1,0,1,1A1,1,0,0,0,7,10ZM19,6H18V3a1,1,0,0,0-1-1H7A1,1,0,0,0,6,3V6H5A3,3,0,0,0,2,9v6a3,3,0,0,0,3,3H6v3a1,1,0,0,0,1,1H17a1,1,0,0,0,1-1V18h1a3,3,0,0,0,3-3V9A3,3,0,0,0,19,6ZM8,4h8V6H8Zm8,16H8V16h8Zm4-5a1,1,0,0,1-1,1H18V15a1,1,0,0,0-1-1H7a1,1,0,0,0-1,1v1H5a1,1,0,0,1-1-1V9A1,1,0,0,1,5,8H19a1,1,0,0,1,1,1Z"></path>
                          </svg>
                        </Link> */}
                        <div onClick={() => window.print()} className="hover:cursor-pointer">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="print"
                            className="w-6 h-6 transition duration-75 hover:text-primary-500" fill="currentColor">
                            <path d="M7,10a1,1,0,1,0,1,1A1,1,0,0,0,7,10ZM19,6H18V3a1,1,0,0,0-1-1H7A1,1,0,0,0,6,3V6H5A3,3,0,0,0,2,9v6a3,3,0,0,0,3,3H6v3a1,1,0,0,0,1,1H17a1,1,0,0,0,1-1V18h1a3,3,0,0,0,3-3V9A3,3,0,0,0,19,6ZM8,4h8V6H8Zm8,16H8V16h8Zm4-5a1,1,0,0,1-1,1H18V15a1,1,0,0,0-1-1H7a1,1,0,0,0-1,1v1H5a1,1,0,0,1-1-1V9A1,1,0,0,1,5,8H19a1,1,0,0,1,1,1Z"></path>
                          </svg>
                        </div>
                      </div>
                      <div className="flex gap-x-3">
                        {/* <Link href={"#"}>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="trash"
                            className="w-6 h-6 transition duration-75 hover:text-red-500" fill="currentColor">
                            <path d="M20,6H16V5a3,3,0,0,0-3-3H11A3,3,0,0,0,8,5V6H4A1,1,0,0,0,4,8H5V19a3,3,0,0,0,3,3h8a3,3,0,0,0,3-3V8h1a1,1,0,0,0,0-2ZM10,5a1,1,0,0,1,1-1h2a1,1,0,0,1,1,1V6H10Zm7,14a1,1,0,0,1-1,1H8a1,1,0,0,1-1-1V8H17Z"></path>
                          </svg>
                        </Link> */}
                      </div>
                    </div>
                    <div className="w-[25.6cm] border p-10 mx-auto mt-7">
                      <Invoice invoice={invoice} />
                    </div>
                    <div className="h-5"></div>
                  </div>) :
                  (
                    <p className="text-gray-500">Klik op een factuur om te bekijken.</p>
                  )
              ) : (
                <div className="flex justify-center max-h-screen p-10 overflow-y-hidden">
                  <div className="flex items-center justify-center w-full h-full text-center">
                    <div role="status">
                      <svg aria-hidden="true" className="inline w-8 h-8 text-gray-200 animate-spin fill-primary-600"
                        viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                          fill="currentColor" />
                        <path
                          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                          fill="currentFill" />
                      </svg>
                      <span className="sr-only">Laden...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex justify-center w-full max-h-screen p-10 overflow-y-hidden">
            <div className="flex items-center justify-center w-full h-full text-center">
              <div role="status" className="flex flex-col items-center gap-y-3">
                <svg
                  aria-hidden="true"
                  className="inline w-8 h-8 text-gray-200 animate-spin fill-primary-600"
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
                <span className="">Facturen worden opgehaald</span>
              </div>
            </div>
          </div>
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
