import { useState } from "react"

function App() {
  const [wpm, setWpm] = useState(0)

  return (
    <div className="pt-16 pb-64 bg-neutral-900 flex flex-col items-center">
      <h1 className="text-3xl text-white font-bold">
        <span className="text-green-500">Code</span>
        Typer
      </h1>
      
    </div>
  )
}

export default App
