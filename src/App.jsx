import { useState } from "react";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
// import Canvas from "./canvas";
// import Canvas from "./canvas2";
import Canvas from "./canvas3";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Canvas height={500} width={500} />
    </>
  );
}

export default App;
