export default function Click({ slot }) {
  return (
    <div className="flex justify-center w-full max-h-screen p-10 overflow-y-hidden">
      <div className="flex items-center justify-center w-full h-full text-center">
        <div role="status" className="flex flex-col items-center gap-y-3">
          <span className="">{slot}</span>
        </div>
      </div>
    </div>
  )
}