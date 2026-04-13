import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AdminLayout from "../components/AdminLayout";

function AdminReservations() {
  const [reservations, setReservations] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return formatDate(now);
  });
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [isLoading, setIsLoading] = useState(false);
  const [processingNoShowId, setProcessingNoShowId] = useState(null);

  const dayLabels = ["일", "월", "화", "수", "목", "금", "토"];

  const treatmentMap = {
    1: "리프팅",
    2: "토닝",
    3: "보톡스",
    4: "제모",
  };

  function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function formatDateTime(dateTime) {
    if (!dateTime) return "-";

    const date = new Date(dateTime);
    if (Number.isNaN(date.getTime())) return dateTime;

    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");

    return `${y}-${m}-${d} ${hh}:${mm}`;
  }

  function getTime(dateTime) {
    if (!dateTime) return "";
    const date = new Date(dateTime);
    if (Number.isNaN(date.getTime())) return "";
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  }

  function formatPhone(phone) {
    if (!phone) return "-";
    const only = String(phone).replace(/-/g, "").trim();
    if (only.length !== 11) return phone;
    return `${only.slice(0, 3)}-${only.slice(3, 7)}-${only.slice(7)}`;
  }

  function getStatusLabel(status) {
    switch (status) {
      case "RESERVED":
        return "예약완료";
      case "NOSHOW":
        return "노쇼";
      case "CANCELLED":
        return "예약취소";
      case "DONE":
        return "방문완료";
      default:
        return status || "상태확인";
    }
  }

  const fetchReservations = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("http://localhost:8080/reservations");
      setReservations(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("관리자 예약 조회 실패:", error);
      alert("예약 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDate = new Date(year, month + 1, 0).getDate();
    const startWeekday = firstDay.getDay();

    const days = [];

    for (let i = 0; i < startWeekday; i += 1) {
      days.push(null);
    }

    for (let day = 1; day <= lastDate; day += 1) {
      days.push(new Date(year, month, day));
    }

    while (days.length < 42) {
      days.push(null);
    }

    return days;
  }, [currentMonth]);

  const selectedReservations = useMemo(() => {
    return reservations
      .filter((item) => {
        if (!item?.reservationDatetime) return false;
        return formatDate(new Date(item.reservationDatetime)) === selectedDate;
      })
      .sort(
        (a, b) => new Date(a.reservationDatetime) - new Date(b.reservationDatetime)
      );
  }, [reservations, selectedDate]);

  const summary = useMemo(() => {
    return {
      total: selectedReservations.length,
      noShow: selectedReservations.filter((r) => r.status === "NOSHOW").length,
      delay: selectedReservations.filter((r) => r.delayStatus === "Y").length,
    };
  }, [selectedReservations]);

  const dateStatusMap = useMemo(() => {
    const map = {};

    reservations.forEach((reservation) => {
      if (!reservation?.reservationDatetime) return;

      const dateKey = formatDate(new Date(reservation.reservationDatetime));

      if (!map[dateKey]) {
        map[dateKey] = {
          hasReservation: false,
          hasDelay: false,
        };
      }

      map[dateKey].hasReservation = true;

      if (reservation.delayStatus === "Y") {
        map[dateKey].hasDelay = true;
      }
    });

    return map;
  }, [reservations]);

  const selectDate = (date) => {
    if (!date) return;
    setSelectedDate(formatDate(date));
  };

  const changeMonth = (diff) => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + diff, 1)
    );
  };

  const handleNoShow = async (reservationId, customerName) => {
    const confirmed = window.confirm(
      `${customerName} 고객 예약을 노쇼 처리하시겠습니까?`
    );

    if (!confirmed) return;

    try {
      setProcessingNoShowId(reservationId);

      const res = await axios.put(
        `http://localhost:8080/reservations/${reservationId}/noshow`
      );

      alert(res.data?.message || "노쇼 처리되었습니다.");

      setReservations((prev) =>
        prev.map((item) =>
          item.reservationId === reservationId
            ? {
                ...item,
                status: "NOSHOW",
              }
            : item
        )
      );
    } catch (error) {
      console.error("노쇼 처리 실패:", error);

      const message =
        error.response?.data?.message || "노쇼 처리 중 오류가 발생했습니다.";

      alert(message);
    } finally {
      setProcessingNoShowId(null);
    }
  };

  return (
    <AdminLayout title="예약 관리">
      <div className="admin-reservation-grid refined">
        <section className="admin-card">
          <div className="admin-section-head">
            <h3>예약 캘린더</h3>
            <p>날짜를 선택하면 예약을 확인할 수 있습니다.</p>
          </div>

          <div className="admin-calendar-header">
            <button
              type="button"
              className="admin-calendar-nav-btn"
              onClick={() => changeMonth(-1)}
            >
              ‹
            </button>

            <strong>
              {currentMonth.getFullYear()}.{" "}
              {String(currentMonth.getMonth() + 1).padStart(2, "0")}
            </strong>

            <button
              type="button"
              className="admin-calendar-nav-btn"
              onClick={() => changeMonth(1)}
            >
              ›
            </button>
          </div>

          <div className="admin-calendar-weekdays">
            {dayLabels.map((d, index) => (
              <span
                key={d}
                className={index === 0 ? "sun" : index === 6 ? "sat" : ""}
              >
                {d}
              </span>
            ))}
          </div>

          <div className="admin-calendar-grid">
            {calendarDays.map((date, index) => {
              if (!date) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="admin-calendar-day empty"
                    aria-hidden="true"
                  />
                );
              }

              const formatted = formatDate(date);
              const statusInfo = dateStatusMap[formatted];
              const hasReservation = !!statusInfo?.hasReservation;
              const hasDelay = !!statusInfo?.hasDelay;

              return (
                <button
                  key={formatted}
                  type="button"
                  className={`admin-calendar-day ${
                    formatted === selectedDate ? "selected" : ""
                  }`}
                  onClick={() => selectDate(date)}
                >
                  <span className="admin-calendar-day-number">{date.getDate()}</span>

                  {hasReservation && (
                    <span
                      className={`admin-calendar-dot ${
                        hasDelay ? "delay" : ""
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <section className="admin-right-panel">
          <div className="admin-summary-grid">
            <div className="admin-summary-card">
              <p>예약</p>
              <strong>{summary.total}</strong>
            </div>
            <div className="admin-summary-card">
              <p>노쇼</p>
              <strong>{summary.noShow}</strong>
            </div>
            <div className="admin-summary-card delay">
              <p>지연</p>
              <strong>{summary.delay}</strong>
            </div>
          </div>

          <section className="admin-card admin-reservation-list-card">
            <div className="admin-section-head">
              <h3>예약 목록</h3>
              <p>
                선택 날짜: <strong>{selectedDate}</strong>
              </p>
            </div>

            {isLoading ? (
              <div className="admin-empty-box large">
                예약 목록을 불러오는 중입니다.
              </div>
            ) : selectedReservations.length === 0 ? (
              <div className="admin-empty-box large">
                해당 날짜에 예약이 없습니다.
              </div>
            ) : (
              <div className="admin-reservation-scroll-area">
                <div className="admin-reservation-card-list refined">
                  {selectedReservations.map((r) => (
                    <article
                      key={r.reservationId}
                      className={`admin-reservation-item refined ${
                        r.delayStatus === "Y" ? "delay" : ""
                      } ${r.status === "NOSHOW" ? "noshow" : ""}`}
                    >
                      <div className="admin-reservation-item-top">
                        <div className="admin-reservation-title-group">
                          <strong>{r.customerName}</strong>
                          <span className="admin-phone-top">
                            {formatPhone(r.phone)}
                          </span>
                        </div>

                        <div className="admin-reservation-badges">
                          <span className="admin-time-badge">
                            {getTime(r.reservationDatetime)}
                          </span>
                          <span
                            className={`admin-status-badge ${
                              r.status === "NOSHOW" ? "noshow" : ""
                            }`}
                          >
                            {getStatusLabel(r.status)}
                          </span>
                        </div>
                      </div>

                      <div className="admin-reservation-meta-grid">
                        <div className="admin-reservation-meta-card">
                          <span>예약 일시</span>
                          <strong>{formatDateTime(r.reservationDatetime)}</strong>
                        </div>

                        <div className="admin-reservation-meta-card">
                          <span>예약 시술</span>
                          <strong>
                            {treatmentMap[r.treatmentId] || "시술 미확인"}
                          </strong>
                        </div>
                      </div>

                      {r.delayStatus === "Y" && (
                        <div className="admin-delay-box refined">
                          <strong>지연 알림</strong>
                          <p>{r.delayMessage || "지연 알림 메시지가 있습니다."}</p>
                        </div>
                      )}

                      <div className="admin-reservation-actions refined">
                        <button
                          type="button"
                          className="admin-action-btn noshow"
                          onClick={() => handleNoShow(r.reservationId, r.customerName)}
                          disabled={
                            r.status === "NOSHOW" || processingNoShowId === r.reservationId
                          }
                        >
                          {processingNoShowId === r.reservationId
                            ? "처리 중..."
                            : r.status === "NOSHOW"
                            ? "노쇼 완료"
                            : "노쇼 체크"}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </section>
        </section>
      </div>
    </AdminLayout>
  );
}

export default AdminReservations;