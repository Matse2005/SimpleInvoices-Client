import Link from "next/link";
import Invoice from "../Invoice";
import { useState } from "react";
import fetch from "../../lib/fetch";
import Button from "../Button";
// import printToPdf from '../../lib/print'

export default function InvoiceBar({ invoice, config }) {
  const [print, setPrint] = useState(false);
  const [printers, setPrinters] = useState([])
  const [printer, setPrinter] = useState('')
  // const url = "/invoice/" + invoice['id']
  const url = config['server'] + '/invoice/' + invoice['id']

  const selectPrinter = async () => {
    const currPrinters = await fetch.getPrinters()
    currPrinters.map((item, index) => {
      if (item['isDefault'] == true)
        setPrinter(item['name'])
    })
    setPrinters(currPrinters)
    setPrint(true)
  }

  const startPrint = () => {
    window.ipc.send('print', url, printer)
    setPrint(false)
  }

  const share = () => {
    window.ipc.send('share', url, invoice.number)
    // window.ipc.send('mailto', url, invoice.number)
  }

  return (
    <div>
      <div className="flex justify-between py-5 text-gray-500 border-b border-b-gray-200">
        <div className="flex gap-x-3">
          {invoice['editable'] ? (
            // <div onClick={() => alert('Het bewerken van facturen is op deze moment nog niet mogelijk.')} className="hover:cursor-pointer">
            <Link href={'/manage?id=' + invoice.id}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="edit"
                className="w-6 h-6 transition duration-75 hover:text-primary-500" fill="currentColor">
                <path d="M21,12a1,1,0,0,0-1,1v6a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V5A1,1,0,0,1,5,4h6a1,1,0,0,0,0-2H5A3,3,0,0,0,2,5V19a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V13A1,1,0,0,0,21,12ZM6,12.76V17a1,1,0,0,0,1,1h4.24a1,1,0,0,0,.71-.29l6.92-6.93h0L21.71,8a1,1,0,0,0,0-1.42L17.47,2.29a1,1,0,0,0-1.42,0L13.23,5.12h0L6.29,12.05A1,1,0,0,0,6,12.76ZM16.76,4.41l2.83,2.83L18.17,8.66,15.34,5.83ZM8,13.17l5.93-5.93,2.83,2.83L10.83,16H8Z"></path>
              </svg>
            </Link>
            // </div>
          ) : null}
          <div onClick={() => window.ipc.send('download', url, invoice.number)} className="hover:cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="folder-download"
              className="w-6 h-6 transition duration-75 hover:text-primary-500" fill="currentColor">
              <path d="M13.29,13.79l-.29.3V11.5a1,1,0,0,0-2,0v2.59l-.29-.3a1,1,0,0,0-1.42,1.42l2,2a1,1,0,0,0,.33.21.94.94,0,0,0,.76,0,1,1,0,0,0,.33-.21l2-2a1,1,0,0,0-1.42-1.42ZM19,5.5H12.72l-.32-1a3,3,0,0,0-2.84-2H5a3,3,0,0,0-3,3v13a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V8.5A3,3,0,0,0,19,5.5Zm1,13a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V5.5a1,1,0,0,1,1-1H9.56a1,1,0,0,1,.95.68l.54,1.64A1,1,0,0,0,12,7.5h7a1,1,0,0,1,1,1Z"></path>
            </svg>
          </div>
          <div onClick={selectPrinter} className="hover:cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="print"
              className="w-6 h-6 transition duration-75 hover:text-primary-500" fill="currentColor">
              <path d="M7,10a1,1,0,1,0,1,1A1,1,0,0,0,7,10ZM19,6H18V3a1,1,0,0,0-1-1H7A1,1,0,0,0,6,3V6H5A3,3,0,0,0,2,9v6a3,3,0,0,0,3,3H6v3a1,1,0,0,0,1,1H17a1,1,0,0,0,1-1V18h1a3,3,0,0,0,3-3V9A3,3,0,0,0,19,6ZM8,4h8V6H8Zm8,16H8V16h8Zm4-5a1,1,0,0,1-1,1H18V15a1,1,0,0,0-1-1H7a1,1,0,0,0-1,1v1H5a1,1,0,0,1-1-1V9A1,1,0,0,1,5,8H19a1,1,0,0,1,1,1Z"></path>
            </svg>
          </div>
          {/* <div onClick={share} className="hover:cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 24 24" id="share" className="w-6 h-6 transition duration-75 hover:text-primary-500" fill="currentColor">
              <path d="m21.707 11.293-8-8A1 1 0 0 0 12 4v3.545A11.015 11.015 0 0 0 2 18.5V20a1 1 0 0 0 1.784.62 11.456 11.456 0 0 1 7.887-4.049c.05-.006.175-.016.329-.026V20a1 1 0 0 0 1.707.707l8-8a1 1 0 0 0 0-1.414ZM14 17.586V15.5a1 1 0 0 0-1-1c-.255 0-1.296.05-1.562.085a14.005 14.005 0 0 0-7.386 2.948A9.013 9.013 0 0 1 13 9.5a1 1 0 0 0 1-1V6.414L19.586 12Z"></path>
            </svg>
          </div> */}
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
      <div
        className={
          "fixed top-0 left-0 h-screen w-full z-50 flex justify-center items-center overflow-hidden transition-all ease-in-out bg-black/50 " +
          (!print && "hidden")
        }
      // onClick={() => setPrint(!print)}
      >
        <div className="p-6 space-y-2 bg-white rounded-lg w-96">
          <div className="flex justify-between">
            <h2 className="text-xl font-semibold">Kies een printer</h2>
            <div className="hover:cursor-pointer" onClick={() => setPrint(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 512 512">
                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M368 368L144 144M368 144L144 368" />
              </svg>
            </div>
          </div>
          <select name="" id="" onChange={(e) => setPrinter(e.target.value)} value={printer} className="w-full px-3 py-2 bg-gray-200 rounded-lg">
            {printers.length > 1 && printers.map((item, index) => (
              <option key={index} value={item['name']}>{item['displayName']}</option>
            ))}
          </select>
          <div className="flex justify-end w-full">
            <div className="" onClick={startPrint}>
              <Button slot="Printen" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}