import { useState } from 'react';

export default function FormattedInput() {
  const [value, setValue] = useState('');

  const handleChange = (e) => {
    let input = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); // Remove invalid characters

    // Insert dots at the correct positions based on the input length
    if (input.length > 2) {
      input = input.slice(0, 2) + input.slice(2, 5);
    }
    if (input.length > 5) {
      input = input.slice(0, 5) + '.' + input.slice(5, 8);
    }
    if (input.length > 8) {
      input = input.slice(0, 8) + '.' + input.slice(8, 11);
    }
    if (input.length > 11) {
      input = input.slice(0, 11) + '.' + input.slice(11, 14);
    }

    setValue(input);
  };

  return (
    <input
      type="text"
      maxLength={14}
      value={value}
      onChange={handleChange}
      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
      placeholder="AB123.456.789"
    />
  );
}
