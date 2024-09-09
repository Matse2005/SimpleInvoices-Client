import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const TitleBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State to manage menu visibility
  const [isMenuButtonVisible, setIsMenuButtonVisible] = useState(false); // State to manage menu button visibility
  const menuRef = useRef(null); // Reference for the menu to detect outside clicks

  const handleMinimize = () => window.ipc.minimize();
  const handleMaximize = () => window.ipc.maximize();
  const handleClose = () => window.ipc.close();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false); // Close the menu if clicked outside
      }
    };

    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Unbind the event listener on cleanup
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  // Effect to handle key combination to show/hide menu button
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'M') {
        setIsMenuButtonVisible((prevVisible) => !prevVisible); // Toggle visibility
      }
    };

    // Add event listener for keydown
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      // Remove event listener on cleanup
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="z-20 flex items-center justify-between w-full h-8" style={{ WebkitAppRegion: 'drag' }}>
      <div className="z-20 flex items-center">
        {/* Menu Button */}
        {isMenuButtonVisible && (
          <div className="relative z-20" style={{ WebkitAppRegion: 'no-drag' }}>
            <button
              className="flex items-center justify-center w-10 h-8 text-gray-400 hover:bg-gray-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 512 512"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-miterlimit="10" stroke-width="32" d="M80 160h352M80 256h352M80 352h352" /></svg>
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div ref={menuRef} className="absolute left-0 z-10 py-2 mt-2 text-xs text-black bg-gray-100 rounded">
                <ul className="w-full py-1">
                  <li className='w-full'>
                    <Link href={"/setup"}
                      className="w-full px-4 py-2 hover:bg-gray-200"
                    >
                      Instellingen
                    </Link>
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}

        <div className={(!isMenuButtonVisible ? "px-3" : "") + " font-semibold text-gray-600"} >Simpele Facturen</div>
      </div>
      <div className="flex item-center">
        <button
          onClick={handleMinimize}
          className="flex items-center justify-center w-10 h-8 text-gray-400 hover:bg-gray-200"
          style={{ WebkitAppRegion: 'no-drag' }} // Exclude button from dragging
        >
          {/* Corrected SVG for Minimize */}
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 512 512">
            <path
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="32"
              d="M400 256H112"
            />
          </svg>
        </button>
        <button
          onClick={handleMaximize}
          className="flex items-center justify-center w-10 h-8 text-gray-400 hover:bg-gray-200"
          style={{ WebkitAppRegion: 'no-drag' }} // Exclude button from dragging
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /></svg>
        </button>
        <button
          onClick={handleClose}
          className="flex items-center justify-center w-10 h-8 text-gray-400 hover:text-white hover:bg-red-700"
          style={{ WebkitAppRegion: 'no-drag' }} // Exclude button from dragging
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      </div>
    </div>
  );
};

export default TitleBar;
