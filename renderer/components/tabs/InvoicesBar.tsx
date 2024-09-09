export default function InvoicesBar({ invoices, invoice, getInvoice }) {
  return (
    <aside
      id="emails"
      className="fixed z-40 h-screen transition-transform -translate-x-full border-r-2 top-8 w-96 left-64 sm:translate-x-0 border-r-gray-200"
      aria-label="Sidebar"
    >
      <div className="h-full px-3 py-4 overflow-y-hidden transition-all bg-white hover:overflow-y-auto ">
        <ul className="space-y-2 font-medium">
          {invoices.map((item, index) => (
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
  )
}