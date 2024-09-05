export default function Button({ slot, type = "primary", className = "", disabled = false }) {
  var css = ""
  switch (type) {
    case "secondary":
      css = "bg-gray-200 hover:bg-gray-300 text-gray-700 disabled:bg-gray-400 disabled:hover:bg-gray-400"
      break;
    default:
      css = "bg-primary-500 hover:bg-primary-600 text-white disabled:bg-primary-400 disabled:hover:bg-primary-400"
      break;
  }

  return (
    <button disabled={disabled} type="submit" className={"px-3 py-2 transition-all rounded-lg font-semibold disabled:hover:cursor-not-allowed " + css + " " + className}>
      {slot}
    </button>
  )
}