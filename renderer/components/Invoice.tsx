// All changes that happen to this page should also be applied to the page on the server

export default function Invoice({ invoice }) {
  var total = 0;
  var btw = 0;
  var longer = 0;

  return (
    <main className='h-full space-y-5 font-roboto' style={{
      printColorAdjust: "exact"
    }}>
      <section className="flex items-center justify-between">
        <h1 className="text-4xl font-semibold print:text-3xl">Diederik Dezittere</h1>
        <div className="flex flex-col justify-center py-3 text-xs print:text-[10px] text-right">
          <p className="">B.T.W Nr.: BE 636.299.412</p>
          <p className="">H.R.L 83.419 - H.R.H 55.17</p>
        </div>
      </section>

      <section className="grid grid-cols-2">
        <div className="text-sm print:text-xs">
          <ul className="font-semibold ">
            {/* <li>
              Groothandel & Detailhandel
            </li> */}
            <li>
              Keulestraat 20
            </li>
            <li>
              3390 Tielt (Brabant)
            </li>
            <li>
              Tel. 016/63.34.58
            </li>
            <li>
              GSM. 0475/23.69.17
            </li>
            <li>
              Fax. 016/63.10.19
            </li>
            <li>
              E-mail: diederik@dezittere.be
            </li>
            <li>
              BIC: GEBABEBB
            </li>
            <li>
              IBAN: BE04 2300 2703 5031
            </li>
          </ul>
        </div>
        {/* <div className="">
          <ul className="text-sm font-semibold">
            <li>
              Detailhandel
            </li>
            <li>
              Gallerij 'De Ware Vrienden'
            </li>
            <li>
              Maastrichterstraat 1 bus 24
            </li>
            <li>
              3500 Hasselt
            </li>
            <li>
              Tel. & Fax.: 011/22.58.10
            </li>
          </ul>
        </div> */}
        <div className="flex items-center justify-start w-full h-full print:text-sm">
          <ul className="">
            {invoice['customer']?.map((item, index) => (
              <li key={index}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="space-y-1">
        <section className="grid grid-cols-2">
          <div className="py-3 text-center border-2 border-black">
            <h1 className="text-2xl font-semibold print:text-xl">Factuur</h1>
          </div>
        </section>

        <div className="">
          <section className="grid grid-cols-3 text-sm border-t border-black print:text-xs border-x">
            <div className="p-2 space-y-1 border border-black">
              <p>Datum:</p>
              <p className="font-semibold text-center">
                {new Date(invoice['date']).toLocaleDateString('nl-BE')}
              </p>
            </div>
            <div className="p-2 space-y-1 border border-black">
              <p>Factuur Nr.:</p>
              <p className="font-semibold text-center">{invoice['number']}</p>
            </div>
            <div className="p-2 space-y-1 border border-black">
              <p>BTW Nr. Klant:</p>
              <p className="font-semibold text-center">{invoice['btw_number']}</p>
            </div>
          </section>

          <section className="grid grid-cols-32 text-xs print:text-[10px] border-black border-x">
            <div className="p-2 space-y-1 text-center border border-black col-span-15">
              <p>Omschrijving</p>
            </div>
            <div className="col-span-3 p-2 space-y-1 text-center border border-black">
              <p>Aantal</p>
            </div>
            <div className="col-span-4 p-2 space-y-1 text-center border border-black">
              <p>Prijs</p>
            </div>
            <div className="col-span-3 p-2 space-y-1 text-center border border-black">
              <p>BTW %</p>
            </div>
            <div className="col-span-4 p-2 space-y-1 text-center border border-black">
              <p>Bedrag</p>
            </div>
          </section>

          <section className="flex flex-col text-[10px] print:text-[8px] border border-black">
            {invoice['items']?.map((item, index) => {
              total += item['price']
              btw += item['price'] / 100 * item['btw_percent']
              longer += ~~(item['description'].length / 80)

              return (
                <div className="grid items-center grid-cols-32" key={index}>
                  <div className="p-1 space-y-1 border-black col-span-15 border-x">
                    <p>{item['description']}</p> {/* Max 65 characters */}
                  </div>
                  <div className="col-span-3 p-1 space-y-1 text-right border-black border-x">
                    <p>{item['amount']}/st/pc</p>
                  </div>
                  <div className="p-1 col-span-4 space-y-1 col-span-1.5 text-right border-black border-x">
                    <p>{item['price'].toFixed(2).replace('.', ',')} EUR</p>
                  </div>
                  <div className="col-span-3 p-1 space-y-1 text-right border-black border-x">
                    <p>{item['btw_percent'].toFixed(2).replace('.', ',')}</p>
                  </div>
                  <div className="col-span-4 p-1 space-y-1 text-right border-black border-x">
                    <p>{item['total'].toFixed(2).replace('.', ',')} EUR</p>
                  </div>
                </div>)
            })}

            {[...Array(24 - (invoice['items']?.length ?? 0) - longer)].map((_, index) => (
              <div className="grid h-5 grid-cols-32" key={index}>
                <div className="space-y-1 border-black col-span-15 border-x"></div>
                <div className="col-span-3 border-black border-x"></div>
                <div className="col-span-4 border-black border-x"></div>
                <div className="col-span-3 border-black border-x"></div>
                <div className="col-span-4 border-black border-x"></div>
              </div>
            ))}
            {/* <div className="grid h-auto grid-cols-9">
              <div className="h-4 col-span-5 p-2 space-y-1 border-black border-x">
              </div>
              <div className="h-4 p-2 space-y-1 text-right border-black border-x">
              </div>
              <div className="h-4 p-2 space-y-1 text-right border-black border-x">
              </div>
              <div className="h-4 p-2 space-y-1 text-right border-black border-x">
              </div>
              <div className="h-4 p-2 space-y-1 text-right border-black border-x">
              </div>
            </div> */}
          </section>

          <section className="grid grid-cols-32 text-xs print:text-[10px] border border-t-0 border-black">
            <div className="grid grid-cols-6 p-2 border border-black col-span-15">
              {invoice['no_btw'] ? (
                <div className="col-span-5">
                  <p>Leveringen onderworpen aan de bijzondere regeling van de heffing over de marge BTW niet
                    aftrekbaar.</p>
                  <p>Livraison soumise au regime particulier d'imposition de la marge TVA non deductible.</p>
                </div>
              ) : null}
            </div>
            <div className="col-span-7 p-2 text-center border border-black">
              <p>Netto</p>
              <p>BTW</p>
              <p>Port</p>
              <br />
              <p className="text-sm font-semibold print:text-xs">Te betalen</p>
            </div>
            <div className="col-span-7 p-2 text-right border border-black">
              <p>{total.toFixed(2).replace('.', ',')} EUR</p>
              <p>{btw.toFixed(2).replace('.', ',')} EUR</p>
              <p>{invoice['port']?.toFixed(2).replace('.', ',')} EUR</p>
              <br />
              <p className="text-sm font-semibold print:text-xs">{((total + btw + invoice['port'] ?? 0)).toFixed(2).replace('.', ',')} EUR</p>
            </div>
          </section>
        </div>
      </div >
    </main >
  )
}