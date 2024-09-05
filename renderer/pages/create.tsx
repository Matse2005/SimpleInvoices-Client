import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ky from 'ky';
import Button from '../components/Button';
import fetch from '../lib/fetch';
import { error } from 'console';

export default function InvoicesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState([]);
  const [step, setStep] = useState(1); // Step state for multi-step form
  const [errors, setErrors] = useState({});
  const [fields, setFields] = useState({
    author_id: 1,
    location_id: 1,
    number: Number(router.query.next) ?? 1,
    date: new Date().toISOString().split('T')[0],
    btw_number: null,
    items: [
      {
        description: '',
        amount: null,
        price: null,
        btw_percent: 21,
        btw: 0,
        total: 0,
      }
    ],
    customer: Array(4).fill(null),
    port: null,
    no_btw: 0,
  });
  const [config, setConfig] = useState(null)

  const getConfig = async () => {
    try {
      if (config !== null) {
        const config = await fetch.getConfig();
        setConfig(config);
      }
    } catch (err) {
      console.log('Error: ', err.message);
    }
  };

  useEffect(() => {
    getConfig()
  }, []);

  useEffect(() => {
    fetchData()
  }, [config]);

  const fetchData = async () => {
    try {
      const fetchedLocations = await fetch.locations({ server: config['server'], key: config['key'] });
      setData(fetchedLocations);
      console.log(fetchedLocations)
      setLoading(false);
    } catch (e) {
      console.error('Error fetching locations:', e);
    }
  };

  const changeField = (field, value, item = null, text = false) => {
    setFields((prevFields) => {
      const updatedFields = { ...prevFields };
      if (item === null) {
        updatedFields[field] = value === null ? null : value == '' ? null : !isNaN(Number(value)) && !text ? Number(value) : value;
      } else {
        updatedFields[field][item] = value === null ? null : value == '' ? null : !isNaN(Number(value)) && !text ? Number(value) : value;
      }
      return updatedFields;
    });

    // Update errors
    setErrors((prevErrors) => {
      const updatedErrors = { ...prevErrors };

      if (item === null) {
        // If the updated field has no error or is now valid, remove the error
        if (updatedErrors[field]) {
          delete updatedErrors[field];
        }
      } else {
        // Handle errors within nested fields (like items)
        const itemKey = `${field}[${item}]`;

        // Check if the item has errors and remove them if the value is valid
        if (updatedErrors[itemKey]) {
          delete updatedErrors[itemKey];
        }
      }

      return updatedErrors;
    });
  };

  const changeItem = (key, value: any, index: number, text: boolean = false) => {
    const updatedItems = [...fields.items];

    // Allow empty string to represent a cleared input, otherwise convert to number if possible
    const convertedValue = value === null ? null : value === '' ? '' : !isNaN(Number(value)) && !text ? Number(value) : value;

    // Update the specific field value
    updatedItems[index][key] = convertedValue;

    // Calculate BTW and Total for the updated item
    const amount = Number(updatedItems[index].amount) || 0;
    const price = Number(updatedItems[index].price) || 0;

    // Assuming a fixed BTW rate (e.g., 21%)
    const btwRate = 0.21;
    updatedItems[index].btw = amount * price * btwRate;
    updatedItems[index].total = amount * price + updatedItems[index].btw;

    // Add a new item if the last item is being filled
    if (index === updatedItems.length - 1 && value !== '') {
      updatedItems.push({
        description: '',
        amount: 0,
        price: 0,
        btw_percent: 21,
        btw: 0,
        total: 0
      });
    }

    setFields({ ...fields, items: updatedItems });
  };

  const removeItem = (index) => {
    const newItems = fields.items.filter((_, i) => i !== index);
    changeField('items', newItems);
  };

  const validateForm = (forms = fields) => {
    const newErrors = {};

    // Validate Invoice Details (Step 1)
    if (!forms.number) {
      newErrors['number'] = (newErrors['number'] || []).concat('Factuur nummer is verplicht.');
    }
    if (!forms.date) {
      newErrors['date'] = (newErrors['date'] || []).concat('Datum is verplicht.');
    }
    if (!forms.port) {
      newErrors['port'] = (newErrors['port'] || []).concat('Port is verplicht.');
    }

    // Validate Customer Details (Step 2)
    if (!forms.customer[0] || !forms.customer[1] || !forms.customer[2] || !forms.customer[3]) {
      newErrors['customerName'] = (newErrors['customerName'] || []).concat('Klant informatie is verplicht.');
    }
    if (!forms.btw_number) {
      newErrors['btw_number'] = (newErrors['btw_number'] || []).concat('Klant BTW Nummer is verplicht.');
    }

    // Validate Items (Step 3)
    forms.items.forEach((item, index) => {
      if (!item.description) {
        newErrors[`items[${index}].description`] = (newErrors[`items[${index}].description`] || []).concat('Beschrijving is verplicht.');
      }
      if (!item.amount || item.amount <= 0) {
        newErrors[`items[${index}].amount`] = (newErrors[`items[${index}].amount`] || []).concat('Aantal moet groter zijn dan 0.');
      }
      if (!item.price) {
        newErrors[`items[${index}].price`] = (newErrors[`items[${index}].price`] || []).concat('Prijs is verplicht');
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if there are no errors
  };



  const saveData = async () => {
    setSaving(true);

    const postData = { ...fields, items: [...fields.items] };
    const latestItem = postData.items[postData.items.length - 1];

    if (latestItem && Object.values(latestItem).every(value => value === 0 || value === '' || value == 21 || value == null)) {
      postData.items.pop();
    }

    if (!validateForm(postData)) {
      setSaving(false);
      return;
    }

    try {
      await ky.post(config.server + '/api/invoice', {
        headers: { Authorization: "Bearer " + config.key },
        json: postData
      }).json();

      router.push('/invoices');
      setSaving(false);
    } catch (e) {
      console.error('Error saving invoice:', e);
    }

    console.log(postData)
  };

  const handleNextStep = () => setStep(step + 1);
  const handlePreviousStep = () => setStep(step - 1);

  return (
    <>
      <Head>
        <title>Facturen Aanmaken</title>
      </Head>
      <div className="flex w-full h-screen p-5">
        {loading ? (
          <div className="flex justify-center w-full max-h-screen p-10 overflow-y-hidden">
            <div className="flex items-center justify-center w-full h-full text-center">
              <div role="status" className='flex flex-col items-center gap-y-3'>
                <svg aria-hidden="true" className="inline w-8 h-8 text-gray-200 animate-spin fill-primary-600"
                  viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor" />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill" />
                </svg>
              </div>
            </div>
          </div>
        ) : (
          <div className='flex flex-col w-full max-w-screen-md mx-auto gap-y-6'>
            {/* Step Navigation */}
            <div className="flex justify-between w-full">
              <div onClick={() => router.back()}>
                <Button type='secondary' slot="Annuleren" />
              </div>
              <div onClick={!saving ? (step === 3 ? saveData : handleNextStep) : null}>
                <Button disabled={step != 3} slot={saving ? (
                  <div className="flex items-center gap-x-2">
                    <svg aria-hidden="true" className="inline w-4 h-4 text-gray-200 animate-spin fill-white"
                      viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="currentColor" />
                      <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="currentFill" />
                    </svg>
                    Opslaan...
                  </div>
                ) : 'Opslaan'} />
              </div>
            </div>

            {Object.keys(errors).length > 0 && (
              <div className="p-4 text-red-500 bg-red-100 rounded-lg">
                <p>Er zijn nog een aantal fouten gevonden, los deze eerst op en sla daarna op.</p>
              </div>
            )}

            {/* Multi-Step Form */}
            <div className='flex flex-col gap-y-2'>
              {step === 1 && (
                <>
                  <h2 className='text-2xl font-semibold'>Factuurgegevens</h2>
                  <div className='grid grid-cols-2 gap-3'>
                    <div className="flex flex-col text-base font-semibold">
                      <label htmlFor="btw">Nummer</label>
                      <input className='px-3 py-2 bg-gray-200 rounded-lg disabled:text-gray-500 disabled:hover:cursor-not-allowed' defaultValue={fields['number'] ?? ''} onChange={(e) => changeField('number', e.target.value)} type="number" min="0" name="number" id="number" disabled={fields.number !== null && fields.number !== 1} />
                      {errors['number'] && errors['number'].map((error, index) => (
                        <small className='text-red-500' key={index}>{error}</small>
                      ))}
                    </div>
                    <div className="flex flex-col text-base font-semibold">
                      <label htmlFor="btw">Datum</label>
                      <input className='px-3 py-2 bg-gray-200 rounded-lg disabled:text-gray-500 disabled:hover:cursor-not-allowed' value={fields['date'] ?? ''} onChange={(e) => changeField('date', e.target.value)} type="date" name="date" id="date" />
                    </div>
                    <div className="flex flex-col text-base font-semibold">
                      <label htmlFor="number">BTW op de marge?</label>
                      <select value={fields.no_btw ?? 0} required onChange={(e) => changeField('no_btw', parseInt(e.target.value))} name="no_btw" id="no_btw" className='px-3 py-2 bg-gray-200 rounded-lg disabled:text-gray-500 disabled:hover:cursor-not-allowed'>
                        <option value={0}>Neen</option>
                        <option value={1}>Ja</option>
                      </select>
                    </div>
                    <div className="flex flex-col text-base font-semibold">
                      <label htmlFor="port">Port (€)</label>
                      <input required step='0.01' onChange={(e) => changeField('port', e.target.value)} className='px-3 py-2 bg-gray-200 rounded-lg disabled:text-gray-500 disabled:hover:cursor-not-allowed' type="number" min="0" name="port" id="port" value={fields['port'] ?? null} placeholder='Port in euro' />
                      {errors['port'] && errors['port'].map((error, index) => (
                        <small className='text-red-500' key={index}>{error}</small>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col text-base font-semibold">
                    <label htmlFor="btw">Locatie</label>
                    <select value={fields.location_id ?? 1} className='px-3 py-2 bg-gray-200 rounded-lg disabled:text-gray-500 disabled:hover:cursor-not-allowed' defaultValue={fields['location_id'] ?? ''} onChange={(e) => changeField('location_id', e.target.value, true)} id="location_id">
                      {data.map((loc) => (
                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                      ))}
                    </select>
                    <small>Deze locatie zal niet zichbaar zijn op het factuur</small>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <h2 className='text-2xl font-semibold'>Klantgegevens</h2>
                  <div className="flex w-full gap-x-4">
                    <div className="flex flex-col w-full text-base font-semibold gap-y-1">
                      <label htmlFor="btw">Klant</label>
                      {fields.customer.map((value, i) => (
                        <input className='px-3 py-2 bg-gray-200 rounded-lg disabled:text-gray-500 disabled:hover:cursor-not-allowed' key={`customer_${i}`} value={value ?? ''} onChange={(e) => changeField('customer', e.target.value, i, true)} type="text" name={`customer_${i}`} placeholder={'Lijn ' + (i + 1)} id={`customer_${i}`} />
                      ))}
                      {errors['customerName'] && errors['customerName'].map((error, index) => (
                        <small className='text-red-500' key={index}>{error}</small>
                      ))}
                    </div>
                    <div className="flex flex-col w-full gap-y-4">
                      <div className="flex flex-col text-base font-semibold gap-y-1">
                        <label htmlFor="btw">BTW Nr. Klant</label>
                        <input required placeholder='BE123456789' onChange={(e) => changeField('btw_number', e.target.value, true)} value={fields['btw_number']} className='px-3 py-2 bg-gray-200 rounded-lg disabled:text-gray-500 disabled:hover:cursor-not-allowed' type="text" name="btw" id="btw" />
                      </div>
                      {errors['btw_number'] && errors['btw_number'].map((error, index) => (
                        <small className='text-red-500' key={index}>{error}</small>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <h2 className='text-2xl font-semibold'>Factuur Items</h2>
                  {fields.items.map((item, index) => (
                    <div key={index} className={'grid gap-3 p-3 bg-gray-100 rounded-xl ' + (index < fields.items.length - 1 ? 'grid-cols-4' : "grid-cols-4")}>
                      <div className="flex flex-col text-base font-semibold col-span-full">
                        <label htmlFor="btw">Beschrijving</label>
                        <input className='px-3 py-2 bg-gray-200 rounded-lg disabled:text-gray-500 disabled:hover:cursor-not-allowed' value={item.description ?? ''} onChange={(e) => changeItem('description', e.target.value, index, true)} type="text" name={`item_description_${index}`} id={`item_description_${index}`} />
                        {errors[`items[${index}].description`] && errors[`items[${index}].description`].map((error, index) => (
                          <small className='text-red-500' key={index}>{error}</small>
                        ))}
                      </div>
                      <div className="flex flex-col text-base font-semibold">
                        <label htmlFor="btw">Aantal</label>
                        <input className='px-3 py-2 bg-gray-200 rounded-lg disabled:text-gray-500 disabled:hover:cursor-not-allowed' value={item.amount ?? 0} onChange={(e) => changeItem('amount', e.target.value, index)} type="number" min="0" name={`item_amount_${index}`} id={`item_amount_${index}`} />
                        {errors[`items[${index}].amount`] && errors[`items[${index}].amount`].map((error, index) => (
                          <small className='text-red-500' key={index}>{error}</small>
                        ))}
                      </div>
                      <div className="flex flex-col text-base font-semibold">
                        <label htmlFor="btw">Prijs (€)</label>
                        <input className='px-3 py-2 bg-gray-200 rounded-lg disabled:text-gray-500 disabled:hover:cursor-not-allowed' value={item.price ?? 0} onChange={(e) => changeItem('price', e.target.value, index)} type="number" min="0" name={`item_price_${index}`} id={`item_price_${index}`} />
                        {errors[`items[${index}].price`] && errors[`items[${index}].price`].map((error, index) => (
                          <small className='text-red-500' key={index}>{error}</small>
                        ))}
                      </div>
                      <div className="flex flex-col text-base font-semibold">
                        <label htmlFor={"item_btw_" + index}>BTW %</label>
                        <select onChange={(e) => changeItem('btw_percent', parseFloat(e.target.value), index)} value={item.btw_percent ?? 21}
                          className='w-full px-3 py-2 bg-gray-200 rounded-lg disabled:text-gray-500 disabled:hover:cursor-not-allowed' name={"item_btw_" + index} id={"item_btw_" + index}>
                          <option value="21">21%</option>
                          <option value="6">6%</option>
                          <option value="0">0%</option>
                        </select>
                      </div>
                      <div className="flex flex-col text-base font-semibold">
                        <label className='invisible'>Remove</label>
                        <button className='w-full px-3 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:bg-red-400 disabled:hover:bg-red-400 disabled:hover:cursor-not-allowed' type="button" onClick={() => index < fields.items.length - 1 ? removeItem(index) : null} disabled={index >= fields.items.length - 1}>Verwijderen</button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <div onClick={step > 1 ? handlePreviousStep : null}><Button disabled={step <= 1} type="button" slot="Vorige" /></div>
              <div onClick={step < 3 ? handleNextStep : null}><Button disabled={step >= 3} type="button" slot="Volgende" /></div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
