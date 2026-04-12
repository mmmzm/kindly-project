import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Reservation from "./pages/Reservation";
import ReservationCheck from "./pages/ReservationCheck";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reservation" element={<Reservation />} />
        <Route path="/reservation-check" element={<ReservationCheck />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;