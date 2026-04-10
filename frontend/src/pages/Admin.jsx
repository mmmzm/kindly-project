import axios from "axios";
import { useEffect, useState } from "react";

function Admin() {
  const [reservations, setReservations] = useState([]);

  const fetchReservations = () => {
    axios
      .get("http://localhost:8080/reservations")
      .then((res) => {
        console.log("예약 목록:", res.data);
        setReservations(res.data);
      })
      .catch((err) => {
        console.error("조회 에러:", err);
      });
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const createReservation = () => {
    axios
      .post("http://localhost:8080/reservations", {
        userId: 1,
        treatmentId: 1,
        reservationDatetime: "2026-04-13T12:00:00",
        status: "RESERVED",
        delayStatus: "N",
        delayMessage: null
      })
      .then((res) => {
        console.log("등록 성공:", res.data);
        alert("예약 등록 완료");
        fetchReservations();
      })
      .catch((err) => {
        console.error("등록 에러:", err);
      });
  };

  const deleteReservation = (reservationId) => {
    axios
      .delete(`http://localhost:8080/reservations/${reservationId}`)
      .then((res) => {
        console.log("삭제 성공:", res.data);
        alert("예약 삭제 완료");
        fetchReservations();
      })
      .catch((err) => {
        console.error("삭제 에러:", err);
      });
  };

  return (
    <div>
      <h2>관리자 페이지</h2>

      <button onClick={createReservation}>예약 추가</button>

      {reservations.length === 0 ? (
        <p>예약 내역이 없습니다.</p>
      ) : (
        <ul>
          {reservations.map((item) => (
            <li key={item.reservationId}>
              예약번호: {item.reservationId} / 사용자: {item.userId} / 시술: {item.treatmentId} / 상태: {item.status}
              <button
                onClick={() => deleteReservation(item.reservationId)}
                style={{ marginLeft: "10px" }}
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Admin;