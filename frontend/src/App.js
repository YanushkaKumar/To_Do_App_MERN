import { BrowserRouter, Route, Routes } from "react-router-dom";
import Registration from "./Registration";
import Login from "./Login";
import Tasks from "./Tasks";

function App() {
  return (
    <BrowserRouter>
      <Routes>
      <Route path="/" element={<Login />} />
        <Route path="/registration" element={<Registration/>} />
        <Route path="/tasks" element={<Tasks />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
