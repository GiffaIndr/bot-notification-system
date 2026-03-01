import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import PrivateRoute from "./pages/PrivateRoute";
import RegisterAdmin from "./pages/RegisterAdmin";
import RegisterMember from "./pages/RegisterMember";
import NotificationPage from "./pages/NotificationPage";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const token = localStorage.getItem("token");
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
          <Route path="/register-admin" element={<RegisterAdmin />} />
          <Route path="/register-member" element={<RegisterMember />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route path="/notifications" element={<NotificationPage token={token} />}
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
