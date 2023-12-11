import { useState } from "react";
import "./App.css";
import dockerLogo from "./assets/docker.svg";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
        <a href="https://docker.com" target="_blank">
          <img src={dockerLogo} className="logo docker" alt="Docker logo" />
        </a>
      </div>
      <h1>
        <span style={{ color: "#1311fb" }}>Vite</span>+
        <span style={{ color: "#087ea4" }}>React</span>+{" "}
        <span style={{ color: "#7040c8" }}>Docker</span>
      </h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <a href="https://github.com/yracnet/vite-plugin-docker">
        Like to Plugin
        <code> https://github.com/yracnet/vite-plugin-docker</code>
      </a>
    </>
  );
}

export default App;
