import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import Button from '../components/Button';
import ky from 'ky'
import { useRouter } from 'next/router';
import fetch from '../lib/fetch';

export default function InvoicePage() {
  // const store = Store.initRenderer();
  const router = useRouter();
  const [server, setServer] = useState('');
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([])
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
    setServer(config !== null && config.server !== null ? config.server : '')
    setKey(config !== null && config.key !== null ? config.key : '')
  }, [config]);

  // Clear errors whenever server or key changes
  useEffect(() => {
    setErrors([]); // Clear errors when server or key changes
  }, [server, key]);

  const verify = async () => {
    setLoading(true);

    try {
      // First, check if the server URL has the /api/verify endpoint
      const endpointCheckResponse = await ky.get(`${server}/api/verify`, { timeout: 5000 });

      // If the endpoint is not found, handle the 404 error
      if (endpointCheckResponse.status === 404) {
        console.error('API endpoint /api/verify not found on server:', server);
        setErrors([...errors, server + " is geen geldige server."])
        return false; // Endpoint does not exist
      }

      // Now, verify the API key by sending it to the endpoint
      const verificationResponse = await ky.post(`${server}/api/verify`, {
        json: { key: key },
        timeout: 5000
      }).json<any>();

      if (verificationResponse.valid) {
        console.log('API key is valid ', verificationResponse);
        save({
          server: server,
          key: key,
          author: verificationResponse['author']
        })
        router.push('/welcome')
        return true; // Key is valid
      } else {
        console.error('API key is invalid');
        setErrors([...errors, key + " is geen geldige API Key."])
        return false; // Key is invalid
      }
    } catch (error) {
      console.error('Error verifying API key or endpoint:', error.message);
      setErrors([...errors, server + " is geen geldige server."])
      return false;
    } finally {
      setLoading(false)
    }
  };

  const save = (data) => {
    console.log('Data to save:', data);

    // Send data to the main process to save the configuration
    window.ipc.send('set-config', data);

    // Listen for the 'config' event to get the updated configuration
    window.ipc.once('config', (_event, newConf) => {
      console.log('Received config from main process:', newConf);
      setConfig(config);  // Assume setConfig is a state setter in React
    });

    // Request to get the updated configuration
    window.ipc.on('get-config', (_event, newConf) => {
      setConfig(newConf)
      console.log(newConf)
    });
    console.log('New ', config)
  };

  return (
    <React.Fragment>
      <Head>
        <title>Facturen</title>
      </Head>
      <div className="flex items-center justify-center h-full min-h-screen">
        <section className="flex flex-col items-center max-w-screen-sm mx-auto gap-y-5">
          <div className="flex flex-col w-full gap-y-3">
            <div className="">
              <svg xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 24 24" id="setting"
                className="h-24 p-3 mx-auto rounded-full bg-primary-200 text-primary-600">
                <path fill="currentColor"
                  d="M19.9 12.66a1 1 0 0 1 0-1.32l1.28-1.44a1 1 0 0 0 .12-1.17l-2-3.46a1 1 0 0 0-1.07-.48l-1.88.38a1 1 0 0 1-1.15-.66l-.61-1.83a1 1 0 0 0-.95-.68h-4a1 1 0 0 0-1 .68l-.56 1.83a1 1 0 0 1-1.15.66L5 4.79a1 1 0 0 0-1 .48L2 8.73a1 1 0 0 0 .1 1.17l1.27 1.44a1 1 0 0 1 0 1.32L2.1 14.1a1 1 0 0 0-.1 1.17l2 3.46a1 1 0 0 0 1.07.48l1.88-.38a1 1 0 0 1 1.15.66l.61 1.83a1 1 0 0 0 1 .68h4a1 1 0 0 0 .95-.68l.61-1.83a1 1 0 0 1 1.15-.66l1.88.38a1 1 0 0 0 1.07-.48l2-3.46a1 1 0 0 0-.12-1.17ZM18.41 14l.8.9-1.28 2.22-1.18-.24a3 3 0 0 0-3.45 2L12.92 20h-2.56L10 18.86a3 3 0 0 0-3.45-2l-1.18.24-1.3-2.21.8-.9a3 3 0 0 0 0-4l-.8-.9 1.28-2.2 1.18.24a3 3 0 0 0 3.45-2L10.36 4h2.56l.38 1.14a3 3 0 0 0 3.45 2l1.18-.24 1.28 2.22-.8.9a3 3 0 0 0 0 3.98Zm-6.77-6a4 4 0 1 0 4 4 4 4 0 0 0-4-4Zm0 6a2 2 0 1 1 2-2 2 2 0 0 1-2 2Z">
                </path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-center text-primary-600">Simpele Facturen - Installeren</h1>
            <p className="text-center text-gray-700">Voor je verder kan gaan met Simpele Facturen, moet je eerst een aantal
              instellingen instellen. Ben je
              niet de beheerder van je Simpele Facturen instantie? Vraag de waarde voor deze instellingen dan na bij
              de beheerder.</p>
          </div>
          <div className="flex flex-col w-full gap-y-4">
            {errors?.length > 0 && (
              <div className="px-5 py-3 text-sm text-red-600 bg-red-100 border border-red-600 rounded-lg">
                {errors.map((error, index) => (
                  <h4 key={index}>{error}</h4>
                ))}
              </div>
            )}
            <div className="">
              <label htmlFor="server" className="block mb-1 text-sm font-medium text-gray-700">Server</label>
              <div className="flex">
                <span
                  className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-gray-300 border-e-0 rounded-s-md ">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" className="w-4 h-4 text-gray-500">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M21.75 17.25v-.228a4.5 4.5 0 0 0-.12-1.03l-2.268-9.64a3.375 3.375 0 0 0-3.285-2.602H7.923a3.375 3.375 0 0 0-3.285 2.602l-2.268 9.64a4.5 4.5 0 0 0-.12 1.03v.228m19.5 0a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3m19.5 0a3 3 0 0 0-3-3H5.25a3 3 0 0 0-3 3m16.5 0h.008v.008h-.008v-.008Zm-3 0h.008v.008h-.008v-.008Z" />
                  </svg>
                </span>
                <input type="url" id="server" name="server" onChange={(e) => setServer(e.target.value)}
                  className="rounded-none rounded-e-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-primary-600 focus:border-primary-600 block flex-1 min-w-0 w-full text-sm p-2.5  "
                  placeholder="https://invoices.example.be" value={server ?? ''} />
              </div>
            </div>
            <div className="">
              <label htmlFor="key" className="block mb-1 text-sm font-medium text-gray-700">API Key</label>
              <div className="flex">
                <span
                  className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-gray-300 border-e-0 rounded-s-md ">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" className="w-4 h-4 text-gray-500">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
                  </svg>

                </span>
                <input type="text" id="key" name="key" onChange={(e) => setKey(e.target.value)}
                  className="rounded-none rounded-e-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-primary-600 focus:border-primary-600 block flex-1 min-w-0 w-full text-sm p-2.5  "
                  placeholder="?Qg2m2wngWO1ZpaLw/QIB?ExKMvX6l)b" value={key ?? ''} />
              </div>
            </div>
            <div className="w-full" onClick={!loading ? verify : null}>
              <Button className='w-full' slot={loading ? (
                <div className="flex items-center justify-center gap-x-2">
                  <svg aria-hidden="true" className="inline w-4 h-4 text-gray-200 animate-spin fill-white"
                    viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor" />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill" />
                  </svg>
                  Verifieren...
                </div>
              ) : 'Verifieer'} />
            </div>
          </div>
        </section>
      </div>
    </React.Fragment >
  )
}
