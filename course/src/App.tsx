import { Link, Route, Routes } from "react-router-dom";
import "./App.css";
import WelcomePage from "./welcome";


function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
    </Routes>
  );
}

export default App;