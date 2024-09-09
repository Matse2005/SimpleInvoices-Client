import Link from "next/link";
import Button from "../Button";
import { usePathname } from "next/navigation";

export default function Sidebar({ latest }) {
  const currentPath = usePathname();

  return (
    <aside
      id="sidebar"
      className="fixed left-0 z-40 w-64 h-screen transition-transform -translate-x-full border-r-2 top-8 border-r-gray-200 sm:translate-x-0"
      aria-label="Sidebar"
    >
      <div className="h-full px-3 py-4 space-y-4 overflow-y-auto bg-WHITE">
        <ul className="pb-4 space-y-2 font-medium border-b-2 border-b-gray-200">
          <Link href={'/manage?next=' + (latest + 1)}>
            <Button
              slot="Aanmaken" className="w-full" />
          </Link>
          <li>
            <Link
              href={"/invoices"}
              className={"flex items-center p-2 rounded-lg group hover:bg-gray-200 " + (currentPath === "/invoices/" ? "bg-gray-200" : "")}
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
        {/* <ul className="space-y-2 font-medium">
        {locations?.map((item, index) => (
          <li key={index}>
            <Link
              href={"/invoices/" + item['id']}
              className={"flex items-center p-2 rounded-lg group hover:bg-gray-200" + (currentPath === "/invoices/" + item['id'] ? "bg-gray-200" : "")}
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
            </Link>
          </li>
        ))}
      </ul> */}
      </div>
    </aside>
  )
}