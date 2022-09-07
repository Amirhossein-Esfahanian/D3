import { useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
// import Canvas from "./canvas";
import Canvas from "./canvas2";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <Canvas height={500} width={500} />
    </div>
  );
}

export default App;
