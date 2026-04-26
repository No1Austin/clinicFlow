import { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import "./App.css";


function App() {
  const hasToken = localStorage.getItem("token");
  const [page, setPage] = useState(hasToken ? "dashboard" : "login");

  return (
    <div>
      {page === "login" && <Login setPage={setPage} />}
      {page === "register" && <Register setPage={setPage} />}
      {page === "dashboard" && <Dashboard setPage={setPage} />}
    </div>
  );
}

export default App;