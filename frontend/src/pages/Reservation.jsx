import { useState } from "react";

function Reservation({ reservations, setReservations }) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const handleSubmit = () => {
    const newReservation = { name, date, time };
    setReservations([...reservations, newReservation]);
  };

  return (
    <div>
      <h2>예약하기</h2>

      <input
        type="text"
        placeholder="이름"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
      />

      <button onClick={handleSubmit}>예약하기</button>
    </div>
  );
}

export default Reservation;