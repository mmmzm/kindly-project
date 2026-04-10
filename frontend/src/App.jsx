import { useState } from "react";
import Login from "./pages/Login";
import Reservation from "./pages/Reservation";
import Admin from "./pages/Admin";

function App() {
  const [reservations, setReservations] = useState([]);

  return (
    <div>
      <h1>Kindly</h1>

      <Reservation
        reservations={reservations}
        setReservations={setReservations}
      />

      <Admin reservations={reservations} />
    </div>
  );
}

export default App;