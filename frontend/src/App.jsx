import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Reservation from "./pages/Reservation";
import ReservationCheck from "./pages/ReservationCheck";
import AdminLogin from "./pages/AdminLogin";
import AdminReservations from "./pages/AdminReservations";
import AdminCustomers from "./pages/AdminCustomers";
import AdminManagers from "./pages/AdminManagers";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reservation" element={<Reservation />} />
        <Route path="/reservation-check" element={<ReservationCheck />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/reservations" element={<AdminReservations />} />
        <Route path="/admin/customers" element={<AdminCustomers />} />
        <Route path="/admin/managers" element={<AdminManagers />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;