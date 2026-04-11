import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/reservation.css";

function Reservation() {
  const treatmentOptions = [
    { id: 1, name: "리프팅", desc: "탄력 개선과 윤곽 정리" },
    { id: 2, name: "토닝", desc: "피부 톤 개선과 맑은 피부" },
    { id: 3, name: "보톡스", desc: "주름 개선과 라인 정리" },
    { id: 4, name: "제모", desc: "간편하고 깔끔한 관리" },
  ];

  const timeOptions = [
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
  ];

  const dayLabels = ["일", "월", "화", "수", "목", "금", "토"];

  const [form, setForm] = useState({
    treatmentId: "",
    reservationDate: "",
    reservationTime: "",
    customerName: "",
    phone: "",
  });

  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [unavailableTimes, setUnavailableTimes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = new Date();
  const todayDateOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const minMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const maxMonth = new Date(today.getFullYear(), today.getMonth() + 3, 1);

  const selectedTreatment = useMemo(() => {
    return treatmentOptions.find(
      (item) => item.id === Number(form.treatmentId)
    );
  }, [form.treatmentId]);

  const selectedDateTimeText = useMemo(() => {
    if (!form.reservationDate || !form.reservationTime) return "선택 전";
    return `${form.reservationDate} ${form.reservationTime}`;
  }, [form.reservationDate, form.reservationTime]);

  useEffect(() => {
    if (!form.reservationDate) {
      setUnavailableTimes([]);
      return;
    }

    axios
      .get("http://localhost:8080/reservations/unavailable", {
        params: { date: form.reservationDate },
      })
      .then((res) => {
        setUnavailableTimes(res.data);
      })
      .catch((err) => {
        console.error("예약 불가 시간 조회 실패:", err);
        setUnavailableTimes([]);
      });
  }, [form.reservationDate]);

  const handleTreatmentSelect = (id) => {
    setForm((prev) => ({
      ...prev,
      treatmentId: String(id),
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const buildReservationDatetime = () => {
    if (!form.reservationDate || !form.reservationTime) return "";
    return `${form.reservationDate}T${form.reservationTime}:00`;
  };

  const validateName = (name) => {
    const trimmedName = name.trim();
    return /^[가-힣a-zA-Z]{2,10}$/.test(trimmedName);
  };

  const validatePhone = (phone) => {
    const phoneOnly = phone.replace(/-/g, "").trim();
    return /^010\d{8}$/.test(phoneOnly);
  };

  const validateReservationDateTime = () => {
    if (!form.reservationDate || !form.reservationTime) return false;

    const selectedDateTime = new Date(
      `${form.reservationDate}T${form.reservationTime}:00`
    );
    const now = new Date();

    return selectedDateTime > now;
  };

  const validateForm = () => {
    if (!form.treatmentId) {
      alert("시술을 선택해주세요.");
      return false;
    }

    if (!form.reservationDate) {
      alert("예약 날짜를 선택해주세요.");
      return false;
    }

    if (!form.reservationTime) {
      alert("예약 시간을 선택해주세요.");
      return false;
    }

    if (!validateReservationDateTime()) {
      alert("현재 시간 이후로만 예약할 수 있습니다.");
      return false;
    }

    if (!form.customerName.trim()) {
      alert("이름을 입력해주세요.");
      return false;
    }

    if (!validateName(form.customerName)) {
      alert("이름은 한글 또는 영문 2~10자로 입력해주세요.");
      return false;
    }

    if (!form.phone.trim()) {
      alert("연락처를 입력해주세요.");
      return false;
    }

    if (!validatePhone(form.phone)) {
      alert("연락처는 010으로 시작하는 숫자 11자리로 입력해주세요.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const reservationDatetime = buildReservationDatetime();
    const normalizedPhone = form.phone.replace(/-/g, "").trim();

    try {
      setIsSubmitting(true);

      await axios.post("http://localhost:8080/reservations", {
        customerName: form.customerName.trim(),
        phone: normalizedPhone,
        treatmentId: Number(form.treatmentId),
        reservationDatetime,
      });

      alert("예약이 완료되었습니다.");

      setForm({
        treatmentId: "",
        reservationDate: "",
        reservationTime: "",
        customerName: "",
        phone: "",
      });

      setUnavailableTimes([]);
    } catch (error) {
      console.error("예약 등록 실패:", error);

      const message =
        error.response?.data?.message ||
        error.response?.data ||
        "예약 등록에 실패했습니다.";

      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const isSameDate = (a, b) => {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  };

  const isSameMonth = (a, b) => {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth()
    );
  };

  const canGoPrevMonth = !isSameMonth(currentMonth, minMonth);
  const canGoNextMonth = !isSameMonth(currentMonth, maxMonth);

  const changeMonth = (diff) => {
    const targetMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + diff,
      1
    );

    if (targetMonth < minMonth) return;
    if (targetMonth > maxMonth) return;

    setCurrentMonth(targetMonth);
  };

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

  const isPastDate = (date) => {
    return date < todayDateOnly;
  };

  const handleDateSelect = (date) => {
    if (!date || isPastDate(date)) return;

    setForm((prev) => ({
      ...prev,
      reservationDate: formatDate(date),
      reservationTime: "",
    }));
  };

  const isPastTime = (time) => {
    if (!form.reservationDate) return false;

    const selectedDate = new Date(`${form.reservationDate}T00:00:00`);
    const isToday = isSameDate(selectedDate, todayDateOnly);

    if (!isToday) return false;

    const [hour, minute] = time.split(":").map(Number);

    const slotDateTime = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      hour,
      minute,
      0
    );

    return slotDateTime <= new Date();
  };

  const isUnavailableTime = (time) => {
    return unavailableTimes.includes(time);
  };

  const isDisabledTime = (time) => {
    if (!form.reservationDate) return true;
    return isPastTime(time) || isUnavailableTime(time);
  };

  const handleTimeSelect = (time) => {
    if (isDisabledTime(time)) return;

    setForm((prev) => ({
      ...prev,
      reservationTime: time,
    }));
  };

  return (
    <div className="reservation-page">
      <Header />

      <div className="reservation-wrap">
        <h2 className="reservation-page-title"></h2>

        <form className="reservation-grid" onSubmit={handleSubmit}>
          <section className="reservation-panel">
            <div className="panel-head">
              <span className="step-text">STEP 01.</span>
              <h3>예약 시술 선택</h3>
            </div>

            <div className="treatment-list">
              {treatmentOptions.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={`treatment-card ${
                    Number(form.treatmentId) === item.id ? "selected" : ""
                  }`}
                  onClick={() => handleTreatmentSelect(item.id)}
                >
                  <strong>{item.name}</strong>
                  <p>{item.desc}</p>
                </button>
              ))}
            </div>

            <div className="summary-box">
              <p className="summary-label">선택한 시술</p>
              <strong className="summary-value">
                {selectedTreatment ? selectedTreatment.name : "선택 전"}
              </strong>
            </div>
          </section>

          <section className="reservation-panel">
            <div className="panel-head">
              <span className="step-text">STEP 02.</span>
              <h3>예약 날짜 · 시간 선택</h3>
            </div>

            <div className="calendar-box">
              <div className="calendar-header">
                <button
                  type="button"
                  className="calendar-nav-btn"
                  onClick={() => changeMonth(-1)}
                  disabled={!canGoPrevMonth}
                >
                  ‹
                </button>

                <strong>
                  {currentMonth.getFullYear()}.{" "}
                  {String(currentMonth.getMonth() + 1).padStart(2, "0")}
                </strong>

                <button
                  type="button"
                  className="calendar-nav-btn"
                  onClick={() => changeMonth(1)}
                  disabled={!canGoNextMonth}
                >
                  ›
                </button>
              </div>

              <div className="calendar-weekdays">
                {dayLabels.map((label, index) => (
                  <span
                    key={label}
                    className={
                      index === 0 ? "sun" : index === 6 ? "sat" : ""
                    }
                  >
                    {label}
                  </span>
                ))}
              </div>

              <div className="calendar-grid">
                {calendarDays.map((date, index) => {
                  if (!date) {
                    return (
                      <button
                        key={`empty-${index}`}
                        type="button"
                        className="calendar-day empty"
                        disabled
                      />
                    );
                  }

                  const formattedDate = formatDate(date);
                  const isSelected = form.reservationDate === formattedDate;
                  const disabled = isPastDate(date);

                  return (
                    <button
                      key={formattedDate}
                      type="button"
                      className={`calendar-day ${isSelected ? "selected" : ""}`}
                      disabled={disabled}
                      onClick={() => handleDateSelect(date)}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="time-slot-box">
              {timeOptions.map((time) => {
                const disabled = isDisabledTime(time);
                const selected = form.reservationTime === time;

                return (
                  <button
                    type="button"
                    key={time}
                    className={`time-slot-btn ${selected ? "selected" : ""}`}
                    disabled={disabled}
                    onClick={() => handleTimeSelect(time)}
                  >
                    {time}
                  </button>
                );
              })}
            </div>

            <div className="summary-box">
              <p className="summary-label">선택한 예약 시간</p>
              <strong className="summary-value">{selectedDateTimeText}</strong>
            </div>
          </section>

          <section className="reservation-panel">
            <div className="panel-head">
              <span className="step-text">STEP 03.</span>
              <h3>고객 정보 입력</h3>
            </div>

            <div className="field-block">
              <label>고객명</label>
              <input
                type="text"
                name="customerName"
                value={form.customerName}
                onChange={handleChange}
                placeholder="성함을 입력해주세요"
              />
            </div>

            <div className="field-block">
              <label>연락처</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="연락처를 입력해주세요"
              />
            </div>

            <div className="notice-box">
              결제는 내원시 이루어집니다.
              <br />
              대표원장님 시술을 원하실 경우 특진비가 별도로 발생됩니다.
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "예약 처리 중..." : "시술 예약"}
            </button>
          </section>
        </form>
      </div>
      <Footer />
    </div>
  );
}

export default Reservation;