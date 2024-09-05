import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import Invoice from '../../components/Invoice'
import { useRouter } from 'next/router';
import fetch from '../../lib/fetch';

export default function InvoicePage() {
  // const [invoice, setInvoice] = useState<any[] | boolean>(false);
  const router = useRouter();
  const id = router.query.id;
  const [invoice, setInvoice] = useState({});
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
    getInvoice()
  }, [config]);

  const getInvoice = async () => {
    // if (id) {

    // } else {
    //   console.log(invoiceQuery)
    //   setInvoice(JSON.parse(invoiceQuery));
    // }
    try {
      const fetchedData = await fetch.getInvoice({ server: config['server'], key: config['key'] }, id);
      setInvoice(fetchedData);
      console.log(fetchedData)
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  }

  return (
    <React.Fragment>
      <Head>
        <title>Factuur {invoice['number']}</title>
      </Head>
      <div className="mx-auto">
        <Invoice invoice={invoice} />
      </div>
    </React.Fragment >
  )
}
