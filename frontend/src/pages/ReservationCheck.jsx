import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/reservation-check.css";

function ReservationCheck() {
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

  const delayOptions = [
    { value: "5", label: "5분 정도 늦어요" },
    { value: "10", label: "10분 정도 늦어요" },
    { value: "15", label: "15분 정도 늦어요" },
    { value: "20", label: "20분 이상 늦어요" },
  ];

  const dayLabels = ["일", "월", "화", "수", "목", "금", "토"];

  const [form, setForm] = useState({
    customerName: "",
    phone: "",
  });

  const [reservations, setReservations] = useState([]);
  const [searched, setSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isCancellingId, setIsCancellingId] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [changeForm, setChangeForm] = useState({
    reservationDate: "",
    reservationTime: "",
  });
  const [changeCurrentMonth, setChangeCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [changeUnavailableTimes, setChangeUnavailableTimes] = useState([]);
  const [isChanging, setIsChanging] = useState(false);

  const [isDelayModalOpen, setIsDelayModalOpen] = useState(false);
  const [delayReservation, setDelayReservation] = useState(null);
  const [delayForm, setDelayForm] = useState({
    delayMinutes: "",
    delayDetail: "",
  });
  const [isSendingDelay, setIsSendingDelay] = useState(false);

  const today = new Date();
  const todayDateOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const minMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const maxMonth = new Date(today.getFullYear(), today.getMonth() + 3, 1);

  const normalizePhone = (phone) => phone.replace(/-/g, "").trim();

  const validateName = (name) => {
    const trimmedName = name.trim();
    return /^[가-힣a-zA-Z]{2,10}$/.test(trimmedName);
  };

  const validatePhone = (phone) => {
    const phoneOnly = normalizePhone(phone);
    return /^010\d{8}$/.test(phoneOnly);
  };

  const formatPhone = (phone) => {
    const only = normalizePhone(phone);

    if (only.length !== 11) return phone;
    return `${only.slice(0, 3)}-${only.slice(3, 7)}-${only.slice(7)}`;
  };

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "-";

    const date = new Date(dateTime);
    if (Number.isNaN(date.getTime())) return dateTime;

    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");

    return `${y}-${m}-${d} ${hh}:${mm}`;
  };

  const getDateFromDateTime = (dateTime) => {
    if (!dateTime) return "";
    const date = new Date(dateTime);
    if (Number.isNaN(date.getTime())) return "";
    return formatDate(date);
  };

  const getTimeFromDateTime = (dateTime) => {
    if (!dateTime) return "";
    const date = new Date(dateTime);
    if (Number.isNaN(date.getTime())) return "";
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
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

  const canGoPrevMonth = !isSameMonth(changeCurrentMonth, minMonth);
  const canGoNextMonth = !isSameMonth(changeCurrentMonth, maxMonth);

  const changeMonth = (diff) => {
    const targetMonth = new Date(
      changeCurrentMonth.getFullYear(),
      changeCurrentMonth.getMonth() + diff,
      1
    );

    if (targetMonth < minMonth) return;
    if (targetMonth > maxMonth) return;

    setChangeCurrentMonth(targetMonth);
  };

  const calendarDays = useMemo(() => {
    const year = changeCurrentMonth.getFullYear();
    const month = changeCurrentMonth.getMonth();

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
  }, [changeCurrentMonth]);

  useEffect(() => {
    if (!isModalOpen || !changeForm.reservationDate) {
      setChangeUnavailableTimes([]);
      return;
    }

    axios
      .get("http://localhost:8080/reservations/unavailable", {
        params: { date: changeForm.reservationDate },
      })
      .then((res) => {
        setChangeUnavailableTimes(res.data || []);
      })
      .catch((err) => {
        console.error("예약 변경용 불가 시간 조회 실패:", err);
        setChangeUnavailableTimes([]);
      });
  }, [isModalOpen, changeForm.reservationDate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateSearchForm = () => {
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

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!validateSearchForm()) return;

    try {
      setIsSearching(true);

      const res = await axios.post("http://localhost:8080/reservations/search", {
        customerName: form.customerName.trim(),
        phone: normalizePhone(form.phone),
      });

      setReservations(Array.isArray(res.data) ? res.data : []);
      setSearched(true);
    } catch (error) {
      console.error("예약 조회 실패:", error);
      const message =
        error.response?.data?.message || "예약 조회 중 오류가 발생했습니다.";
      alert(message);
      setReservations([]);
      setSearched(true);
    } finally {
      setIsSearching(false);
    }
  };

  const upcomingReservations = useMemo(() => {
    return reservations.filter((item) => {
      if (!item?.reservationDatetime) return false;
      return new Date(item.reservationDatetime) >= new Date();
    });
  }, [reservations]);

  const getStatusLabel = (status) => {
    switch (status) {
      case "RESERVED":
        return "예약완료";
      case "CANCELLED":
        return "취소됨";
      case "DONE":
        return "방문완료";
      default:
        return status || "상태확인";
    }
  };

  const getTreatmentLabel = (treatmentId) => {
    switch (Number(treatmentId)) {
      case 1:
        return "리프팅";
      case 2:
        return "토닝";
      case 3:
        return "보톡스";
      case 4:
        return "제모";
      default:
        return `시술 ${treatmentId}`;
    }
  };

  const handleCancel = async (reservationId) => {
    const confirmed = window.confirm("해당 예약을 취소하시겠습니까?");
    if (!confirmed) return;

    try {
      setIsCancellingId(reservationId);

      const res = await axios.delete(
        `http://localhost:8080/reservations/${reservationId}`
      );

      alert(res.data?.message || "예약이 취소되었습니다.");

      setReservations((prev) =>
        prev.filter((item) => item.reservationId !== reservationId)
      );
    } catch (error) {
      console.error("예약 취소 실패:", error);
      const message =
        error.response?.data?.message || "예약 취소 중 오류가 발생했습니다.";
      alert(message);
    } finally {
      setIsCancellingId(null);
    }
  };

  const openChangeModal = (reservation) => {
    const reservationDate = getDateFromDateTime(reservation.reservationDatetime);
    const reservationTime = getTimeFromDateTime(reservation.reservationDatetime);

    const baseDate = reservationDate
      ? new Date(`${reservationDate}T00:00:00`)
      : new Date();

    setSelectedReservation(reservation);
    setChangeForm({
      reservationDate,
      reservationTime,
    });
    setChangeCurrentMonth(
      new Date(baseDate.getFullYear(), baseDate.getMonth(), 1)
    );
    setIsModalOpen(true);
  };

  const closeChangeModal = () => {
    setIsModalOpen(false);
    setSelectedReservation(null);
    setChangeForm({
      reservationDate: "",
      reservationTime: "",
    });
    setChangeUnavailableTimes([]);
  };

  const openDelayModal = (reservation) => {
    setDelayReservation(reservation);
    setDelayForm({
      delayMinutes: "",
      delayDetail: "",
    });
    setIsDelayModalOpen(true);
  };

  const closeDelayModal = () => {
    setIsDelayModalOpen(false);
    setDelayReservation(null);
    setDelayForm({
      delayMinutes: "",
      delayDetail: "",
    });
  };

  const isPastDate = (date) => {
    return date < todayDateOnly;
  };

  const handleDateSelect = (date) => {
    if (!date || isPastDate(date)) return;

    setChangeForm((prev) => ({
      ...prev,
      reservationDate: formatDate(date),
      reservationTime: "",
    }));
  };

  const isPastTime = (time) => {
    if (!changeForm.reservationDate) return false;

    const selectedDate = new Date(`${changeForm.reservationDate}T00:00:00`);
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
    if (!selectedReservation) return false;

    const originalDate = getDateFromDateTime(selectedReservation.reservationDatetime);
    const originalTime = getTimeFromDateTime(selectedReservation.reservationDatetime);

    if (
      changeForm.reservationDate === originalDate &&
      time === originalTime
    ) {
      return false;
    }

    return changeUnavailableTimes.includes(time);
  };

  const isDisabledTime = (time) => {
    if (!changeForm.reservationDate) return true;
    return isPastTime(time) || isUnavailableTime(time);
  };

  const handleTimeSelect = (time) => {
    if (isDisabledTime(time)) return;

    setChangeForm((prev) => ({
      ...prev,
      reservationTime: time,
    }));
  };

  const validateChangeForm = () => {
    if (!changeForm.reservationDate) {
      alert("변경할 날짜를 선택해주세요.");
      return false;
    }

    if (!changeForm.reservationTime) {
      alert("변경할 시간을 선택해주세요.");
      return false;
    }

    const selectedDateTime = new Date(
      `${changeForm.reservationDate}T${changeForm.reservationTime}:00`
    );

    if (!(selectedDateTime > new Date())) {
      alert("현재 시간 이후로만 변경할 수 있습니다.");
      return false;
    }

    return true;
  };

  const handleChangeSubmit = async () => {
    if (!selectedReservation) return;
    if (!validateChangeForm()) return;

    const originalDate = getDateFromDateTime(selectedReservation.reservationDatetime);
    const originalTime = getTimeFromDateTime(selectedReservation.reservationDatetime);

    if (
      changeForm.reservationDate === originalDate &&
      changeForm.reservationTime === originalTime
    ) {
      alert("기존 예약과 동일한 날짜와 시간입니다.");
      return;
    }

    const reservationDatetime = `${changeForm.reservationDate}T${changeForm.reservationTime}:00`;

    try {
      setIsChanging(true);

      const res = await axios.put(
        `http://localhost:8080/reservations/${selectedReservation.reservationId}`,
        {
          reservationDatetime,
        }
      );

      alert(res.data?.message || "예약이 변경되었습니다.");

setReservations((prev) =>
  prev.map((item) =>
    item.reservationId === selectedReservation.reservationId
      ? {
          ...item,
          reservationDatetime,
          delayStatus: "N",
          delayMessage: null,
        }
      : item
  )
);

      closeChangeModal();
    } catch (error) {
      console.error("예약 변경 실패:", error);
      const message =
        error.response?.data?.message ||
        "예약 변경 중 오류가 발생했습니다.";
      alert(message);
    } finally {
      setIsChanging(false);
    }
  };

  const handleDelayOptionClick = (minutes) => {
    setDelayForm((prev) => ({
      ...prev,
      delayMinutes: minutes,
    }));
  };

  const handleDelayDetailChange = (e) => {
    const { value } = e.target;

    if (value.length > 50) return;

    setDelayForm((prev) => ({
      ...prev,
      delayDetail: value,
    }));
  };

  const buildDelayMessage = () => {
    const selected = delayOptions.find(
      (item) => item.value === delayForm.delayMinutes
    );

    if (!selected) return "";

    const detail = delayForm.delayDetail.trim();
    if (!detail) return selected.label;

    return `${selected.label} / ${detail}`;
  };

  const handleDelaySubmit = async () => {
    if (!delayReservation) return;

    if (!delayForm.delayMinutes) {
      alert("예상 지연 시간을 선택해주세요.");
      return;
    }

    const delayMessage = buildDelayMessage();

    try {
      setIsSendingDelay(true);

      const res = await axios.post(
        `http://localhost:8080/reservations/${delayReservation.reservationId}/delay`,
        {
          delayMinutes: Number(delayForm.delayMinutes),
          delayMessage,
        }
      );

      alert(res.data?.message || "지연 알림이 전달되었습니다.");

      setReservations((prev) =>
        prev.map((item) =>
          item.reservationId === delayReservation.reservationId
            ? {
                ...item,
                delayStatus: "Y",
                delayMessage,
              }
            : item
        )
      );

      closeDelayModal();
    } catch (error) {
      console.error("지연 알림 전송 실패:", error);
      const message =
        error.response?.data?.message || "지연 알림 전송 중 오류가 발생했습니다.";
      alert(message);
    } finally {
      setIsSendingDelay(false);
    }
  };

  return (
    <div className="reservation-check-page">
      <Header />

      <div className="reservation-check-wrap">
        <div className="reservation-check-hero">
          <p className="reservation-check-kicker">RESERVATION CHECK</p>
          <h2></h2>
          <p className="reservation-check-desc"></p>
        </div>

        <div className="reservation-check-grid two-columns">
          <section className="reservation-check-panel search-panel">
            <div className="panel-head">
              <span className="step-text">STEP 01.</span>
              <h3>예약 정보 조회</h3>
            </div>

            <form onSubmit={handleSearch}>
              <div className="field-block">
                <label>고객명</label>
                <input
                  type="text"
                  name="customerName"
                  value={form.customerName}
                  onChange={handleInputChange}
                  placeholder="성함을 입력해주세요"
                />
              </div>

              <div className="field-block">
                <label>연락처</label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleInputChange}
                  placeholder="연락처를 입력해주세요"
                />
              </div>

              <div className="notice-box">
                예약 시 입력한 이름과 연락처로 조회해주세요.
                <br />
                예약 변경은 기존 예약 확인 후 진행하실 수 있습니다.
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={isSearching}
              >
                {isSearching ? "조회 중..." : "예약 조회"}
              </button>
            </form>

            <div className="summary-box">
              <p className="summary-label">조회 정보</p>
              <strong className="summary-value">
                {form.customerName?.trim() && form.phone?.trim()
                  ? `${form.customerName.trim()} / ${formatPhone(form.phone)}`
                  : "조회 전"}
              </strong>
            </div>
          </section>

          <section className="reservation-check-panel result-panel">
            <div className="panel-head">
              <span className="step-text">STEP 02.</span>
              <h3>예정된 예약</h3>
            </div>

            {!searched && (
              <div className="empty-box">
                이름과 연락처를 입력한 뒤 예약을 조회해주세요.
              </div>
            )}

            {searched && upcomingReservations.length === 0 && (
              <div className="empty-box">
                예정된 예약 내역이 없습니다.
              </div>
            )}

            {upcomingReservations.length > 0 && (
              <div className="reservation-card-list">
                {upcomingReservations.map((item) => (
                  <article className="reservation-card" key={item.reservationId}>
                    <div className="reservation-card-top">
                      <div>
                        <p className="reservation-card-label">시술명</p>
                        <strong className="reservation-card-title">
                          {getTreatmentLabel(item.treatmentId)}
                        </strong>
                      </div>

                      <span className="status-badge">
                        {getStatusLabel(item.status)}
                      </span>
                    </div>

                    <div className="reservation-info-list">
                      <div className="reservation-info-item">
                        <span>예약 일시</span>
                        <strong>{formatDateTime(item.reservationDatetime)}</strong>
                      </div>

                      <div className="reservation-info-item">
                        <span>예약자</span>
                        <strong>{item.customerName}</strong>
                      </div>

                      <div className="reservation-info-item">
                        <span>연락처</span>
                        <strong>{formatPhone(item.phone)}</strong>
                      </div>
                    </div>

                    {item.delayStatus === "Y" && (
                      <div className="delay-box">
                        <strong>지연 알림 전송됨</strong>
                        <p>{item.delayMessage || "늦는다는 알림이 전달되었습니다."}</p>
                      </div>
                    )}

                    <div className="reservation-action-row three-buttons">
                    <button
                    type="button"
                    className="action-btn tertiary"
                    onClick={() => openDelayModal(item)}
                    disabled={item.delayStatus === "Y"}
                    >
                    {item.delayStatus === "Y" ? "지연 알림 전달됨" : "지연 알림 보내기"}
                    </button>

                      <button
                        type="button"
                        className="action-btn secondary"
                        onClick={() => openChangeModal(item)}
                      >
                        예약 변경
                      </button>

                      <button
                        type="button"
                        className="action-btn danger"
                        onClick={() => handleCancel(item.reservationId)}
                        disabled={isCancellingId === item.reservationId}
                      >
                        {isCancellingId === item.reservationId
                          ? "취소 처리 중..."
                          : "예약 취소"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {isModalOpen && selectedReservation && (
        <div className="modal-overlay" onClick={closeChangeModal}>
          <div
            className="change-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="change-modal-head">
              <div>
                <p className="modal-kicker">RESERVATION CHANGE</p>
                <h3></h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={closeChangeModal}
              >
                ×
              </button>
            </div>

            <div className="change-current-box">
              <p className="change-current-label">현재 예약</p>
              <strong>
                {getTreatmentLabel(selectedReservation.treatmentId)} /{" "}
                {formatDateTime(selectedReservation.reservationDatetime)}
              </strong>
            </div>

            <div className="change-modal-section">
              <div className="calendar-box modal-calendar-box">
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
                    {changeCurrentMonth.getFullYear()}.{" "}
                    {String(changeCurrentMonth.getMonth() + 1).padStart(2, "0")}
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
                    const isSelected = changeForm.reservationDate === formattedDate;
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

              <div className="time-slot-box modal-time-slot-box">
                {timeOptions.map((time) => {
                  const disabled = isDisabledTime(time);
                  const selected = changeForm.reservationTime === time;

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

              <div className="summary-box modal-summary-box">
                <p className="summary-label">변경할 예약 시간</p>
                <strong className="summary-value">
                  {changeForm.reservationDate && changeForm.reservationTime
                    ? `${changeForm.reservationDate} ${changeForm.reservationTime}`
                    : "선택 전"}
                </strong>
              </div>
            </div>

            <div className="notice-box modal-notice-box">
              이미 예약된 시간은 선택할 수 없습니다.
              <br />
              현재 시간 이후 예약만 변경 가능합니다.
            </div>

            <div className="modal-action-row">
              <button
                type="button"
                className="action-btn secondary"
                onClick={closeChangeModal}
                disabled={isChanging}
              >
                닫기
              </button>

              <button
                type="button"
                className="action-btn danger"
                onClick={handleChangeSubmit}
                disabled={isChanging}
              >
                {isChanging ? "변경 처리 중..." : "변경 확인"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isDelayModalOpen && delayReservation && (
        <div className="modal-overlay" onClick={closeDelayModal}>
          <div
            className="change-modal delay-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="change-modal-head">
              <div>
                <p className="modal-kicker">DELAY NOTICE</p>
                <h3></h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={closeDelayModal}
              >
                ×
              </button>
            </div>

            <div className="change-current-box">
              <p className="change-current-label">대상 예약</p>
              <strong>
                {getTreatmentLabel(delayReservation.treatmentId)} /{" "}
                {formatDateTime(delayReservation.reservationDatetime)}
              </strong>
            </div>

            <div className="delay-option-list">
              {delayOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`delay-option-btn ${
                    delayForm.delayMinutes === option.value ? "selected" : ""
                  }`}
                  onClick={() => handleDelayOptionClick(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="field-block delay-textarea-block">
              <label>추가 메시지 (선택)</label>
              <textarea
                value={delayForm.delayDetail}
                onChange={handleDelayDetailChange}
                placeholder="예: 길이 막혀서 조금 늦을 것 같습니다."
                maxLength={50}
              />
              <p className="delay-text-count">{delayForm.delayDetail.length}/50</p>
            </div>

            <div className="notice-box modal-notice-box">
              20분 이상 지연 시 예약이 취소될 수 있습니다.
              <br />
              정확한 일정은 병원 운영 상황에 따라 달라질 수 있습니다.
            </div>

            <div className="modal-action-row">
              <button
                type="button"
                className="action-btn secondary"
                onClick={closeDelayModal}
                disabled={isSendingDelay}
              >
                닫기
              </button>

              <button
                type="button"
                className="action-btn tertiary filled"
                onClick={handleDelaySubmit}
                disabled={isSendingDelay}
              >
                {isSendingDelay ? "전송 중..." : "지연 알림 보내기"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default ReservationCheck;